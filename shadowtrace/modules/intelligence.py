"""
Vulnerability intelligence layer for ShadowTrace.

Converts discovered services into structured security findings.
"""

SERVICE_RULES = {
    "http": {
        "id": "ST-HTTP-001",
        "category": "Web Service Exposure",
        "severity": "INFO",
        "confidence": "HIGH",
        "finding": "HTTP service is exposed",
        "recommendation": (
            "Review the web service configuration and ensure "
            "only required interfaces are exposed."
        ),
    },

    "mysql": {
        "id": "ST-DB-001",
        "category": "Database Network Exposure",
        "severity": "MEDIUM",
        "confidence": "HIGH",
        "finding": "MySQL database service is exposed",
        "recommendation": (
            "Restrict database access to trusted application "
            "hosts or management networks."
        ),
    },

    "ftp": {
        "id": "ST-FTP-001",
        "category": "Legacy Protocol Exposure",
        "severity": "HIGH",
        "confidence": "HIGH",
        "finding": "FTP service is exposed",
        "recommendation": (
            "Prefer SFTP or another encrypted file-transfer protocol."
        ),
    },

    "telnet": {
        "id": "ST-TELNET-001",
        "category": "Legacy Protocol Exposure",
        "severity": "HIGH",
        "confidence": "HIGH",
        "finding": "Telnet service is exposed",
        "recommendation": (
            "Disable Telnet and use SSH for remote administration."
        ),
    },

    "smb": {
        "id": "ST-SMB-001",
        "category": "File Sharing Exposure",
        "severity": "HIGH",
        "confidence": "HIGH",
        "finding": "SMB service is exposed",
        "recommendation": (
            "Restrict SMB access to trusted hosts and networks."
        ),
    },

    "microsoft-ds": {
        "id": "ST-SMB-002",
        "category": "File Sharing Exposure",
        "severity": "HIGH",
        "confidence": "HIGH",
        "finding": "Windows SMB service is exposed",
        "recommendation": (
            "Restrict SMB access and review unnecessary "
            "network exposure."
        ),
    },

    "rdp": {
        "id": "ST-RDP-001",
        "category": "Remote Administration Exposure",
        "severity": "HIGH",
        "confidence": "HIGH",
        "finding": "Remote Desktop service is exposed",
        "recommendation": (
            "Restrict RDP access to trusted networks and "
            "use appropriate authentication controls."
        ),
    },
}


def analyze_service(service: dict) -> dict | None:
    """
    Analyze one discovered service and produce
    a structured security finding.
    """

    service_name = (
        service.get("service", "")
        .strip()
        .lower()
    )

    rule = SERVICE_RULES.get(service_name)

    if not rule:
        return None

    evidence = {
        "port": service.get("port"),
        "protocol": service.get("protocol"),
        "service": service.get("service"),
        "product": service.get("product", ""),
        "version": service.get("version", ""),
        "state": service.get("state"),
    }

    return {
        "id": rule["id"],
        "severity": rule["severity"],
        "confidence": rule["confidence"],
        "category": rule["category"],
        "finding": rule["finding"],
        "evidence": evidence,
        "recommendation": rule["recommendation"],
    }


def run_intelligence(host: dict) -> list[dict]:
    """
    Analyze all discovered services for a host.
    """

    findings = []

    for service in host.get("services", []):
        finding = analyze_service(service)

        if finding:
            findings.append(finding)

    return findings
