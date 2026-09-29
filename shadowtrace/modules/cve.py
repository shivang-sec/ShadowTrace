"""
NVD CVE intelligence integration for ShadowTrace.

CVE correlation is only performed when a software product
and a concrete version are available from service detection.
"""

import re

import requests


NVD_API = "https://services.nvd.nist.gov/rest/json/cves/2.0"

REQUEST_TIMEOUT = 10


def version_tuple(version: str) -> tuple:
    numbers = re.findall(r"\d+", version)
    return tuple(int(number) for number in numbers)


def extract_fixed_version(description: str) -> str | None:
    patterns = [
        r"upgrade to version\s+([0-9]+(?:\.[0-9]+)+)",
        r"fixed in version\s+([0-9]+(?:\.[0-9]+)+)",
        r"fixed in\s+([0-9]+(?:\.[0-9]+)+)",
    ]

    for pattern in patterns:
        match = re.search(
            pattern,
            description,
            re.IGNORECASE,
        )

        if match:
            return match.group(1)

    return None


def extract_affected_upper_bound(
    description: str,
) -> str | None:

    patterns = [
        r"([0-9]+(?:\.[0-9]+)+)\s+and earlier",
        r"through\s+([0-9]+(?:\.[0-9]+)+)",
        r"before\s+([0-9]+(?:\.[0-9]+)+)",
    ]

    for pattern in patterns:
        match = re.search(
            pattern,
            description,
            re.IGNORECASE,
        )

        if match:
            return match.group(1)

    return None


def determine_applicability(
    detected_version: str,
    description: str,
) -> dict:

    detected = version_tuple(
        detected_version
    )

    if not detected:
        return {
            "status": "unknown",
            "reason": (
                "Detected version could not be parsed."
            ),
        }

    fixed_version = extract_fixed_version(
        description
    )

    if fixed_version:

        fixed = version_tuple(
            fixed_version
        )

        if detected >= fixed:

            return {
                "status": "not_affected",
                "reason": (
                    f"Detected version "
                    f"{detected_version} is at or newer "
                    f"than fixed version "
                    f"{fixed_version}."
                ),
                "fixed_version": fixed_version,
            }

    affected_upper = (
        extract_affected_upper_bound(
            description
        )
    )

    if affected_upper:

        upper = version_tuple(
            affected_upper
        )

        if detected <= upper:

            return {
                "status": "potentially_affected",
                "reason": (
                    f"Detected version "
                    f"{detected_version} is within "
                    f"the affected range described "
                    f"by the advisory."
                ),
                "affected_upper_bound": (
                    affected_upper
                ),
            }

        return {
            "status": "not_affected",
            "reason": (
                f"Detected version "
                f"{detected_version} is newer "
                f"than affected upper bound "
                f"{affected_upper}."
            ),
            "affected_upper_bound": (
                affected_upper
            ),
        }

    return {
        "status": "unknown",
        "reason": (
            "The advisory did not provide a "
            "version range that ShadowTrace "
            "could safely parse."
        ),
    }


def lookup_cves(
    keyword: str,
    limit: int = 5,
) -> dict:

    if not keyword:

        return {
            "status": "insufficient_evidence",
            "matches": [],
        }

    params = {
        "keywordSearch": keyword,
        "noRejected": "",
        "resultsPerPage": limit,
    }

    try:

        response = requests.get(
            NVD_API,
            params=params,
            timeout=REQUEST_TIMEOUT,
        )

        response.raise_for_status()

        data = response.json()

    except requests.RequestException as exc:

        return {
            "status": "lookup_unavailable",
            "matches": [],
            "error": str(exc),
        }

    results = []

    for item in data.get(
        "vulnerabilities",
        [],
    ):

        cve = item.get(
            "cve",
            {}
        )

        cve_id = cve.get("id")

        if not cve_id:
            continue

        description = ""

        for entry in cve.get(
            "descriptions",
            [],
        ):

            if entry.get("lang") == "en":

                description = entry.get(
                    "value",
                    "",
                )

                break

        metrics = cve.get(
            "metrics",
            {}
        )

        cvss_score = None
        severity = None

        for metric_name in (
            "cvssMetricV40",
            "cvssMetricV31",
            "cvssMetricV30",
        ):

            if metrics.get(metric_name):

                metric = metrics[
                    metric_name
                ][0]

                cvss_data = metric.get(
                    "cvssData",
                    {}
                )

                cvss_score = cvss_data.get(
                    "baseScore"
                )

                severity = cvss_data.get(
                    "baseSeverity"
                )

                break

        results.append(
            {
                "cve_id": cve_id,
                "severity": severity,
                "cvss_score": cvss_score,
                "description": description,
                "published": cve.get(
                    "published"
                ),
                "last_modified": cve.get(
                    "lastModified"
                ),
                "source": "NVD",
            }
        )

    return {
        "status": (
            "matches_found"
            if results
            else "no_matches"
        ),
        "matches": results,
    }


def lookup_service(
    service: dict,
    limit: int = 5,
) -> dict:
    """
    Correlate a detected service with NVD.

    A concrete product version is required before
    performing CVE correlation.
    """

    product = service.get(
        "product",
        ""
    ).strip()

    version = service.get(
        "version",
        ""
    ).strip()

    service_name = service.get(
        "service",
        ""
    ).strip()

    # --------------------------------
    # No product information
    # --------------------------------

    if not product:

        return {
            "query": "",
            "detected_version": version,
            "matches": [],
            "status": "insufficient_evidence",
            "reason": (
                "Software product was not identified."
            ),
        }

    # --------------------------------
    # Product exists but version missing
    # --------------------------------

    if not version:

        return {
            "query": product,
            "detected_version": "",
            "matches": [],
            "status": "version_required",
            "reason": (
                "A concrete software version is "
                "required for reliable CVE correlation."
            ),
        }

    # --------------------------------
    # Product + version available
    # --------------------------------

    keyword = f"{product} {version}"

    result = lookup_cves(
        keyword,
        limit=limit,
    )

    if result["status"] == "lookup_unavailable":

        return {
            "query": keyword,
            "detected_version": version,
            "matches": [],
            "status": "lookup_unavailable",
            "error": result.get("error"),
        }

    enriched_matches = []

    for match in result["matches"]:

        applicability = determine_applicability(
            version,
            match["description"],
        )

        enriched_matches.append(
            {
                **match,
                "applicability": applicability,
            }
        )

    return {
        "query": keyword,
        "detected_version": version,
        "matches": enriched_matches,
        "status": result["status"],
    }
