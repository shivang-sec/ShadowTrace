RISKY_SERVICES = {
    21: ("FTP", 15, "File transfer service exposed"),
    23: ("Telnet", 30, "Unencrypted remote administration"),
    135: ("MSRPC", 15, "Windows RPC service exposed"),
    139: ("NetBIOS", 20, "Legacy file-sharing service exposed"),
    445: ("SMB", 30, "SMB service exposed"),
    3389: ("RDP", 30, "Remote desktop service exposed"),
    5900: ("VNC", 25, "Remote desktop service exposed"),
}


def calculate_service_risk(service: dict) -> dict:
    port = service["port"]

    if port in RISKY_SERVICES:
        name, score, reason = RISKY_SERVICES[port]

        return {
            "port": port,
            "level": "HIGH" if score >= 25 else "MEDIUM",
            "score": score,
            "reason": reason,
            "evidence": {
                "service": service["service"],
                "product": service["product"],
                "version": service["version"],
                "state": service["state"],
            },
        }

    if port in (22, 80, 8080):
        return {
            "port": port,
            "level": "LOW",
            "score": 5,
            "reason": f"Common service exposed on port {port}",
            "evidence": {
                "service": service["service"],
                "product": service["product"],
                "version": service["version"],
                "state": service["state"],
            },
        }

    return {
        "port": port,
        "level": "INFO",
        "score": 1,
        "reason": f"Service exposed on port {port}",
        "evidence": {
            "service": service["service"],
            "product": service["product"],
            "version": service["version"],
            "state": service["state"],
        },
    }


def calculate_host_score(host: dict) -> dict:
    findings = [
        calculate_service_risk(service)
        for service in host["services"]
    ]

    total = sum(item["score"] for item in findings)

    if total >= 60:
        level = "CRITICAL"
    elif total >= 30:
        level = "HIGH"
    elif total >= 10:
        level = "MEDIUM"
    else:
        level = "LOW"

    return {
        "score": min(total, 100),
        "level": level,
        "findings": findings,
    }
