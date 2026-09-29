import argparse
import json
from datetime import datetime
from pathlib import Path

from rich.console import Console
from rich.panel import Panel
from rich.table import Table

from shadowtrace.modules.discovery import NetworkDiscovery
from shadowtrace.core.risk import calculate_host_score
from shadowtrace.modules.baseline import run_baseline
from shadowtrace.modules.intelligence import run_intelligence
from shadowtrace.modules.cve import lookup_service


console = Console()


def banner():
    console.print(
        Panel.fit(
            "[bold cyan]SHADOWTRACE[/bold cyan]\n"
            "[white]Network Exposure Intelligence Engine[/white]\n"
            "[dim]Local security assessment framework[/dim]",
            border_style="cyan",
        )
    )


def display_results(results):
    if not results:
        console.print("[yellow]No hosts discovered.[/yellow]")
        return

    for host in results:
        analysis = calculate_host_score(host)
        baseline = run_baseline(host)
        intelligence = run_intelligence(host)

        cve_results = [
            lookup_service(service)
            for service in host.get("services", [])
        ]

        console.print(
            f"\n[bold white]TARGET[/bold white] {host['host']}"
        )

        if host["hostname"]:
            console.print(
                f"HOSTNAME  {host['hostname']}"
            )

        # -----------------------------
        # DISCOVERED SERVICES
        # -----------------------------

        table = Table(
            title="DISCOVERED SERVICES",
            show_header=True,
            header_style="bold cyan",
        )

        table.add_column("PORT")
        table.add_column("SERVICE")
        table.add_column("VERSION")
        table.add_column("RISK")

        for service in host["services"]:
            service_analysis = calculate_host_score(
                {"services": [service]}
            )["findings"][0]

            table.add_row(
                str(service["port"]),
                service["service"],
                service["version"] or "-",
                (
                    f"{service_analysis['level']} "
                    f"({service_analysis['score']})"
                ),
            )

        console.print(table)

        # -----------------------------
        # SECURITY BASELINE
        # -----------------------------

        console.print(
            "\n[bold cyan]SECURITY BASELINE[/bold cyan]"
        )

        for finding in baseline["findings"]:
            severity = finding["severity"]

            if severity == "PASS":
                style = "green"
            elif severity == "HIGH":
                style = "red"
            elif severity == "WARN":
                style = "yellow"
            else:
                style = "cyan"

            console.print(
                f"  [{style}][{severity}][/{style}] "
                f"{finding['message']}"
            )

        # -----------------------------
        # VULNERABILITY INTELLIGENCE
        # -----------------------------

        console.print(
            "\n[bold cyan]"
            "VULNERABILITY INTELLIGENCE"
            "[/bold cyan]"
        )

        if intelligence:
            for finding in intelligence:
                severity = finding["severity"]

                if severity == "HIGH":
                    style = "red"
                elif severity == "MEDIUM":
                    style = "yellow"
                elif severity == "LOW":
                    style = "green"
                else:
                    style = "cyan"

                evidence = finding["evidence"]

                version = (
                    evidence["version"]
                    if evidence["version"]
                    else "version not detected"
                )

                console.print(
                    f"  [{style}][{severity}][/{style}] "
                    f"{finding['finding']}"
                )

                console.print(
                    f"       ID: {finding['id']}"
                )

                console.print(
                    f"       Category: {finding['category']}"
                )

                console.print(
                    f"       Confidence: "
                    f"{finding['confidence']}"
                )

                console.print(
                    f"       Evidence: "
                    f"{evidence['service']} "
                    f"on port {evidence['port']} "
                    f"({version})"
                )

                console.print(
                    f"       Action: "
                    f"{finding['recommendation']}"
                )

        else:
            console.print(
                "  [green][PASS][/green] "
                "No intelligence rules matched "
                "the discovered services."
            )

        # -----------------------------
        # CVE INTELLIGENCE
        # -----------------------------

        console.print(
            "\n[bold cyan]CVE INTELLIGENCE[/bold cyan]"
        )

        cve_found = False
        lookup_warning = False
        version_required = False

        for result in cve_results:

            status = result["status"]

            if status == "lookup_unavailable":
                lookup_warning = True

                console.print(
                    "  [yellow][WARN][/yellow] "
                    "NVD lookup unavailable for "
                    f"{result.get('query', 'unknown service')}"
                )

                continue

            if status == "insufficient_evidence":
               service_name = result.get(
                   "query",
                   "unknown service",
               )

               console.print(
                   "  [cyan][INFO][/cyan] "
                   f"{service_name or 'Service'}: insufficient "
                   "evidence for reliable CVE correlation."
               )

               continue
                
            if status == "version_required":
                version_required = True

                service_name = result.get(
                    "query",
                    "unknown service",
                )

                console.print(
                    "  [cyan][INFO][/cyan] "
                    f"{service_name}: version required "
                    "for reliable CVE correlation."
                )

                continue

            for cve in result["matches"]:

                cve_found = True

                applicability = cve["applicability"]
                applicability_status = applicability["status"]

                if applicability_status == "potentially_affected":
                    style = "red"
                    label = "POTENTIALLY AFFECTED"

                elif applicability_status == "not_affected":
                    style = "green"
                    label = "NOT AFFECTED"

                else:
                    style = "yellow"
                    label = "UNKNOWN"

                console.print(
                    f"\n  [bold]{cve['cve_id']}[/bold]"
                )

                console.print(
                    f"       Severity: "
                    f"{cve['severity'] or 'UNKNOWN'}"
                )

                console.print(
                    f"       CVSS: "
                    f"{cve['cvss_score'] or 'N/A'}"
                )

                console.print(
                    f"       Status: "
                    f"[{style}]{label}[/{style}]"
                )

                detected_version = (
                    result.get("detected_version")
                    or "version unknown"
                )

                console.print(
                    f"       Detected: {detected_version}"
                )

                if applicability.get("fixed_version"):
                    console.print(
                        f"       Fixed: "
                        f"{applicability['fixed_version']}"
                    )

                console.print(
                    f"       Evidence: {result['query']}"
                )

                console.print(
                    f"       Reason: "
                    f"{applicability['reason']}"
                )

                console.print(
                    f"       Source: {cve['source']}"
                )

        if (
            not cve_found
            and not lookup_warning
            and not version_required
        ):
            console.print(
                "  [green][INFO][/green] "
                "No CVE matches returned by NVD."
            )

        # -----------------------------
        # EXPOSURE ASSESSMENT
        # -----------------------------

        console.print(
            Panel(
                f"[bold]Exposure Score:[/bold] "
                f"{analysis['score']}/100\n"
                f"[bold]Overall Risk:[/bold] "
                f"{analysis['level']}",
                title="EXPOSURE ASSESSMENT",
                border_style="yellow",
            )
        )

        # -----------------------------
        # RECOMMENDATIONS
        # -----------------------------

        if baseline["recommendations"]:
            console.print(
                "\n[bold cyan]RECOMMENDATIONS[/bold cyan]"
            )

            for index, recommendation in enumerate(
                baseline["recommendations"],
                start=1,
            ):
                console.print(
                    f"  {index:02d}. {recommendation}"
                )


def build_assessment(results, target, profile):
    hosts = []

    for host in results:
        services = host.get("services", [])

        hosts.append(
            {
                "host": host,
                "analysis": calculate_host_score(host),
                "baseline": run_baseline(host),
                "intelligence": run_intelligence(host),
                "cve_intelligence": [
                    lookup_service(service)
                    for service in services
                ],
            }
        )

    return {
        "tool": "ShadowTrace",
        "version": "1.0",
        "timestamp": datetime.now().astimezone().isoformat(),
        "target": target,
        "profile": profile,
        "hosts": hosts,
    }


def save_report(assessment, filename):
    path = Path(filename)

    path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    path.write_text(
        json.dumps(
            assessment,
            indent=2,
        ),
        encoding="utf-8",
    )

    return path


def main():
    parser = argparse.ArgumentParser(
        prog="shadowtrace",
        description="Network Exposure Intelligence Engine",
    )

    parser.add_argument(
        "target",
        help=(
            "Authorized IP address, hostname, "
            "or network range"
        ),
    )

    parser.add_argument(
        "--profile",
        choices=["quick", "standard", "deep"],
        default="standard",
        help="Select scan depth",
    )

    parser.add_argument(
        "--json",
        action="store_true",
        help="Output machine-readable assessment data",
    )

    parser.add_argument(
        "--save",
        metavar="FILE",
        help="Save assessment as JSON",
    )

    args = parser.parse_args()

    if not args.json:
        banner()

        console.print(
            f"\n[bold]Target:[/bold] {args.target}"
        )

        console.print(
            f"[bold]Profile:[/bold] {args.profile}"
        )

        console.print(
            "[dim]"
            "Starting network exposure assessment..."
            "[/dim]\n"
        )

    try:
        scanner = NetworkDiscovery(args.profile)

        if args.json:
            results = scanner.scan(args.target)
        else:
            with console.status(
                "[cyan]"
                "Discovering hosts and services..."
                "[/cyan]"
            ):
                results = scanner.scan(args.target)

        assessment = build_assessment(
            results,
            args.target,
            args.profile,
        )

        if args.save:
            path = save_report(
                assessment,
                args.save,
            )

            if not args.json:
                console.print(
                    "\n[bold green]"
                    "✓ Report saved:"
                    "[/bold green] "
                    f"{path}"
                )

        if args.json:
            print(
                json.dumps(
                    assessment,
                    indent=2,
                )
            )
            return

        display_results(results)

        console.print(
            "\n[bold green]"
            "✓ Assessment complete."
            "[/bold green]"
        )

    except KeyboardInterrupt:
        if not args.json:
            console.print(
                "\n[yellow]"
                "Assessment cancelled."
                "[/yellow]"
            )

    except Exception as exc:
        if args.json:
            print(
                json.dumps(
                    {"error": str(exc)}
                )
            )
        else:
            console.print(
                f"\n[bold red]ERROR:[/bold red] {exc}"
            )


if __name__ == "__main__":
    main()
