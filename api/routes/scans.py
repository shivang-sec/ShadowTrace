"""
Scan job routes.

POST /api/scans          — submit a new assessment
GET  /api/scans/{job_id} — poll job status
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from api.models import ScanJob, ScanRequest
from api.services import scan_service

router = APIRouter(prefix="/api/scans", tags=["scans"])


@router.post(
    "",
    response_model=ScanJob,
    status_code=202,
    summary="Start a new network assessment",
    responses={
        202: {"description": "Scan job accepted and queued."},
        422: {"description": "Invalid target or profile."},
    },
)
async def start_scan(request: ScanRequest) -> ScanJob:
    """
    Submit a scan job for the given target and profile.

    The assessment runs asynchronously.  Poll **GET /api/scans/{job_id}**
    to track progress.  When ``status`` is ``completed``, use the returned
    ``report_id`` with **GET /api/reports/{report_id}** to retrieve the full
    assessment.

    **Authorized use only** — only scan targets you have explicit permission
    to assess.
    """
    return await scan_service.submit_scan(request.target, request.profile)


@router.get(
    "/{scan_id}",
    response_model=ScanJob,
    summary="Retrieve scan job status",
    responses={
        200: {"description": "Current job state."},
        404: {"description": "Job ID not found."},
    },
)
async def get_scan_status(scan_id: str) -> ScanJob:
    """
    Return the current lifecycle state of a scan job.

    Poll this endpoint until ``status`` is ``completed`` or ``failed``.
    Typical polling interval: 2–5 seconds.
    """
    job = scan_service.get_job(scan_id)
    if job is None:
        raise HTTPException(
            status_code=404,
            detail=f"Scan job '{scan_id}' not found.",
        )
    return job
