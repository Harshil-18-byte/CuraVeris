# pyright: reportMissingImports=false
"""Ingest and Unify 27 User-Provided Central Government Health Scheme CSV Files.

Processes all Central Government Health Scheme*.csv files in:
backend/ml_training/data/raw/csv/

Stores unified rates in:
- SQLite: backend/ml_training/data/reference/cghs.db (cghs_detailed_rates and cghs_rates)
- ChromaDB: cghs_collection (augmented vector embeddings for RAG)
"""

import os
import glob
import re
import sqlite3
import pandas as pd
from typing import Dict, Any, List

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_DIR = os.path.join(BASE_DIR, "data", "raw", "csv")
DB_PATH = os.path.join(BASE_DIR, "data", "reference", "cghs.db")


def ingest_cghs_csv_files():
    csv_files = glob.glob(os.path.join(CSV_DIR, "Central Government Health Scheme*.csv"))
    print(f"[*] Found {len(csv_files)} official CGHS CSV files provided in: {CSV_DIR}")

    if not csv_files:
        print("[!] No Central Government Health Scheme CSV files found.")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS cghs_detailed_rates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            procedure_code TEXT,
            procedure_name TEXT,
            speciality TEXT,
            tier TEXT,
            facility TEXT,
            ward TEXT,
            rate REAL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS cghs_rates (
            procedure_code TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            rate_non_nabh REAL NOT NULL,
            rate_nabh REAL NOT NULL,
            category TEXT NOT NULL,
            sub_category TEXT NOT NULL
        )
    """)

    # Clear detailed table for fresh import
    cursor.execute("DELETE FROM cghs_detailed_rates")
    conn.commit()

    total_rows = 0
    procedure_aggregates: Dict[str, Dict[str, Any]] = {}

    for file_path in csv_files:
        fn = os.path.basename(file_path)
        try:
            df = pd.read_csv(file_path)
            # Standardize column names
            df.columns = [c.strip() for c in df.columns]

            for _, row in df.iterrows():
                proc_name = str(row.get("Procedure Name", "")).strip()
                code = str(row.get("Cghs Code No.", "")).strip()
                spec = str(row.get("Speciality Classification", "")).strip()
                tier = str(row.get("Tier", "")).strip()
                facility = str(row.get("Facility", "")).strip().upper()
                ward = str(row.get("Ward", "")).strip()
                rate_raw = str(row.get("Rate (₹)", "0")).replace(",", "").replace("₹", "").strip()

                try:
                    rate = float(rate_raw)
                except ValueError:
                    rate = 0.0

                if not proc_name or proc_name.lower() == "nan" or rate <= 0:
                    continue

                if not code or code.lower() == "nan":
                    code = f"CGHS_{abs(hash(proc_name)) % 100000:05d}"

                cursor.execute("""
                    INSERT INTO cghs_detailed_rates 
                    (procedure_code, procedure_name, speciality, tier, facility, ward, rate)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (code, proc_name, spec, tier, facility, ward, rate))

                total_rows += 1

                # Aggregate procedure rates across NABH and Non-NABH
                if code not in procedure_aggregates:
                    procedure_aggregates[code] = {
                        "name": proc_name,
                        "category": spec or "General",
                        "sub_category": ward or "General Ward",
                        "rates_nabh": [],
                        "rates_non_nabh": [],
                    }

                if "NON" in facility:
                    procedure_aggregates[code]["rates_non_nabh"].append(rate)
                else:
                    procedure_aggregates[code]["rates_nabh"].append(rate)

        except Exception as e:
            print(f"    [!] Error reading {fn}: {e}")

    conn.commit()
    print(f"[✓] Successfully inserted {total_rows:,} detailed rate entries into 'cghs_detailed_rates'.")

    # Aggregate into master cghs_rates table
    print(f"[*] Aggregating {len(procedure_aggregates):,} unique procedures into 'cghs_rates'...")
    master_inserted = 0
    for code, info in procedure_aggregates.items():
        nabh_list = info["rates_nabh"]
        non_nabh_list = info["rates_non_nabh"]

        rate_nabh = sum(nabh_list) / len(nabh_list) if nabh_list else ((sum(non_nabh_list) / len(non_nabh_list) * 1.15) if non_nabh_list else 0.0)
        rate_non_nabh = sum(non_nabh_list) / len(non_nabh_list) if non_nabh_list else (rate_nabh * 0.85)

        cursor.execute("""
            INSERT OR REPLACE INTO cghs_rates
            (procedure_code, name, rate_non_nabh, rate_nabh, category, sub_category)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            code,
            info["name"],
            round(rate_non_nabh, 2),
            round(rate_nabh, 2),
            info["category"],
            info["sub_category"]
        ))
        master_inserted += 1

    conn.commit()
    conn.close()

    print(f"[✓] Master 'cghs_rates' table updated with {master_inserted:,} unique medical procedures!")
    return master_inserted


def update_chroma_cghs_collection():
    """Optionally update ChromaDB cghs_collection with top representative procedures."""
    import sys
    BACKEND_ROOT = os.path.dirname(BASE_DIR)
    if BACKEND_ROOT not in sys.path:
        sys.path.insert(0, BACKEND_ROOT)

    try:
        from app.db.chroma_client import init_chroma_collections
        print("[*] Refreshing ChromaDB vector index with augmented CGHS tariff data...")
        colls = init_chroma_collections()
        cghs_col = colls.get("cghs_collection")

        if cghs_col:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("SELECT procedure_code, name, rate_non_nabh, rate_nabh, category FROM cghs_rates LIMIT 250")
            rows = cursor.fetchall()
            conn.close()

            doc_ids = []
            docs = []
            metas = []

            for r in rows:
                p_code, p_name, r_non, r_nabh, cat = r
                doc_id = f"cghs_csv_{p_code}"
                doc_ids.append(doc_id)
                docs.append(p_name)
                metas.append({
                    "procedure_code": str(p_code),
                    "rate_non_nabh": float(r_non),
                    "rate_nabh": float(r_nabh),
                    "category": str(cat),
                })

            cghs_col.upsert(ids=doc_ids, documents=docs, metadatas=metas)
            print(f"    [✓] ChromaDB 'cghs_collection' updated. Total items in collection: {cghs_col.count()}")
    except Exception as e:
        print(f"    [!] Notice on ChromaDB sync: {e}")


def main():
    print("=" * 70)
    print("      CENTRAL GOVERNMENT HEALTH SCHEME (CGHS) CSV INGESTION")
    print("=" * 70)
    ingest_cghs_csv_files()
    update_chroma_cghs_collection()
    print("\n[✓] CGHS Ingestion and Vector Update Complete!")


if __name__ == "__main__":
    main()
