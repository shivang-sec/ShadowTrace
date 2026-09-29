"""
Report routes.

GET    /api/reports            — list all completed assessments (summaries)
GET    /api/reports/{id}       — retrieve one full assessment
DELETE /api/reports/{id}       — remove a stored report
"""

from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from api.services import scan_service

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get(
    "",
    summary="List completed assessments",
    responses={200: {"description": "Array of report summaries, newest first."}},
)
async def list_reports() -> list:
    """
    Return a summary list of all completed assessments.

    Each entry contains ``report_id``, ``target``, ``profile``,
    ``timestamp``, ``host_count``, ``overall_risk``, and
    ``exposure_score``.
    """
    return scan_service.list_reports()


@router.get(
    "/{report_id}",
    summary="Retrieve a full assessment report",
    responses={
        200: {"description": "Complete assessment JSON."},
        404: {"description": "Report not found."},
    },
)
async def get_report(report_id: str) -> dict:
    """
    Return the complete assessment JSON for the given report ID.

    The response is the full output of the ShadowTrace engine, including
    per-host service analysis, security baseline findings, vulnerability
    intelligence, and NVD CVE correlation results with applicability
    assessments.

    CVE matches are keyword correlations from the NVD database and are
    **not** confirmed vulnerabilities.  Applicability is estimated from
    advisory text — always verify manually.
    """
    report = scan_service.get_report(report_id)
    if report is None:
        raise HTTPException(
            status_code=404,
            detail=f"Report '{report_id}' not found.",
        )
    return report


@router.delete(
    "/{report_id}",
    status_code=204,
    summary="Delete a stored report",
    responses={
        204: {"description": "Report deleted."},
        404: {"description": "Report not found."},
    },
)
async def delete_report(report_id: str) -> None:
    """Remove a report file and its index entry."""
    deleted = scan_service.delete_report(report_id)
    if not deleted:
        raise HTTPException(
            status_code=404,
            detail=f"Report '{report_id}' not found.",
        )


@router.get(
    "/{report_id}/export",
    summary="Download report as a JSON file",
    response_class=FileResponse,
    responses={
        200: {"description": "Raw JSON file download."},
        404: {"description": "Report not found."},
    },
)
async def export_report(report_id: str) -> FileResponse:
    """Return the raw JSON report file as a downloadable attachment."""
    report_path = scan_service.REPORTS_DIR / f"{report_id}.json"
    if not report_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Report '{report_id}' not found.",
        )
    return FileResponse(
        path=str(report_path),
        media_type="application/json",
        filename=f"shadowtrace-{report_id}.json",
    )
