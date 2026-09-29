DANGEROUS_SERVICES = {
    21: {
        "name": "FTP",
        "severity": "WARN",
        "message": "FTP service exposed",
        "recommendation": "Use SFTP or another encrypted file-transfer protocol.",
    },
    23: {
        "name": "Telnet",
        "severity": "HIGH",
        "message": "Telnet service exposed",
        "recommendation": "Disable Telnet and use SSH instead.",
    },
    135: {
        "name": "MSRPC",
        "severity": "WARN",
        "message": "Windows RPC service exposed",
        "recommendation": "Restrict RPC access to trusted networks.",
    },
    139: {
        "name": "NetBIOS",
        "severity": "WARN",
        "message": "Legacy NetBIOS service exposed",
        "recommendation": "Disable NetBIOS where it is not required.",
    },
    445: {
        "name": "SMB",
        "severity": "HIGH",
        "message": "SMB service exposed",
        "recommendation": "Restrict SMB to trusted hosts and networks.",
    },
    3306: {
        "name": "MySQL",
        "severity": "WARN",
        "message": "Database service exposed",
        "recommendation": "Restrict database access to trusted application hosts.",
    },
    3389: {
        "name": "RDP",
        "severity": "HIGH",
        "message": "Remote Desktop exposed",
        "recommendation": "Restrict RDP access and require secure remote access controls.",
    },
    5900: {
        "name": "VNC",
        "severity": "HIGH",
        "message": "VNC service exposed",
        "recommendation": "Restrict VNC access and use encrypted remote administration.",
    },
}


def run_baseline(host):
    findings = []
    recommendations = []
    observed_ports = set()

    for service in host.get("services", []):
        port = service["port"]
        observed_ports.add(port)

        if port == 80:
            findings.append({
                "severity": "INFO",
                "message": "HTTP service detected",
            })

        rule = DANGEROUS_SERVICES.get(port)

        if rule:
            findings.append({
                "severity": rule["severity"],
                "message": rule["message"],
                "port": port,
                "service": rule["name"],
            })

            recommendations.append(
                rule["recommendation"]
            )

    # Positive baseline checks
    if 23 not in observed_ports:
        findings.append({
            "severity": "PASS",
            "message": "No Telnet service detected",
        })

    if 3389 not in observed_ports:
        findings.append({
            "severity": "PASS",
            "message": "No RDP service detected",
        })

    if 445 not in observed_ports:
        findings.append({
            "severity": "PASS",
            "message": "No SMB service detected",
        })

    # Remove duplicate recommendations
    recommendations = list(dict.fromkeys(recommendations))

    return {
        "findings": findings,
        "recommendations": recommendations,
    }
