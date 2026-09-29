"""
Pydantic data models for the ShadowTrace API.

These types describe the API surface only — no scanning, risk, or CVE
logic lives here.  All computation is delegated to the shadowtrace/ engine.
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field, field_validator


class ScanProfile(str, Enum):
    """Nmap scan depth profile accepted by NetworkDiscovery."""

    quick = "quick"
    standard = "standard"
    deep = "deep"


class ScanStatus(str, Enum):
    """Lifecycle state of a scan job."""

    queued = "queued"
    running = "running"
    completed = "completed"
    failed = "failed"


class ScanRequest(BaseModel):
    """Request body for POST /api/scans."""

    target: str = Field(
        ...,
        description=(
            "Authorized IP address, hostname, or CIDR range "
            "(e.g. 192.168.1.0/24).  Only scan targets you are "
            "explicitly authorized to assess."
        ),
        examples=["127.0.0.1", "192.168.1.0/24"],
    )
    profile: ScanProfile = Field(
        ScanProfile.standard,
        description="Scan depth: quick, standard, or deep.",
    )

    @field_validator("target")
    @classmethod
    def validate_target(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("target must not be empty.")
        if len(value) > 256:
            raise ValueError("target exceeds the maximum allowed length.")
        # Reject obvious shell-injection characters.
        forbidden = set(';&|`$><!')
        if any(ch in forbidden for ch in value):
            raise ValueError(
                "target contains disallowed characters: "
                + ", ".join(repr(c) for c in forbidden if c in value)
            )
        return value


class ScanJob(BaseModel):
    """Represents a scan job and its current lifecycle state."""

    job_id: str = Field(description="Unique job identifier (UUID).")
    status: ScanStatus
    stage: str | None = Field(
        None,
        description=(
            "Current pipeline stage: discovery | analysis | complete.  "
            "Null when queued or failed."
        ),
    )
    target: str
    profile: ScanProfile
    created_at: datetime
    completed_at: datetime | None = None
    report_id: str | None = Field(
        None,
        description="Populated when status == completed.",
    )
    error: str | None = Field(
        None,
        description="Error message when status == failed.",
    )


class ReportSummary(BaseModel):
    """Compact report metadata returned by GET /api/reports."""

    report_id: str
    target: str
    profile: str
    timestamp: str
    host_count: int
    overall_risk: str
    exposure_score: int


class ErrorDetail(BaseModel):
    """Structured error response body used by 4xx/5xx responses."""

    detail: str
