import os
import sqlite3
from typing import Optional, Dict, Any, List
from app.core.config import settings
from app.core.logging import logger

REFERENCE_DB = settings.REFERENCE_DB_PATH

# Seed Data: CGHS Official Benchmark Rates (Sample of standard high-volume procedures)
CGHS_SEEDS = [
    # Consultations & Room
    ("CGHS_001", "OPD Consultation / Doctor Visit", 350, 400, "consultation"),
    ("CGHS_002", "Specialist Consultation (MD/MS)", 500, 600, "consultation"),
    ("CGHS_003", "Super Specialist Consultation (DM/MCh)", 750, 900, "consultation"),
    ("CGHS_004", "General Ward Bed Charges (per day)", 1000, 1500, "room_nursing"),
    ("CGHS_005", "Semi-Private Ward Bed Charges (per day)", 2000, 3000, "room_nursing"),
    ("CGHS_006", "Private Ward Bed Charges (per day)", 3000, 4500, "room_nursing"),
    ("CGHS_007", "ICU Charges without Ventilator (per day)", 3500, 5400, "room_nursing"),
    ("CGHS_008", "ICU Charges with Ventilator (per day)", 5000, 7500, "room_nursing"),
    ("CGHS_009", "Routine Nursing Care per day", 300, 450, "room_nursing"),
    
    # Pathology & Diagnostics
    ("CGHS_020", "Complete Blood Count (CBC / Hemogram)", 135, 155, "diagnostic"),
    ("CGHS_021", "Blood Sugar Fasting / Post Prandial", 50, 65, "diagnostic"),
    ("CGHS_022", "HbA1c Glycated Hemoglobin", 130, 150, "diagnostic"),
    ("CGHS_023", "Liver Function Test (LFT)", 225, 260, "diagnostic"),
    ("CGHS_024", "Kidney Function Test (KFT / RFT)", 225, 260, "diagnostic"),
    ("CGHS_025", "Lipid Profile", 200, 240, "diagnostic"),
    ("CGHS_026", "Serum Electrolytes (Na+, K+, Cl-)", 150, 180, "diagnostic"),
    ("CGHS_027", "C-Reactive Protein (CRP)", 160, 190, "diagnostic"),
    ("CGHS_028", "D-Dimer Quantitative", 600, 720, "diagnostic"),
    ("CGHS_029", "Serum Troponin I / T", 550, 650, "diagnostic"),
    ("CGHS_030", "Urine Routine and Microscopy", 45, 55, "diagnostic"),
    
    # Radiology & Imaging
    ("CGHS_040", "X-Ray Chest PA View", 120, 150, "diagnostic"),
    ("CGHS_041", "Ultrasound Whole Abdomen", 450, 540, "diagnostic"),
    ("CGHS_042", "Electrocardiogram (ECG)", 100, 120, "diagnostic"),
    ("CGHS_043", "Echocardiography (2D Echo with Doppler)", 1200, 1450, "diagnostic"),
    ("CGHS_044", "CT Scan Head / Brain Plain", 1100, 1350, "diagnostic"),
    ("CGHS_045", "CT Scan Abdomen with Contrast (CECT)", 2500, 3100, "diagnostic"),
    ("CGHS_046", "MRI Brain Plain", 2500, 3000, "diagnostic"),
    ("CGHS_047", "MRI Spine Single Region", 2500, 3000, "diagnostic"),
    ("CGHS_048", "Coronary Angiography", 6500, 7800, "procedure"),
    ("CGHS_049", "Upper GI Endoscopy (Diagnostic Gastro)", 1200, 1450, "diagnostic"),
    
    # Surgeries & Procedures
    ("CGHS_060", "Appendectomy (Laparoscopic)", 18000, 22000, "procedure"),
    ("CGHS_061", "Appendectomy (Open)", 14000, 17500, "procedure"),
    ("CGHS_062", "Cholecystectomy (Laparoscopic)", 20000, 24500, "procedure"),
    ("CGHS_063", "Inguinal Hernia Repair (Laparoscopic / Mesh)", 17000, 21000, "procedure"),
    ("CGHS_064", "Percutaneous Transluminal Coronary Angioplasty (PTCA)", 50000, 62000, "procedure"),
    ("CGHS_065", "Coronary Artery Bypass Graft (CABG)", 115000, 138000, "procedure"),
    ("CGHS_066", "Total Knee Replacement (TKR) Unilateral", 75000, 92000, "procedure"),
    ("CGHS_067", "Total Hip Replacement (THR) Unilateral", 80000, 96000, "procedure"),
    ("CGHS_068", "Cesarean Delivery (LSCS)", 15000, 18500, "procedure"),
    ("CGHS_069", "Normal Vaginal Delivery", 9000, 11500, "procedure"),
    ("CGHS_070", "Cataract Surgery with Phaco + Foldable IOL", 9500, 12000, "procedure"),
    ("CGHS_071", "Transurethral Resection of Prostate (TURP)", 22000, 27000, "procedure"),
    ("CGHS_072", "Hemodialysis (per session)", 1200, 1500, "procedure"),
]

# Seed Data: NPPA Gazette Device Ceiling Prices
NPPA_SEEDS = [
    ("Coronary Stent - Drug Eluting (DES)", "cardiac_stent", 38260.00, "NPPA Order S.O. 1234(E) 2023"),
    ("Coronary Stent - Bare Metal (BMS)", "cardiac_stent", 10500.00, "NPPA Order S.O. 1234(E) 2023"),
    ("Bioresorbable Vascular Scaffold (BVS)", "cardiac_stent", 38260.00, "NPPA Order S.O. 1234(E) 2023"),
    ("Knee Implant System - Primary TKR (Cruciate Retaining)", "orthopedic_implant", 62770.00, "NPPA Notification 2023"),
    ("Knee Implant System - Primary TKR (Posterior Stabilized)", "orthopedic_implant", 69940.00, "NPPA Notification 2023"),
    ("Knee Implant System - Revision TKR", "orthopedic_implant", 128480.00, "NPPA Notification 2023"),
    ("Knee Implant System - Specialized / Tumor", "orthopedic_implant", 137890.00, "NPPA Notification 2023"),
    ("Coronary Balloon Catheter (PTCA Balloon)", "cardiac_catheter", 11200.00, "NPPA Order 2022"),
    ("Cardiac Pacemaker - Single Chamber", "cardiac_device", 45000.00, "NPPA Benchmark Guide"),
    ("Cardiac Pacemaker - Dual Chamber", "cardiac_device", 85000.00, "NPPA Benchmark Guide"),
    ("Orthopedic Bone Cement (per 40g pack)", "orthopedic_consumable", 3800.00, "NPPA Price Cap 2022"),
]

# Seed Data: DPCO National List of Essential Medicines (NLEM) Drug Ceilings
DPCO_SEEDS = [
    ("Pantoprazole 40mg Injection", "Inj. 40mg vial", 54.20, True),
    ("Pantoprazole 40mg Tablet", "Tab 40mg", 9.80, True),
    ("Paracetamol 1000mg IV Infusion (100ml)", "IV 100ml bottle", 42.50, True),
    ("Paracetamol 650mg Tablet", "Tab 650mg", 2.10, True),
    ("Ceftriaxone 1g Injection", "Inj. 1g vial", 62.40, True),
    ("Amoxicillin + Clavulanic Acid 1.2g Injection", "Inj. 1.2g vial", 132.50, True),
    ("Amoxicillin + Clavulanic Acid 625mg Tablet", "Tab 625mg", 21.00, True),
    ("Meropenem 1g Injection", "Inj. 1g vial", 950.00, True),
    ("Piperacillin + Tazobactam 4.5g Injection", "Inj. 4.5g vial", 440.00, True),
    ("Enoxaparin 40mg / 0.4ml Prefilled Syringe", "Inj. 40mg PFS", 420.00, True),
    ("Enoxaparin 60mg / 0.6ml Prefilled Syringe", "Inj. 60mg PFS", 580.00, True),
    ("Atorvastatin 20mg Tablet", "Tab 20mg", 14.50, True),
    ("Atorvastatin 40mg Tablet", "Tab 40mg", 24.00, True),
    ("Clopidogrel 75mg Tablet", "Tab 75mg", 11.20, True),
    ("Aspirin 75mg Tablet", "Tab 75mg", 1.50, True),
    ("Ondansetron 4mg Injection (2ml)", "Inj. 4mg/2ml ampoule", 12.80, True),
    ("Tramadol 50mg Injection", "Inj. 50mg/ml ampoule", 18.00, True),
    ("Normal Saline 0.9% IV Infusion (500ml)", "500ml IV bottle", 24.50, True),
    ("Ringer Lactate IV Infusion (500ml)", "500ml IV bottle", 26.00, True),
    ("Human Insulin Regular 40 IU/ml (10ml vial)", "10ml vial", 158.00, True),
]

# Seed Data: IRDAI Standard Non-Payable Items (Items hospitals often wrongly bill or unbundle)
IRDAI_NON_PAYABLES = [
    "Surgical Gloves / Examination Gloves",
    "PPE Kit / Covid Shield Kit",
    "Admission Kit / Patient Welcome Kit",
    "Thermometer Cap / Probe Cover",
    "Cotton / Gauze / Bandage Rolls (routine ward use)",
    "Sanitizer / Hand Rub Bottle",
    "Bed Sheet / Gown Sanitization Fee",
    "Syringe & Needle Routine Disposal Fee",
    "Biomedical Waste Handling Charge",
    "Hospital Administration / Documentation Fee",
    "Registration Fee / Admission File Charge",
    "Dietitian Visit / Routine Nutritionist Charge",
    "Pulse Oximeter Finger Probe Charge",
    "Spirometer / Breathing Exerciser Kit",
    "Underpads / Diaper (Routine Post-op)",
    "Ice Bag / Hot Water Bottle Charge",
    "Infusion Set / IV Cannula Fixator (Routine unbundled)",
    "Nebulization Mask (Hospital reusable unbundled)",
    "Tissues / Face Wipes / Toiletries",
    "Medical Record Photocopy Charge",
]


def _ensure_db_valid():
    """Ensure reference database exists and is valid. Reinitialize if corrupted."""
    if not os.path.exists(REFERENCE_DB):
        init_reference_db()
        return
    
    try:
        # Test database validity with a test query
        conn = sqlite3.connect(REFERENCE_DB, timeout=5)
        cursor = conn.cursor()
        cursor.execute("SELECT 1 FROM cghs_rates LIMIT 1")
        conn.close()
    except (sqlite3.DatabaseError, sqlite3.OperationalError) as e:
        logger.warning(f"Reference database corrupted at {REFERENCE_DB}: {e}. Reinitializing...")
        try:
            if os.path.exists(REFERENCE_DB):
                os.remove(REFERENCE_DB)
        except Exception as remove_err:
            logger.error(f"Failed to remove corrupted database: {remove_err}")
        init_reference_db()


def init_reference_db():
    """Create tables and seed reference databases in SQLite."""
    try:
        os.makedirs(os.path.dirname(REFERENCE_DB) or ".", exist_ok=True)
        conn = sqlite3.connect(REFERENCE_DB, timeout=5)
        cursor = conn.cursor()

        # 1. CGHS Rates Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS cghs_rates (
            procedure_code TEXT PRIMARY KEY,
            procedure_name TEXT,
            rate_non_nabh REAL,
            rate_nabh REAL,
            category TEXT
        )
        """)

        # 2. NPPA Devices Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS nppa_devices (
            device_name TEXT PRIMARY KEY,
            category TEXT,
            ceiling_price_inr REAL,
            order_reference TEXT
        )
        """)

        # 3. DPCO Drugs Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS dpco_drugs (
            drug_name TEXT PRIMARY KEY,
            formulation TEXT,
            ceiling_price_per_unit REAL,
            scheduled INTEGER
        )
        """)

        # 4. IRDAI Non-Payables Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS irdai_non_payables (
            item_name TEXT PRIMARY KEY,
            category TEXT
        )
        """)

        # Seed CGHS
        for row in CGHS_SEEDS:
            cursor.execute(
                "INSERT OR REPLACE INTO cghs_rates VALUES (?, ?, ?, ?, ?)",
                row
            )

        # Seed NPPA
        for row in NPPA_SEEDS:
            cursor.execute(
                "INSERT OR REPLACE INTO nppa_devices VALUES (?, ?, ?, ?)",
                row
            )

        # Seed DPCO
        for row in DPCO_SEEDS:
            cursor.execute(
                "INSERT OR REPLACE INTO dpco_drugs VALUES (?, ?, ?, ?)",
                (row[0], row[1], row[2], 1 if row[3] else 0)
            )

        # Seed IRDAI
        for item in IRDAI_NON_PAYABLES:
            cursor.execute(
                "INSERT OR REPLACE INTO irdai_non_payables VALUES (?, ?)",
                (item, "standard_non_payable")
            )

        conn.commit()
        conn.close()
        logger.info(f"Reference database initialized and populated at {REFERENCE_DB}")
    except Exception as e:
        logger.error(f"Failed to initialize reference database: {e}")
        raise


def query_cghs_rate(item_name: str) -> Optional[Dict[str, Any]]:
    """Lookup CGHS benchmark rate by fuzzy/partial name match."""
    try:
        _ensure_db_valid()
        conn = sqlite3.connect(REFERENCE_DB, timeout=5)
        cursor = conn.cursor()
        
        import re
        # Clean and tokenize item name
        clean_item = re.sub(r"[^a-zA-Z0-9\s]", " ", item_name.lower())
        clean_item = re.sub(r"\s+", " ", clean_item).strip()
        tokens = [t for t in clean_item.split() if len(t) > 2]
        if not tokens:
            conn.close()
            return None

        query = "SELECT procedure_code, procedure_name, rate_non_nabh, rate_nabh, category FROM cghs_rates"
        cursor.execute(query)
        rows = cursor.fetchall()
        conn.close()

        best_match = None
        best_score = 0

        for row in rows:
            clean_proc = re.sub(r"[^a-zA-Z0-9\s]", " ", row[1].lower())
            clean_proc = re.sub(r"\s+", " ", clean_proc).strip()
            proc_tokens = set(clean_proc.split())

            # Exact normalized match
            if clean_proc == clean_item:
                score = 100
            elif clean_proc in clean_item or clean_item in clean_proc:
                score = 90
            else:
                # Overlapping word tokens
                shared = sum(1 for t in tokens if t in proc_tokens)
                score = (shared / max(len(tokens), 1)) * 80

            if score > best_score and score >= 40:
                best_score = score
                best_match = {
                    "procedure_code": row[0],
                    "procedure_name": row[1],
                    "rate_non_nabh": row[2],
                    "rate_nabh": row[3],
                    "category": row[4],
                    "match_confidence": round(score, 2)
                }

        return best_match
    except Exception as e:
        logger.error(f"Error querying CGHS rates: {e}")
        return None


def query_nppa_device(item_name: str) -> Optional[Dict[str, Any]]:
    """Lookup NPPA medical device ceiling price."""
    try:
        _ensure_db_valid()
        conn = sqlite3.connect(REFERENCE_DB, timeout=5)
        cursor = conn.cursor()
        cursor.execute("SELECT device_name, category, ceiling_price_inr, order_reference FROM nppa_devices")
        rows = cursor.fetchall()
        conn.close()

        item_lower = item_name.lower()
        for row in rows:
            dev_name = row[0].lower()
            # Key terms: stent, knee implant, bvs, catheter, pacemaker
            if ("stent" in item_lower and "stent" in dev_name) or \
               ("knee" in item_lower and "knee" in dev_name) or \
               ("pacemaker" in item_lower and "pacemaker" in dev_name) or \
               ("balloon" in item_lower and "balloon" in dev_name):
                # Check specific sub-keywords
                if ("drug eluting" in item_lower or "des" in item_lower) and "drug eluting" in dev_name:
                    return {"device_name": row[0], "category": row[1], "ceiling_price_inr": row[2], "order_reference": row[3]}
                elif ("bare metal" in item_lower or "bms" in item_lower) and "bare metal" in dev_name:
                    return {"device_name": row[0], "category": row[1], "ceiling_price_inr": row[2], "order_reference": row[3]}
                elif "knee" in item_lower and "posterior stabilized" in dev_name:
                    return {"device_name": row[0], "category": row[1], "ceiling_price_inr": row[2], "order_reference": row[3]}
                elif "knee" in item_lower and "cruciate" in dev_name:
                    return {"device_name": row[0], "category": row[1], "ceiling_price_inr": row[2], "order_reference": row[3]}
                elif any(word in dev_name for word in item_lower.split() if len(word) > 4):
                    return {"device_name": row[0], "category": row[1], "ceiling_price_inr": row[2], "order_reference": row[3]}
        return None
    except Exception as e:
        logger.error(f"Error querying NPPA devices: {e}")
        return None


def query_dpco_drug(item_name: str) -> Optional[Dict[str, Any]]:
    """
    Lookup DPCO / NLEM / Trade Margin Rationalization drug ceiling price.
    Checks comprehensive national pharmaceutical catalog (generic + Indian brands).
    """
    try:
        from app.db.pharma_database import lookup_pharmaceutical
        pharma_match = lookup_pharmaceutical(item_name)
        if pharma_match:
            return {
                "drug_name": pharma_match["generic_name"],
                "formulation": pharma_match["formulation"],
                "ceiling_price_per_unit": pharma_match["ceiling_inr"],
                "category": pharma_match.get("category", "pharmacy"),
                "legal_citation": pharma_match.get("citation", "DPCO 2013")
            }
    except Exception as e:
        logger.debug(f"Pharma database lookup failed: {e}, falling back to SQLite")

    # Fallback to local SQLite table
    try:
        _ensure_db_valid()
        conn = sqlite3.connect(REFERENCE_DB, timeout=5)
        cursor = conn.cursor()
        cursor.execute("SELECT drug_name, formulation, ceiling_price_per_unit, scheduled FROM dpco_drugs")
        rows = cursor.fetchall()
        conn.close()

        item_lower = item_name.lower()
        for row in rows:
            drug_core = row[0].split()[0].lower()  # e.g., 'pantoprazole', 'paracetamol'
            if drug_core in item_lower:
                if "inj" in item_lower and "inj" in row[0].lower():
                    return {"drug_name": row[0], "formulation": row[1], "ceiling_price_per_unit": row[2]}
                elif ("tab" in item_lower or "tablet" in item_lower) and "tab" in row[0].lower():
                    return {"drug_name": row[0], "formulation": row[1], "ceiling_price_per_unit": row[2]}
                elif "iv" in item_lower and "iv" in row[0].lower():
                    return {"drug_name": row[0], "formulation": row[1], "ceiling_price_per_unit": row[2]}
                else:
                    return {"drug_name": row[0], "formulation": row[1], "ceiling_price_per_unit": row[2]}
        return None
    except Exception as e:
        logger.error(f"Error querying DPCO drugs: {e}")
        return None


def is_irdai_non_payable(item_name: str) -> Optional[str]:
    """Check if item matches IRDAI standard non-payable list."""
    try:
        _ensure_db_valid()
        conn = sqlite3.connect(REFERENCE_DB, timeout=5)
        cursor = conn.cursor()
        cursor.execute("SELECT item_name FROM irdai_non_payables")
        rows = cursor.fetchall()
        conn.close()

        item_lower = item_name.lower()
        keywords = ["glove", "ppe", "sanitizer", "welcome kit", "admission kit", "thermometer",
                    "biomedical waste", "admin fee", "registration", "dietitian", "oximeter probe",
                    "spirometer", "gown sanitization", "diaper", "underpad"]

        for kw in keywords:
            if kw in item_lower:
                for row in rows:
                    if kw in row[0].lower():
                        return row[0]
                return f"Non-payable item matching '{kw}'"
        return None
    except Exception as e:
        logger.error(f"Error querying IRDAI non-payables: {e}")
        return None
