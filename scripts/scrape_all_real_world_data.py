#!/usr/bin/env python3
"""Master Orchestrator to scrape and ingest real-world hospital tariffs, official price databases, and real court bills."""

import os
import sys
import subprocess

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main():
    print("================================================================")
    print("🌐 REAL-WORLD HEALTHCARE DATA INGESTION & SCRAPING ENGINE")
    print("================================================================")

    python_exe = sys.executable

    # 1. Ingest Official Source Configurations
    print("\n[1/4] Ingesting Official Statutory Gazette Metadata...")
    cmd1 = [python_exe, os.path.join(BASE_DIR, "scripts", "ingest_official_sources.py")]
    subprocess.run(cmd1, check=True)

    # 2. Normalize Statutory Government Reference Datasets
    print("\n[2/4] Normalizing NPPA, DPCO, CGHS, and IRDAI Reference Schedules...")
    cmd2 = [python_exe, os.path.join(BASE_DIR, "scripts", "normalize_references.py")]
    subprocess.run(cmd2, check=True)

    # 3. Scrape AIIMS Hospital Tariffs
    print("\n[3/4] Ingesting AIIMS New Delhi Published Hospital User Charges...")
    cmd3 = [python_exe, os.path.join(BASE_DIR, "scripts", "scrapers", "aiims_rates_scraper.py")]
    subprocess.run(cmd3, check=True)

    # 4. Ingest Real-World Consumer Court Hospital Bills
    print("\n[4/4] Ingesting Real-World Consumer Court Judgments & Itemized Inpatient Bills...")
    cmd4 = [python_exe, os.path.join(BASE_DIR, "scripts", "scrapers", "real_consumer_court_bills_ingestor.py")]
    subprocess.run(cmd4, check=True)

    print("\n================================================================")
    print("✅ REAL-WORLD INGESTION COMPLETE — Real bills & official prices saved.")
    print("================================================================")


if __name__ == "__main__":
    main()
