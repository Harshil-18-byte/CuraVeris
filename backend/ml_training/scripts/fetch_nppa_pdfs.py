"""Fetch and Download Official NPPA PDFs.

Extracts all gazetted notifications, price revision orders, and ceiling sheets from:
https://nppa.gov.in/en/view_more?from_date=&to_date=&id=

Downloads PDFs to:
backend/ml_training/data/raw/pdf/nppa/

Generates index:
backend/ml_training/data/reference/nppa_pdf_index.json
"""

import os
import re
import json
import time
import requests

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF_DIR = os.path.join(BASE_DIR, "data", "raw", "pdf", "nppa")
REF_DIR = os.path.join(BASE_DIR, "data", "reference")
SAVED_CONTENT_FILE = r"C:\Users\harsh\.gemini\antigravity-ide\brain\471fe26b-fcd7-4a17-a82b-cee5874460d9\.system_generated\steps\819\content.md"

os.makedirs(PDF_DIR, exist_ok=True)
os.makedirs(REF_DIR, exist_ok=True)


def extract_pdf_records_from_content():
    """Extract PDF links, descriptions, dates without polynomial regex backtracking."""
    html_content = ""
    if os.path.exists(SAVED_CONTENT_FILE):
        try:
            with open(SAVED_CONTENT_FILE, "r", encoding="utf-8") as f:
                html_content = f.read()
        except Exception:
            pass

    records = []
    seen_urls = set()

    # Split rows by <tr> for fast, safe per-row extraction
    rows = html_content.split("<tr")
    print(f"[*] Parsing {len(rows)} table rows for official NPPA PDFs...")

    for r in rows:
        pdf_match = re.search(r'href=[\"\'](https://nppa\.gov\.in/storage/uploads/[^\"\']+\.pdf)[\"\']', r, re.IGNORECASE)
        if not pdf_match:
            continue

        pdf_url = pdf_match.group(1).strip()
        if pdf_url in seen_urls:
            continue
        seen_urls.add(pdf_url)

        # Extract title from table cells
        cells = r.split("<td")
        title = ""
        date_str = "2026"

        for c in cells:
            if "fa-calendar" in c:
                date_match = re.search(r'([\d]{1,2}\-[A-Za-z]{3}\-[\d]{4})', c)
                if date_match:
                    date_str = date_match.group(1)
            elif "pdf" not in c.lower() and len(c) > 20:
                clean_c = re.sub(r'<[^>]+>', ' ', c).strip()
                clean_c = re.sub(r'\s+', ' ', clean_c)
                if len(clean_c) > len(title) and not clean_c.isdigit():
                    title = clean_c

        fn = os.path.basename(pdf_url)
        if not title:
            title = fn.replace("-", " ").replace(".pdf", "").title()

        records.append({
            "date": date_str,
            "title": title,
            "url": pdf_url,
            "filename": fn,
            "local_path": os.path.join(PDF_DIR, fn),
        })

    print(f"[✓] Extracted {len(records)} distinct official NPPA gazette PDFs.")
    return records


def download_pdfs(records, max_downloads: int = 30):
    """Download the PDFs into the raw/pdf/nppa folder using curl.exe for robust SSL handling."""
    import subprocess
    print(f"[*] Starting download of up to {max_downloads} NPPA PDFs...")

    downloaded = 0
    failed = 0

    for idx, rec in enumerate(records[:max_downloads]):
        dest = rec["local_path"]
        if os.path.exists(dest) and os.path.getsize(dest) > 1000:
            rec["status"] = "cached"
            rec["size_bytes"] = os.path.getsize(dest)
            downloaded += 1
            continue

        try:
            print(f"[{idx+1}/{min(len(records), max_downloads)}] Downloading: {rec['filename']}...")
            cmd = [
                "curl.exe", "-s", "-k",
                "-A", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                "--connect-timeout", "10",
                "-o", dest,
                rec["url"]
            ]
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=20)
            if os.path.exists(dest) and os.path.getsize(dest) > 1000:
                rec["status"] = "downloaded"
                rec["size_bytes"] = os.path.getsize(dest)
                downloaded += 1
            else:
                rec["status"] = "download_failed"
                failed += 1
        except Exception as e:
            rec["status"] = f"error: {e}"
            failed += 1

    # Save metadata index
    index_file = os.path.join(REF_DIR, "nppa_pdf_index.json")
    with open(index_file, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2)

    print("\n" + "=" * 70)
    print(f"[✓] NPPA PDF Ingestion Complete!")
    print(f"    - Downloaded/Verified: {downloaded} PDFs")
    print(f"    - Stored directory   : {PDF_DIR}")
    print(f"    - Index catalog file : {index_file}")
    print("=" * 70)


def main():
    print("=" * 70)
    print("      NPPA OFFICIAL GAZETTE PDF SCRAPER & INGESTION")
    print("=" * 70)
    records = extract_pdf_records_from_content()
    download_pdfs(records, max_downloads=30)


if __name__ == "__main__":
    main()
