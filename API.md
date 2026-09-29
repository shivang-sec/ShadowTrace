# ShadowTrace API

REST adapter for the ShadowTrace Network Exposure Intelligence Engine.
For **authorized security assessment use only**.

---

## Requirements

- Python ≥ 3.13
- Nmap installed and on PATH (`nmap --version` must succeed)
- On Kali Linux, SYN scanning (`-sS`) requires root or raw-socket capability

---

## Installation

```bash
# From the project root
pip install -r requirements.txt
```

---

## Starting the Server

```bash
# Development (auto-reload on file changes)
uvicorn api.main:app --host 127.0.0.1 --port 8000 --reload

# Kali Linux — nmap SYN scan requires elevated privileges
sudo -E uvicorn api.main:app --host 0.0.0.0 --port 8000
```

The server must be started from the **project root directory**
(the directory containing both `api/` and `shadowtrace/`).

---

## Interactive Documentation

With the server running:

| Interface | URL |
|-----------|-----|
| Swagger UI | http://localhost:8000/api/docs |
| ReDoc | http://localhost:8000/api/redoc |
| OpenAPI JSON | http://localhost:8000/api/openapi.json |

---

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Liveness check |
| `POST` | `/api/scans` | Start a new assessment |
| `GET` | `/api/scans/{job_id}` | Poll scan status |
| `GET` | `/api/reports` | List completed assessments |
| `GET` | `/api/reports/{report_id}` | Retrieve a full assessment |
| `DELETE` | `/api/reports/{report_id}` | Delete a report |
| `GET` | `/api/reports/{report_id}/export` | Download report as JSON |

---

## Example Requests

### Health check

```bash
curl http://localhost:8000/api/health
```

```json
{
  "status": "ok",
  "service": "ShadowTrace API",
  "version": "1.0.0",
  "timestamp": "2026-09-29T13:45:00+00:00"
}
```

---

### Start a scan

```bash
curl -X POST http://localhost:8000/api/scans \
     -H "Content-Type: application/json" \
     -d '{"target": "127.0.0.1", "profile": "standard"}'
```

```json
{
  "job_id": "a1b2c3d4-...",
  "status": "queued",
  "stage": null,
  "target": "127.0.0.1",
  "profile": "standard",
  "created_at": "2026-09-29T13:45:01+00:00",
  "completed_at": null,
  "report_id": null,
  "error": null
}
```

PowerShell equivalent:
```powershell
$body = '{"target": "127.0.0.1", "profile": "standard"}'
Invoke-WebRequest -Method POST `
    -Uri "http://localhost:8000/api/scans" `
    -ContentType "application/json" `
    -Body $body
```

---

### Poll scan status

```bash
curl http://localhost:8000/api/scans/a1b2c3d4-...
```

```json
{
  "job_id": "a1b2c3d4-...",
  "status": "running",
  "stage": "discovery",
  "target": "127.0.0.1",
  "profile": "standard",
  "created_at": "2026-09-29T13:45:01+00:00",
  "completed_at": null,
  "report_id": null,
  "error": null
}
```

Poll until `status` is `completed` or `failed`.
When `completed`, use the `report_id` field to retrieve the full report.

---

### Retrieve a report

```bash
curl http://localhost:8000/api/reports/b2c3d4e5-...
```

Returns the full assessment JSON including per-host service analysis,
security baseline findings, vulnerability intelligence findings, and
NVD CVE correlation results.

> **Note:** CVE matches are keyword search results from the NVD database.
> They are **not** confirmed vulnerabilities.  Applicability is estimated
> from CVE advisory text — always verify manually before acting.

---

### List all reports

```bash
curl http://localhost:8000/api/reports
```

```json
[
  {
    "report_id": "b2c3d4e5-...",
    "target": "127.0.0.1",
    "profile": "standard",
    "timestamp": "2026-09-29T13:46:00+05:30",
    "host_count": 1,
    "overall_risk": "LOW",
    "exposure_score": 6
  }
]
```

---

### Download a report as a JSON file

```bash
curl -OJ http://localhost:8000/api/reports/b2c3d4e5-.../export
```

---

## Scan Profiles

| Profile | Nmap Arguments | Use Case |
|---------|---------------|----------|
| `quick` | `-sS --open -T4` | Fast host discovery, no version detection |
| `standard` | `-sS -sV --open -T4` | Service and version detection (default) |
| `deep` | `-sS -sV --version-all --open -T4` | Thorough version probing for CVE correlation |

---

## Report Storage

Completed reports are stored as JSON files under `reports/` in the
project root:

```
reports/
├── index.json              ← compact summary of all reports
└── <uuid>.json             ← full assessment per scan
```

The `reports/` directory is gitignored.

---

## Cross-Machine Development (Windows ↔ Kali)

When the frontend runs on Windows and the API runs on Kali:

1. Start the API on Kali with `--host 0.0.0.0`.
2. Set `VITE_API_URL=http://<kali-ip>:8000` in `frontend/.env.development`.
3. The Vite dev server proxies `/api/*` to the Kali backend.

CORS is currently open (`allow_origins=["*"]`) for local development.
Restrict this to the specific frontend origin when deploying.
