import nmap


SCAN_PROFILES = {
    "quick": "-sS --open -T4",
    "standard": "-sS -sV --open -T4",
    "deep": "-sS -sV --version-all --open -T4",
}


class NetworkDiscovery:
    """Discover hosts and exposed TCP services."""

    def __init__(self, profile="standard"):
        if profile not in SCAN_PROFILES:
            raise ValueError(
                f"Unknown scan profile: {profile}"
            )

        self.profile = profile
        self.scanner = nmap.PortScanner()

    def scan(self, target: str) -> list[dict]:
        arguments = SCAN_PROFILES[self.profile]

        self.scanner.scan(
            hosts=target,
            arguments=arguments,
        )

        results = []

        for host in self.scanner.all_hosts():
            host_data = {
                "host": host,
                "state": self.scanner[host].state(),
                "hostname": self.scanner[host].hostname(),
                "profile": self.profile,
                "services": [],
            }

            for protocol in self.scanner[host].all_protocols():
                for port in sorted(
                    self.scanner[host][protocol].keys()
                ):
                    service = self.scanner[host][protocol][port]

                    host_data["services"].append({
                        "protocol": protocol,
                        "port": port,
                        "state": service.get(
                            "state", "unknown"
                        ),
                        "service": service.get(
                            "name", "unknown"
                        ),
                        "product": service.get(
                            "product", ""
                        ),
                        "version": service.get(
                            "version", ""
                        ),
                    })

            results.append(host_data)

        return results
