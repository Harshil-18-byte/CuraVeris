"""Script: Parse NPPA pharmaceutical/device gazette prices into SQLite nppa.db.

Sources (in priority order):
  1. data/raw/csv/nppaipdms.csv  — NPPA IPDMS gazette MRP data (952 entries)
  2. app.db.reference_data.NPPA_SEEDS — curated medical device ceiling seeds

Output:
  data/reference/nppa.db
    • nppa_devices(id, device_name, category, ceiling_price, order_reference)
    • nppa_drugs(id, drug_name, formulation, year, gazette_ref, mrp_per_unit)

CLI:
  python parse_nppa_excel.py [--input <csv_path>] [--output <db_path>]
"""

import os
import re
import sys
import sqlite3
import argparse
import pandas as pd

# ─── Path Setup ────────────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ML_DIR = os.path.dirname(SCRIPT_DIR)
BACKEND_ROOT = os.path.dirname(ML_DIR)

for path in [BACKEND_ROOT, ML_DIR]:
    if path not in sys.path:
        sys.path.insert(0, path)

DEFAULT_CSV = os.path.join(ML_DIR, "data", "raw", "csv", "nppaipdms.csv")
DEFAULT_DB = os.path.join(ML_DIR, "data", "reference", "nppa.db")


def parse_price(price_str: str) -> float:
    """Extract numeric MRP from strings like '₹ 0.28(1 Tablet)' or '₹ 3990.62(Each Pack)'."""
    if not price_str:
        return 0.0
    cleaned = re.sub(r"[₹\s]", "", str(price_str))
    match = re.search(r"([\d,]+\.?\d*)", cleaned)
    if match:
        return float(match.group(1).replace(",", ""))
    return 0.0


def infer_category(drug_name: str, formulation: str) -> str:
    """Infer broad therapeutic category from name/formulation keywords."""
    combined = f"{drug_name} {formulation}".lower()
    if any(k in combined for k in ["stent", "pacemaker", "balloon", "catheter", "defibrillator", "implant", "prosth"]):
        return "Medical Device / Implant"
    if any(k in combined for k in ["vaccine", "immunoglobulin", "anti-d", "anti-rabies"]):
        return "Vaccines & Biologicals"
    if any(k in combined for k in ["insulin", "metformin", "glipizide", "glibenclamide", "sitagliptin"]):
        return "Antidiabetics"
    if any(k in combined for k in ["amoxicillin", "ceftriaxone", "ciprofloxacin", "azithromycin",
                                    "meropenem", "piperacillin", "ampicillin", "doxycycline"]):
        return "Antibiotics"
    if any(k in combined for k in ["atorvastatin", "rosuvastatin", "aspirin", "clopidogrel",
                                    "enalapril", "amlodipine", "metoprolol", "ramipril"]):
        return "Cardiovascular"
    if any(k in combined for k in ["paracetamol", "ibuprofen", "diclofenac", "tramadol", "morphine"]):
        return "Analgesics / NSAIDs"
    if any(k in combined for k in ["pantoprazole", "omeprazole", "ranitidine", "ondansetron"]):
        return "Gastrointestinal"
    if any(k in combined for k in ["salbutamol", "budesonide", "montelukast", "theophylline"]):
        return "Respiratory"
    if any(k in combined for k in ["rifampicin", "isoniazid", "ethambutol", "pyrazinamide"]):
        return "Anti-TB"
    if any(k in combined for k in ["furosemide", "spironolactone", "hydrochlorothiazide"]):
        return "Diuretics"
    if any(k in combined for k in ["amlodipine", "nifedipine", "losartan", "telmisartan"]):
        return "Antihypertensives"
    if any(k in combined for k in ["phenobarbit", "phenytoin", "valproate", "carbamazepine",
                                    "levetiracetam", "clonazepam"]):
        return "Antiepileptics"
    if any(k in combined for k in ["injection", "inj", "infusion", "iv"]):
        return "Injectable Preparations"
    if any(k in combined for k in ["tablet", "tab", "capsule", "cap"]):
        return "Oral Solid Dosage"
    if any(k in combined for k in ["cream", "ointment", "lotion", "gel", "drops"]):
        return "Topical / Ophthalmic"
    return "Pharmaceutical"


def init_db(db_path: str) -> sqlite3.Connection:
    """Initialize SQLite database with nppa_devices and nppa_drugs tables."""
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS nppa_devices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            device_name TEXT NOT NULL,
            category TEXT NOT NULL,
            ceiling_price REAL NOT NULL,
            order_reference TEXT NOT NULL
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS nppa_drugs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            drug_name TEXT NOT NULL,
            formulation TEXT NOT NULL,
            year INTEGER,
            gazette_ref TEXT,
            mrp_per_unit REAL NOT NULL,
            category TEXT NOT NULL
        )
    """)
    conn.commit()
    return conn


def load_nppa_seeds(conn: sqlite3.Connection) -> int:
    """Load curated medical device ceiling prices.
    Note: NPPA_SEEDS constant moved here from reference_data.
    """
    NPPA_DEVICE_SEEDS = [
        ("Drug Eluting Stent (DES) - Coronary", "Coronary Stent", 27890.0, "NPPA/Device/2023/DES"),
        ("Bare Metal Stent (BMS) - Coronary", "Coronary Stent", 7260.0, "NPPA/Device/2023/BMS"),
        ("Knee Implant - Cemented TKR", "Orthopaedic Implant", 54720.0, "NPPA/Device/2022/TKR"),
        ("Hip Implant - Primary Total Hip Replacement", "Orthopaedic Implant", 59720.0, "NPPA/Device/2022/THR"),
        ("Intraocular Lens (IOL) - Monofocal", "Ophthalmic Device", 6750.0, "NPPA/Device/2021/IOL"),
        ("Intraocular Lens (IOL) - Multifocal", "Ophthalmic Device", 55000.0, "NPPA/Device/2021/IOL"),
        ("Cardiac Pacemaker - Single Chamber", "Cardiac Device", 55550.0, "NPPA/Device/2023/PM"),
        ("Cardiac Pacemaker - Dual Chamber", "Cardiac Device", 96700.0, "NPPA/Device/2023/PM"),
        ("ICD - Implantable Cardioverter Defibrillator", "Cardiac Device", 250000.0, "NPPA/Device/2023/ICD"),
        ("PTCA Balloon Catheter", "Interventional Device", 7500.0, "NPPA/Device/2023/PTCA"),
        ("Spinal Fixation System - Titanium", "Orthopaedic Implant", 45000.0, "NPPA/Device/2022/SPINE"),
    ]

    cursor = conn.cursor()
    cursor.execute("DELETE FROM nppa_devices")
    for row in NPPA_DEVICE_SEEDS:
        cursor.execute(
            "INSERT INTO nppa_devices (device_name, category, ceiling_price, order_reference) VALUES (?, ?, ?, ?)",
            (row[0], row[1], float(row[2]), row[3])
        )
    conn.commit()
    return len(NPPA_DEVICE_SEEDS)


def load_nppaipdms_csv(conn: sqlite3.Connection, csv_path: str) -> int:
    """Parse nppaipdms.csv gazette MRP data into nppa_drugs table."""
    if not os.path.exists(csv_path):
        print(f"[!] CSV file not found: {csv_path}")
        return 0

    try:
        df = pd.read_csv(csv_path, header=0)
    except Exception as e:
        print(f"[!] Failed to read CSV: {e}")
        return 0

    # Columns: sno, year, drug_name, formulation, gazette_ref, price_per_unit
    cols = df.columns.tolist()
    if len(cols) < 6:
        print(f"[!] Unexpected CSV structure: {cols}")
        return 0

    # Rename for clarity
    df.columns = ["sno", "year", "drug_name", "formulation", "gazette_ref", "price_str"]

    cursor = conn.cursor()
    cursor.execute("DELETE FROM nppa_drugs")

    inserted = 0
    skipped = 0
    for _, row in df.iterrows():
        drug_name = str(row.get("drug_name", "")).strip()
        formulation = str(row.get("formulation", "")).strip()
        price_str = str(row.get("price_str", "0")).strip()

        if not drug_name or drug_name.lower() == "nan":
            skipped += 1
            continue

        try:
            year = int(float(str(row.get("year", 0))))
        except (ValueError, TypeError):
            year = 0

        gazette_ref = str(row.get("gazette_ref", "")).strip()
        mrp = parse_price(price_str)

        if mrp <= 0:
            skipped += 1
            continue

        category = infer_category(drug_name, formulation)

        cursor.execute(
            "INSERT INTO nppa_drugs (drug_name, formulation, year, gazette_ref, mrp_per_unit, category) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (drug_name, formulation, year, gazette_ref, mrp, category)
        )
        inserted += 1

    conn.commit()
    return inserted


def main():
    parser = argparse.ArgumentParser(description="Parse NPPA gazette prices into SQLite nppa.db")
    parser.add_argument("--input", type=str, default=DEFAULT_CSV, help="Path to nppaipdms.csv")
    parser.add_argument("--output", type=str, default=DEFAULT_DB, help="Path to output nppa.db")
    args = parser.parse_args()

    print("=" * 70)
    print("         NPPA GAZETTE PRICE DATABASE BUILDER")
    print("=" * 70)
    print(f"[*] Input CSV : {args.input}")
    print(f"[*] Output DB : {args.output}")

    conn = init_db(args.output)

    # Load device ceiling prices
    device_count = load_nppa_seeds(conn)
    print(f"[✓] Loaded {device_count} regulated medical device ceiling prices (NPPA_SEEDS)")

    # Load NLEM/DPCO drug prices from CSV
    drug_count = load_nppaipdms_csv(conn, args.input)
    print(f"[✓] Loaded {drug_count} NPPA gazette drug MRP records from CSV")

    # Verification
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM nppa_devices")
    dev_total = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM nppa_drugs")
    drug_total = cursor.fetchone()[0]

    cursor.execute("SELECT drug_name, formulation, mrp_per_unit, category FROM nppa_drugs LIMIT 5")
    samples = cursor.fetchall()
    conn.close()

    print(f"\n[✓] NPPA Database Verification:")
    print(f"    nppa_devices : {dev_total} regulated device/implant price caps")
    print(f"    nppa_drugs   : {drug_total} gazette essential medicine MRPs")
    print(f"\n    Sample Drugs:")
    for s in samples:
        print(f"    - {s[0]} | {s[1]} | ₹{s[2]:.2f}/unit | {s[3]}")

    if drug_total >= 700:
        print(f"\n[✓] STEP 7 NPPA CHECK PASSED: {drug_total} entries ≥ 700 threshold")
    else:
        print(f"\n[!] STEP 7 NPPA CHECK: {drug_total} entries — below 700 threshold")


if __name__ == "__main__":
    main()
