"""
ShadowTrace FastAPI application.

Start the server from the project root (where api/ and shadowtrace/ live):

    uvicorn api.main:app --host 127.0.0.1 --port 8000 --reload

On Kali Linux, nmap SYN scanning requires elevated privileges.
Run the server with the appropriate permissions for your environment:

    sudo -E uvicorn api.main:app --host 0.0.0.0 --port 8000

Interactive documentation (when the server is running):
    Swagger UI : http://localhost:8000/api/docs
    ReDoc      : http://localhost:8000/api/redoc
"""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import reports, scans

app = FastAPI(
    title="ShadowTrace API",
    description=(
        "REST API adapter for the ShadowTrace Network Exposure Intelligence "
        "Engine.  **For authorized security assessment use only.**\n\n"
        "All scanning is performed by the existing ShadowTrace Python engine "
        "(shadowtrace/ package).  CVE data is sourced from the NVD REST API "
        "v2.0 and represents keyword correlations — not confirmed "
        "vulnerabilities."
    ),
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
# allow_origins="*" is appropriate for local-only development where the API
# is not exposed beyond the local network.  When deploying for a specific
# frontend origin, replace "*" with the exact origin
# (e.g. "http://192.168.1.10:5173").
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(scans.router)
app.include_router(reports.router)


# ---------------------------------------------------------------------------
# Health endpoint
# ---------------------------------------------------------------------------

@app.get(
    "/api/health",
    tags=["health"],
    summary="Liveness check",
    responses={200: {"description": "Service is up."}},
)
async def health() -> dict:
    """Return service status and current server time."""
    return {
        "status": "ok",
        "service": "ShadowTrace API",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
