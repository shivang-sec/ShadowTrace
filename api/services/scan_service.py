"""
ShadowTrace engine adapter and scan job lifecycle manager.

Responsibilities
----------------
- Accept scan requests and return immediately with a job record.
- Execute the blocking ShadowTrace assessment pipeline inside a
  ThreadPoolExecutor so FastAPI's event loop is never stalled.
- Track in-flight and completed job state in an in-memory registry.
- Persist completed assessment JSON files under reports/.
- Provide query helpers for routes to call.

What this module does NOT do
-----------------------------
- It does not re-implement any scanning, risk-scoring, or CVE logic.
- All computation is delegated directly to the existing shadowtrace/
  engine modules.
"""

from __future__ import annotations

import asyncio
import json
import logging
import uuid
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

from shadowtrace.core.risk import calculate_host_score
from shadowtrace.modules.baseline import run_baseline
from shadowtrace.modules.cve import lookup_service
from shadowtrace.modules.discovery import NetworkDiscovery
from shadowtrace.modules.intelligence import run_intelligence

from api.models import ScanJob, ScanProfile, ScanStatus

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# In-process job registry
# ---------------------------------------------------------------------------
# Keyed by job_id (UUID string).  Individual dict reads/writes are
# GIL-atomic in CPython, which is sufficient for a single-process,
# local-first deployment.  Multi-process workers would require a
# shared store (e.g. Redis) — outside the current scope.
_jobs: dict[str, ScanJob] = {}

# Thread pool that runs blocking nmap subprocesses without stalling the loop.
_executor = ThreadPoolExecutor(
    max_workers=4,
    thread_name_prefix="shadowtrace-scan",
)

# ---------------------------------------------------------------------------
# Report persistence
# ---------------------------------------------------------------------------
REPORTS_DIR = Path("reports")
_INDEX_FILE = REPORTS_DIR / "index.json"


def _ensure_reports_dir() -> None:
    """Create the reports directory and a blank index if absent."""
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    if not _INDEX_FILE.exists():
        _INDEX_FILE.write_text("[]", encoding="utf-8")


def _load_index() -> list[dict]:
    """Return the report index, or an empty list on any read/parse error."""
    try:
        return json.loads(_INDEX_FILE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, FileNotFoundError):
        return []


def _save_index(index: list[dict]) -> None:
    _INDEX_FILE.write_text(json.dumps(index, indent=2), encoding="utf-8")


# ---------------------------------------------------------------------------
# Assessment assembly
# ---------------------------------------------------------------------------
_RISK_PRIORITY: dict[str, int] = {
    "CRITICAL": 4,
    "HIGH": 3,
    "MEDIUM": 2,
    "LOW": 1,
}


def _build_assessment(
    results: list[dict],
    target: str,
    profile: str,
) -> dict:
    """
    Assemble a full ShadowTrace assessment dict.

    Calls each engine module function in sequence; no logic is duplicated.
    The structure mirrors the output of ``build_assessment()`` in the CLI
    (__main__.py) so that existing consumers of the JSON format are unaffected.
    """
    hosts: list[dict] = []

    for host in results:
        services = host.get("services", [])
        hosts.append(
            {
                "host": host,
                "analysis": calculate_host_score(host),
                "baseline": run_baseline(host),
                "intelligence": run_intelligence(host),
                "cve_intelligence": [
                    lookup_service(svc) for svc in services
                ],
            }
        )

    return {
        "tool": "ShadowTrace",
        "version": "1.0",
        "timestamp": datetime.now(timezone.utc).astimezone().isoformat(),
        "target": target,
        "profile": profile,
        "hosts": hosts,
    }


def _extract_summary(assessment: dict, report_id: str) -> dict:
    """
    Derive a compact index entry from a full assessment.

    Overall risk is the highest individual host risk level.
    Exposure score is the highest individual host score (capped at 100
    by the engine).
    """
    hosts = assessment.get("hosts", [])
    analyses = [h["analysis"] for h in hosts if "analysis" in h]

    scores = [a["score"] for a in analyses]
    levels = [a["level"] for a in analyses]

    return {
        "report_id": report_id,
        "target": assessment["target"],
        "profile": assessment["profile"],
        "timestamp": assessment["timestamp"],
        "host_count": len(hosts),
        "overall_risk": (
            max(levels, key=lambda lvl: _RISK_PRIORITY.get(lvl, 0))
            if levels
            else "LOW"
        ),
        "exposure_score": max(scores, default=0),
    }


def _persist_report(report_id: str, assessment: dict) -> None:
    """Write the full report JSON and prepend a summary entry to the index."""
    _ensure_reports_dir()

    # Full report
    report_path = REPORTS_DIR / f"{report_id}.json"
    report_path.write_text(
        json.dumps({**assessment, "report_id": report_id}, indent=2),
        encoding="utf-8",
    )

    # Index — newest first
    index = _load_index()
    index.insert(0, _extract_summary(assessment, report_id))
    _save_index(index)


# ---------------------------------------------------------------------------
# Blocking scan worker — runs inside the thread pool
# ---------------------------------------------------------------------------

def _run_scan_sync(job_id: str, target: str, profile: str) -> None:
    """
    Execute the full ShadowTrace assessment pipeline synchronously.

    Must not use async/await — it runs in a ThreadPoolExecutor worker.
    Job state is written back to ``_jobs`` so FastAPI status endpoints
    can reflect progress without coupling to a message queue.
    """
    if job_id not in _jobs:
        logger.error("_run_scan_sync: job %s not found in registry", job_id)
        return

    try:
        # ── Stage 1: Nmap host/service discovery ─────────────────────────
        _jobs[job_id] = _jobs[job_id].model_copy(
            update={"status": ScanStatus.running, "stage": "discovery"}
        )
        logger.info(
            "Scan %s — discovery started (target=%s, profile=%s)",
            job_id, target, profile,
        )

        scanner = NetworkDiscovery(profile)
        results = scanner.scan(target)

        logger.info(
            "Scan %s — discovery complete: %d host(s) found",
            job_id, len(results),
        )

        # ── Stage 2: Risk / baseline / intelligence / CVE analysis ───────
        _jobs[job_id] = _jobs[job_id].model_copy(
            update={"stage": "analysis"}
        )
        logger.info("Scan %s — running analysis pipeline", job_id)

        assessment = _build_assessment(results, target, profile)

        # ── Persist ───────────────────────────────────────────────────────
        report_id = str(uuid.uuid4())
        _persist_report(report_id, assessment)

        # ── Complete ──────────────────────────────────────────────────────
        _jobs[job_id] = _jobs[job_id].model_copy(
            update={
                "status": ScanStatus.completed,
                "stage": "complete",
                "completed_at": datetime.now(timezone.utc),
                "report_id": report_id,
            }
        )
        logger.info(
            "Scan %s complete — report_id=%s", job_id, report_id
        )

    except Exception as exc:
        logger.exception("Scan %s failed: %s", job_id, exc)
        _jobs[job_id] = _jobs[job_id].model_copy(
            update={
                "status": ScanStatus.failed,
                "stage": None,
                "completed_at": datetime.now(timezone.utc),
                "error": str(exc),
            }
        )


# ---------------------------------------------------------------------------
# Public interface used by route handlers
# ---------------------------------------------------------------------------

async def submit_scan(target: str, profile: ScanProfile) -> ScanJob:
    """
    Register a new scan job and submit it to the thread pool.

    Returns the initial ``ScanJob`` (status=queued) immediately.
    Progress is tracked by polling ``get_job(job_id)``.
    """
    job_id = str(uuid.uuid4())
    job = ScanJob(
        job_id=job_id,
        status=ScanStatus.queued,
        stage=None,
        target=target,
        profile=profile,
        created_at=datetime.now(timezone.utc),
    )
    _jobs[job_id] = job

    # Deliberately not awaited — fire-and-forget into the thread pool.
    # The future is not needed; all state is managed through _jobs.
    asyncio.get_running_loop().run_in_executor(
        _executor,
        _run_scan_sync,
        job_id,
        target,
        profile.value,
    )

    logger.info(
        "Scan job %s queued (target=%s, profile=%s)",
        job_id, target, profile.value,
    )
    return job


def get_job(job_id: str) -> ScanJob | None:
    """Return the current state of a scan job, or None if unknown."""
    return _jobs.get(job_id)


def list_reports() -> list[dict]:
    """Return all report summaries (newest first)."""
    _ensure_reports_dir()
    return _load_index()


def get_report(report_id: str) -> dict | None:
    """
    Load and return a full assessment report.

    Returns None if the report file does not exist or cannot be parsed.
    """
    report_path = REPORTS_DIR / f"{report_id}.json"
    if not report_path.exists():
        return None
    try:
        return json.loads(report_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        logger.error("Failed to parse report file: %s", report_path)
        return None


def delete_report(report_id: str) -> bool:
    """
    Remove a report file and its index entry.

    Returns True if the report existed and was deleted, False otherwise.
    """
    report_path = REPORTS_DIR / f"{report_id}.json"
    if not report_path.exists():
        return False

    report_path.unlink()

    # Remove from index
    index = _load_index()
    updated = [entry for entry in index if entry.get("report_id") != report_id]
    _save_index(updated)

    logger.info("Report %s deleted.", report_id)
    return True
