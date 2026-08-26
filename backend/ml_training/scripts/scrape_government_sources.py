#!/usr/bin/env python3
"""Government-source crawler for the hospital-billing pricing/rules dataset.

Targets only the government source domains configured below. It recursively discovers
downloadable attachments (PDF, XLS/XLSX, CSV, ZIP, DOC/DOCX, ODS/ODT) from the seed pages
and saves original files verbatim under data/raw/, plus a SHA-256 manifest.

Run:
  python scripts/scrape_government_sources.py
Optional:
  --max-pages 2000 --delay 1.0 --include-archives --refresh

Notes:
- The crawler deliberately preserves originals and never overwrites a file with
  different bytes; changed content receives a versioned filename.
- It records source URL, landing page, retrieval time, SHA-256, HTTP headers, and content type.
- It does not treat third-party mirrors as authoritative sources.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import mimetypes
import os
import re
import time
from collections import deque
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin, urlparse, urldefrag
import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"
META = ROOT / "data" / "metadata"
MANIFEST = META / "government_sources_manifest.jsonl"
SEEDS = META / "government_source_seeds.json"

# Official government source pages relevant to the dataset.
SEED_URLS = [
    # CGHS: current official portal referenced by the 03-Oct-2025 CGHS OM.
    "https://cghs.mohfw.gov.in/",
    "https://cghs.gov.in/",
    # NPPA current site.
    "https://www.nppa.gov.in/en/medicaldevices-2",
    "https://www.nppa.gov.in/en/retailpricetilldate",
    "https://www.nppa.gov.in/en/cpnotifications",
    "https://www.nppa.gov.in/en/otherdocs",
    "https://www.nppa.gov.in/en/proactivedisclosure",
    "https://www.nppa.gov.in/en/view_more?id=4",
    # Legacy NPPA India site / DPCO archive.
    "https://nppaindia.nic.in/dpco2013",
    "https://nppaindia.nic.in/dpco1995",
    "https://nppaindia.nic.in/view_more",
    "https://nppaindia.nic.in/view_more?id=4",
]

# Crawl only these official government domains.
ALLOWED_DOMAINS = {
    "cghs.gov.in",
    "cghs.mohfw.gov.in",
    "www.cghs.gov.in",
    "www.cghs.mohfw.gov.in",
    "nppa.gov.in",
    "www.nppa.gov.in",
    "nppaindia.nic.in",
    "www.nppaindia.nic.in",
}

DOWNLOAD_EXTS = {
    ".pdf", ".xls", ".xlsx", ".csv", ".zip", ".doc", ".docx", ".ods", ".odt", ".rtf", ".txt"
}

HTML_TYPES = {"text/html", "application/xhtml+xml"}

session = requests.Session()
session.headers.update({
    "User-Agent": (
        "GovernmentDatasetCollector/1.0 "
        "(research data collection; contact user for operational details)"
    ),
    "Accept": "*/*",
})


@dataclass
class Record:
    url: str
    landing_page: str
    local_path: str | None
    filename: str | None
    extension: str | None
    content_type: str | None
    size_bytes: int | None
    sha256: str | None
    retrieved_at_utc: str
    http_status: int | None
    etag: str | None
    last_modified: str | None
    note: str | None = None


def norm_url(u: str) -> str:
    u = urldefrag(u)[0]
    return u.strip()


def is_allowed(u: str) -> bool:
    try:
        host = urlparse(u).hostname or ""
        return host.lower() in ALLOWED_DOMAINS
    except Exception:
        return False


def ext_for(url: str, content_type: str | None) -> str:
    path_ext = Path(urlparse(url).path).suffix.lower()
    if path_ext:
        return path_ext
    if content_type:
        return mimetypes.guess_extension(content_type.split(";")[0].strip()) or ""
    return ""


def safe_name(url: str) -> str:
    p = Path(urlparse(url).path)
    stem = p.name or "download"
    stem = re.sub(r"[^A-Za-z0-9._-]+", "_", stem)
    if len(stem) > 180:
        stem = stem[:180]
    return stem


def category_for(landing_url: str, file_url: str) -> str:
    hay = f"{landing_url} {file_url}".lower()
    if "cghs" in hay:
        return "cghs"
    if "medicaldevices" in hay or "medical-device" in hay or "medical device" in hay:
        return "nppa_medical_devices"
    if "dpco" in hay or "scheduled" in hay or "ceiling" in hay or "price" in hay:
        return "nppa_dpco_pricing"
    return "nppa_other"


def write_jsonl(rec: Record) -> None:
    META.mkdir(parents=True, exist_ok=True)
    with MANIFEST.open("a", encoding="utf-8") as f:
        f.write(json.dumps(asdict(rec), ensure_ascii=False) + "\n")


def download(url: str, landing: str, args) -> tuple[Record, str | None]:
    ts = datetime.now(timezone.utc).isoformat()
    try:
        r = session.get(url, timeout=60, allow_redirects=True)
        ctype = (r.headers.get("content-type") or "").split(";")[0].lower()
        final_url = norm_url(r.url)
        ext = ext_for(final_url, ctype)
        if r.status_code != 200:
            rec = Record(
                url=url,
                landing_page=landing,
                local_path=None,
                filename=None,
                extension=ext or None,
                content_type=ctype or None,
                size_bytes=None,
                sha256=None,
                retrieved_at_utc=ts,
                http_status=r.status_code,
                etag=r.headers.get("etag"),
                last_modified=r.headers.get("last-modified"),
                note="HTTP error"
            )
            return rec, None

        # Accept known attachment extensions OR attachment dispositions.
        cd = (r.headers.get("content-disposition") or "").lower()
        looks_downloadable = (
            ext in DOWNLOAD_EXTS or "attachment" in cd or ctype not in HTML_TYPES
        )
        if not looks_downloadable:
            return Record(
                url=url,
                landing_page=landing,
                local_path=None,
                filename=None,
                extension=ext or None,
                content_type=ctype or None,
                size_bytes=len(r.content),
                sha256=None,
                retrieved_at_utc=ts,
                http_status=r.status_code,
                etag=r.headers.get("etag"),
                last_modified=r.headers.get("last-modified"),
                note="HTML/non-download response"
            ), None

        data = r.content
        digest = hashlib.sha256(data).hexdigest()
        base = safe_name(final_url)
        category = category_for(landing, final_url)
        outdir = RAW / category
        outdir.mkdir(parents=True, exist_ok=True)
        path = outdir / base

        # Avoid collisions and preserve changed versions.
        if path.exists():
            existing = hashlib.sha256(path.read_bytes()).hexdigest()
            if existing != digest:
                path = outdir / f"{path.stem}_{digest[:12]}{path.suffix}"

        if not path.exists() or args.refresh:
            path.write_bytes(data)

        rec = Record(
            url=final_url,
            landing_page=landing,
            local_path=str(path.relative_to(ROOT)),
            filename=path.name,
            extension=path.suffix.lower() or (ext or None),
            content_type=ctype or None,
            size_bytes=len(data),
            sha256=digest,
            retrieved_at_utc=ts,
            http_status=r.status_code,
            etag=r.headers.get("etag"),
            last_modified=r.headers.get("last-modified"),
            note=None,
        )
        return rec, final_url
    except Exception as e:
        return Record(
            url=url,
            landing_page=landing,
            local_path=None,
            filename=None,
            extension=Path(urlparse(url).path).suffix.lower() or None,
            content_type=None,
            size_bytes=None,
            sha256=None,
            retrieved_at_utc=ts,
            http_status=None,
            etag=None,
            last_modified=None,
            note=f"ERROR: {type(e).__name__}: {e}"
        ), None


def extract_links(html: str, base: str) -> list[str]:
    soup = BeautifulSoup(html, "html.parser")
    found = []
    for a in soup.find_all("a", href=True):
        href_val = str(a.get("href", ""))
        u = norm_url(urljoin(base, href_val))
        if is_allowed(u):
            found.append(u)
    return found


def main():
    ap = argparse.ArgumentParser(description="Crawl official government portals for medical pricing files.")
    ap.add_argument("--max-pages", type=int, default=2000)
    ap.add_argument("--delay", type=float, default=1.0)
    ap.add_argument("--include-archives", action="store_true")
    ap.add_argument("--refresh", action="store_true")
    args = ap.parse_args()

    META.mkdir(parents=True, exist_ok=True)
    SEEDS.write_text(json.dumps(SEED_URLS, indent=2), encoding="utf-8")
    if not MANIFEST.exists():
        MANIFEST.write_text("", encoding="utf-8")

    queue: deque[tuple[str, str | None]] = deque((u, None) for u in SEED_URLS)
    seen = set()
    pages = 0

    while queue and pages < args.max_pages:
        url, landing = queue.popleft()
        url = norm_url(url)
        if url in seen or not is_allowed(url):
            continue
        seen.add(url)

        # Download direct attachments first.
        if Path(urlparse(url).path).suffix.lower() in DOWNLOAD_EXTS:
            rec, final = download(url, landing or url, args)
            write_jsonl(rec)
            time.sleep(args.delay)
            continue

        try:
            r = session.get(url, timeout=60, allow_redirects=True)
            pages += 1
            ctype = (r.headers.get("content-type") or "").split(";")[0].lower()
            print(f"[PAGE {pages}] {r.status_code} {r.url}")

            if r.status_code != 200 or ctype not in HTML_TYPES:
                rec, _ = download(url, landing or url, args)
                write_jsonl(rec)
                time.sleep(args.delay)
                continue

            base_landing = landing or url
            for link in extract_links(r.text, r.url):
                if link in seen:
                    continue
                path = urlparse(link).path.lower()
                # Attachment discovery.
                if Path(path).suffix.lower() in DOWNLOAD_EXTS:
                    rec, _ = download(link, base_landing, args)
                    write_jsonl(rec)
                else:
                    # Stay within the relevant government site.
                    if any(k in link.lower() for k in (
                        "medical", "device", "dpco", "price", "ceiling", "scheduled", "formulation",
                        "cghs", "rate", "archive", "notification", "circular", "order", "document", "year20"
                    )):
                        queue.append((link, base_landing))

            time.sleep(args.delay)
        except Exception as e:
            rec = Record(
                url=url,
                landing_page=landing or url,
                local_path=None,
                filename=None,
                extension=None,
                content_type=None,
                size_bytes=None,
                sha256=None,
                retrieved_at_utc=datetime.now(timezone.utc).isoformat(),
                http_status=None,
                etag=None,
                last_modified=None,
                note=f"PAGE ERROR: {type(e).__name__}: {e}"
            )
            write_jsonl(rec)

    print(f"Done. Pages visited: {pages}. URLs seen: {len(seen)}")
    print(f"Files/records manifest: {MANIFEST}")


if __name__ == "__main__":
    main()
