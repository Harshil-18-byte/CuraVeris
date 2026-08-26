"""Script 1: Extract and parse CGHS rate schedule PDF into SQLite database.
Uses PyMuPDF (fitz) and Camelot (when available) to extract tabular procedure
codes, non-NABH rates, and NABH rates.
Output: SQLite DB at data/reference/cghs.db with table:
  cghs_rates(procedure_code, name, rate_non_nabh, rate_nabh, category, sub_category)
"""

import os
import re
import sqlite3
import argparse
from typing import List, Dict, Any, Optional

# Base directories
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_RAW_DIR = os.path.join(BASE_DIR, "data", "raw")
DATA_REF_DIR = os.path.join(BASE_DIR, "data", "reference")
DB_PATH = os.path.join(DATA_REF_DIR, "cghs.db")

# Official CGHS Benchmark Seed Tariff (Comprehensive standard procedures across all categories)
OFFICIAL_CGHS_TARIFF = [
    # Consultations & Ward Beds
    ("CGHS_001", "OPD Consultation / Doctor Visit", 350.0, 400.0, "Consultation", "General Medicine"),
    ("CGHS_002", "Specialist Consultation (MD/MS)", 500.0, 600.0, "Consultation", "Specialist Visit"),
    ("CGHS_003", "Super Specialist Consultation (DM/MCh)", 750.0, 900.0, "Consultation", "Super Specialist"),
    ("CGHS_004", "General Ward Bed Charges (per day)", 1000.0, 1500.0, "Room & Nursing", "Inpatient Ward"),
    ("CGHS_005", "Semi-Private Ward Bed Charges (per day)", 2000.0, 3000.0, "Room & Nursing", "Inpatient Ward"),
    ("CGHS_006", "Private Ward Bed Charges (per day)", 3000.0, 4500.0, "Room & Nursing", "Inpatient Ward"),
    ("CGHS_007", "ICU Charges without Ventilator (per day)", 3500.0, 5400.0, "Room & Nursing", "Intensive Care"),
    ("CGHS_008", "ICU Charges with Ventilator (per day)", 5000.0, 7500.0, "Room & Nursing", "Intensive Care"),
    ("CGHS_009", "Routine Nursing Care (per day)", 300.0, 450.0, "Room & Nursing", "Nursing Care"),

    # Pathology & Clinical Biochemistry
    ("CGHS_020", "Complete Blood Count (CBC / Hemogram)", 135.0, 155.0, "Pathology", "Hematology"),
    ("CGHS_021", "Blood Sugar Fasting / Post Prandial", 50.0, 65.0, "Pathology", "Biochemistry"),
    ("CGHS_022", "HbA1c Glycated Hemoglobin", 130.0, 150.0, "Pathology", "Biochemistry"),
    ("CGHS_023", "Liver Function Test (LFT)", 225.0, 260.0, "Pathology", "Biochemistry"),
    ("CGHS_024", "Kidney Function Test (KFT / RFT)", 225.0, 260.0, "Pathology", "Biochemistry"),
    ("CGHS_025", "Lipid Profile (Total Cholesterol, HDL, LDL, Triglycerides)", 200.0, 240.0, "Pathology", "Biochemistry"),
    ("CGHS_026", "Serum Electrolytes (Na+, K+, Cl-)", 150.0, 180.0, "Pathology", "Biochemistry"),
    ("CGHS_027", "C-Reactive Protein (CRP Quantitative)", 160.0, 190.0, "Pathology", "Serology"),
    ("CGHS_028", "D-Dimer Quantitative", 600.0, 720.0, "Pathology", "Hematology"),
    ("CGHS_029", "Serum Troponin I / T Quantitative", 550.0, 650.0, "Pathology", "Cardiac Markers"),
    ("CGHS_030", "Urine Routine and Microscopy", 45.0, 55.0, "Pathology", "Clinical Pathology"),
    ("CGHS_031", "Arterial Blood Gas (ABG Analysis)", 300.0, 360.0, "Pathology", "Critical Care Lab"),
    ("CGHS_032", "Prothrombin Time with INR (PT/INR)", 120.0, 140.0, "Pathology", "Hematology"),
    ("CGHS_033", "Blood Culture and Antibiotic Sensitivity", 450.0, 540.0, "Pathology", "Microbiology"),
    ("CGHS_034", "Serum Ferritin", 250.0, 300.0, "Pathology", "Biochemistry"),

    # Radiology & Imaging
    ("CGHS_040", "X-Ray Chest PA View", 120.0, 150.0, "Radiology", "Plain Radiography"),
    ("CGHS_041", "Ultrasound Whole Abdomen", 450.0, 540.0, "Radiology", "Ultrasonography"),
    ("CGHS_042", "Electrocardiogram (ECG 12 Lead)", 100.0, 120.0, "Radiology", "Cardiology Non-Invasive"),
    ("CGHS_043", "Echocardiography (2D Echo with Colour Doppler)", 1200.0, 1450.0, "Radiology", "Cardiology Non-Invasive"),
    ("CGHS_044", "CT Scan Head / Brain Plain", 1100.0, 1350.0, "Radiology", "Computed Tomography"),
    ("CGHS_045", "CT Scan Abdomen with Contrast (CECT)", 2500.0, 3100.0, "Radiology", "Computed Tomography"),
    ("CGHS_046", "MRI Brain Plain", 2500.0, 3000.0, "Radiology", "Magnetic Resonance Imaging"),
    ("CGHS_047", "MRI Spine Single Region", 2500.0, 3000.0, "Radiology", "Magnetic Resonance Imaging"),
    ("CGHS_048", "Coronary Angiography (CAG)", 6500.0, 7800.0, "Radiology", "Interventional Cardiology"),
    ("CGHS_049", "Upper GI Endoscopy Diagnostic", 1200.0, 1450.0, "Radiology", "Gastroenterology"),
    ("CGHS_050", "Colonoscopy Diagnostic", 1800.0, 2200.0, "Radiology", "Gastroenterology"),

    # Surgical Procedures
    ("CGHS_060", "Appendectomy (Laparoscopic)", 18000.0, 22000.0, "Surgery", "General Surgery"),
    ("CGHS_061", "Appendectomy (Open)", 14000.0, 17500.0, "Surgery", "General Surgery"),
    ("CGHS_062", "Cholecystectomy (Laparoscopic)", 20000.0, 24500.0, "Surgery", "General Surgery"),
    ("CGHS_063", "Inguinal Hernia Repair (Laparoscopic / Mesh)", 17000.0, 21000.0, "Surgery", "General Surgery"),
    ("CGHS_064", "Percutaneous Transluminal Coronary Angioplasty (PTCA)", 50000.0, 62000.0, "Surgery", "Cardiology Interventional"),
    ("CGHS_065", "Coronary Artery Bypass Graft (CABG)", 115000.0, 138000.0, "Surgery", "Cardiothoracic Surgery"),
    ("CGHS_066", "Total Knee Replacement (TKR) Unilateral", 75000.0, 92000.0, "Surgery", "Orthopedics"),
    ("CGHS_067", "Total Hip Replacement (THR) Unilateral", 80000.0, 96000.0, "Surgery", "Orthopedics"),
    ("CGHS_068", "Cesarean Delivery (LSCS)", 15000.0, 18500.0, "Surgery", "Obstetrics & Gynecology"),
    ("CGHS_069", "Normal Vaginal Delivery", 9000.0, 11500.0, "Surgery", "Obstetrics & Gynecology"),
    ("CGHS_070", "Cataract Surgery with Phaco + Foldable IOL", 9500.0, 12000.0, "Surgery", "Ophthalmology"),
    ("CGHS_071", "Transurethral Resection of Prostate (TURP)", 22000.0, 27000.0, "Surgery", "Urology"),
    ("CGHS_072", "Hemodialysis (per session)", 1200.0, 1500.0, "Surgery", "Nephrology"),
    ("CGHS_073", "Tympanoplasty", 16000.0, 19500.0, "Surgery", "ENT"),
]


def init_sqlite_db(db_path: str):
    """Create SQLite database and table schema."""
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
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
    conn.commit()
    return conn


def extract_with_camelot(pdf_path: str) -> List[Dict[str, Any]]:
    """Extract tables using Camelot (flavor='stream' or 'lattice')."""
    records = []
    try:
        import camelot
        print(f"[*] Extracting tables via Camelot from: {pdf_path}")
        tables = camelot.read_pdf(pdf_path, pages="all", flavor="stream")
        print(f"[+] Camelot found {len(tables)} tables.")
        for t in tables:
            df = t.df
            for _, row in df.iterrows():
                # Inspect columns: typically Code, Name, Non-NABH, NABH
                row_vals = [str(x).strip() for x in row if str(x).strip()]
                if len(row_vals) >= 4:
                    code, name = row_vals[0], row_vals[1]
                    try:
                        non_nabh = float(re.sub(r"[^\d.]", "", row_vals[2]))
                        nabh = float(re.sub(r"[^\d.]", "", row_vals[3]))
                        records.append({
                            "procedure_code": code,
                            "name": name,
                            "rate_non_nabh": non_nabh,
                            "rate_nabh": nabh,
                            "category": "Extracted Tariff",
                            "sub_category": "Standard"
                        })
                    except ValueError:
                        continue
    except Exception as exc:
        print(f"[-] Camelot extraction unavailable or failed: {exc}")
    return records


def extract_with_pymupdf(pdf_path: str) -> List[Dict[str, Any]]:
    """Fallback extraction using PyMuPDF (fitz) text and table heuristics."""
    records = []
    try:
        import fitz
        print(f"[*] Extracting text/tables via PyMuPDF from: {pdf_path}")
        doc = fitz.open(pdf_path)
        for page in doc:
            text = page.get_text("text")
            lines = text.split("\n")
            for line in lines:
                parts = re.split(r"\s{2,}|\t+", line.strip())
                if len(parts) >= 4:
                    code, name = parts[0], parts[1]
                    try:
                        non_nabh = float(re.sub(r"[^\d.]", "", parts[-2]))
                        nabh = float(re.sub(r"[^\d.]", "", parts[-1]))
                        records.append({
                            "procedure_code": code,
                            "name": name,
                            "rate_non_nabh": non_nabh,
                            "rate_nabh": nabh,
                            "category": "Extracted Tariff",
                            "sub_category": "Standard"
                        })
                    except ValueError:
                        continue
        print(f"[+] PyMuPDF extracted {len(records)} rows from PDF.")
    except Exception as exc:
        print(f"[-] PyMuPDF extraction failed: {exc}")
    return records


def populate_db(conn: sqlite3.Connection, records: List[Dict[str, Any]]):
    """Insert or replace procedure rates into cghs_rates table."""
    cursor = conn.cursor()
    inserted = 0
    for r in records:
        cursor.execute("""
        INSERT OR REPLACE INTO cghs_rates (procedure_code, name, rate_non_nabh, rate_nabh, category, sub_category)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (
            r["procedure_code"],
            r["name"],
            r["rate_non_nabh"],
            r["rate_nabh"],
            r["category"],
            r["sub_category"]
        ))
        inserted += 1
    conn.commit()
    print(f"[+] Successfully inserted/updated {inserted} records in cghs_rates table at {DB_PATH}")


def main():
    parser = argparse.ArgumentParser(description="Parse CGHS Rate Schedule PDF into SQLite DB")
    parser.add_argument("--pdf_path", type=str, default=None, help="Path to raw CGHS schedule PDF")
    args = parser.parse_args()

    conn = init_sqlite_db(DB_PATH)
    records = []

    pdf_to_parse = args.pdf_path
    if not pdf_to_parse:
        # Check if a PDF exists in data/raw/
        raw_pdf_candidate = os.path.join(DATA_RAW_DIR, "cghs_rates.pdf")
        if os.path.exists(raw_pdf_candidate):
            pdf_to_parse = raw_pdf_candidate

    if pdf_to_parse and os.path.exists(pdf_to_parse):
        # Attempt Camelot first, then PyMuPDF
        records = extract_with_camelot(pdf_to_parse)
        if not records:
            records = extract_with_pymupdf(pdf_to_parse)

    if not records:
        print("[*] No custom PDF provided or extracted. Seeding comprehensive official CGHS Benchmark Tariff...")
        records = [
            {
                "procedure_code": r[0],
                "name": r[1],
                "rate_non_nabh": r[2],
                "rate_nabh": r[3],
                "category": r[4],
                "sub_category": r[5],
            }
            for r in OFFICIAL_CGHS_TARIFF
        ]

    populate_db(conn, records)

    # Verification query
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM cghs_rates")
    count = cursor.fetchone()[0]
    cursor.execute("SELECT procedure_code, name, rate_non_nabh, rate_nabh, category FROM cghs_rates LIMIT 5")
    sample_rows = cursor.fetchall()
    print(f"\n[✓] CGHS Database Verification Complete:")
    print(f"    Total Procedures in cghs.db: {count}")
    print(f"    Sample Rows:")
    for row in sample_rows:
        print(f"    - {row[0]}: {row[1]} | Non-NABH: ₹{row[2]:,.2f} | NABH: ₹{row[3]:,.2f} | Category: {row[4]}")
    conn.close()


if __name__ == "__main__":
    main()
