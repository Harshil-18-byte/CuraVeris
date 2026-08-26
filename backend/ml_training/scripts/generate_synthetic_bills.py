"""Tier 2: Generate 500+ Realistic Synthetic Indian Hospital Bills.

Features:
- Full adherence to Section 2.2 schema (metadata, patient, line_items, bill_totals, risk_assessment, annotation_metadata).
- Comprehensive Indian Hospital network (Apollo, Fortis, AIIMS, Max, Manipal, Sahyadri, Ruby Hall, District Govt).
- Top Indian inpatient diagnoses with verified ICD-10 codes and procedure packages.
- 40% deliberate error injection:
  1. above_mrp: NPPA device cap or DPCO scheduled drug MRP breaches (1.5x - 3.2x)
  2. duplicate_charge: Unbundled or repeated diagnostic / procedural lines
  3. rate_anomaly: Arbitrary hospital markups (2.0x - 4.5x over CGHS NABH benchmark)
  4. gst_violation: Erroneous GST on exempt clinical healthcare services
  5. upcoding_suspected: Unjustified critical care escalation
  6. date_window_violation: Services billed outside inpatient stay

Outputs:
- ml_training/data/processed/synthetic_bills.jsonl
"""

import os
import json
import random
import uuid
from datetime import date, timedelta
from typing import List, Dict, Any

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")
OUTPUT_FILE = os.path.join(DATA_PROCESSED_DIR, "synthetic_bills.jsonl")
os.makedirs(DATA_PROCESSED_DIR, exist_ok=True)

random.seed(42)

# Reference Hospitals (Tiers 1, 2, 3 and Trust/Govt)
HOSPITALS = [
    {"name": "Apollo Hospitals", "city": "Mumbai", "tier": 1, "type": "private_corporate", "nabh": True},
    {"name": "Fortis Hospital", "city": "Bangalore", "tier": 1, "type": "private_corporate", "nabh": True},
    {"name": "AIIMS", "city": "Delhi", "tier": 1, "type": "government", "nabh": True},
    {"name": "Max Healthcare", "city": "Delhi", "tier": 1, "type": "private_corporate", "nabh": True},
    {"name": "Manipal Hospital", "city": "Bangalore", "tier": 1, "type": "private_corporate", "nabh": True},
    {"name": "Sahyadri Hospital", "city": "Pune", "tier": 2, "type": "private_corporate", "nabh": True},
    {"name": "District Government Hospital", "city": "Nagpur", "tier": 3, "type": "government", "nabh": False},
    {"name": "Ruby Hall Clinic", "city": "Pune", "tier": 2, "type": "trust", "nabh": True},
    {"name": "Care Hospitals", "city": "Hyderabad", "tier": 1, "type": "private_corporate", "nabh": True},
    {"name": "Sir Ganga Ram Hospital", "city": "Delhi", "tier": 1, "type": "trust", "nabh": True},
]

# Top Inpatient Diagnoses & ICD-10 Codes
DIAGNOSES = [
    {"name": "appendicitis", "icd": "K35.89", "avg_los": 3, "dept": "General Surgery", "pkg_rate": 42000.0, "cghs": 22000.0, "cghs_nabh": 25300.0, "proc": "laparoscopic_appendectomy"},
    {"name": "dengue", "icd": "A90", "avg_los": 5, "dept": "General Medicine", "pkg_rate": 35000.0, "cghs": 16000.0, "cghs_nabh": 18400.0, "proc": "iv_fluid_and_monitoring"},
    {"name": "cardiac_angioplasty", "icd": "I25.1", "avg_los": 4, "dept": "Cardiology", "pkg_rate": 155000.0, "cghs": 78000.0, "cghs_nabh": 89700.0, "proc": "ptca_with_des_stent", "has_stent": True},
    {"name": "normal_delivery", "icd": "Z37.0", "avg_los": 3, "dept": "Obstetrics", "pkg_rate": 38000.0, "cghs": 14000.0, "cghs_nabh": 16100.0, "proc": "normal_vaginal_delivery"},
    {"name": "cesarean_delivery", "icd": "O82.0", "avg_los": 4, "dept": "Obstetrics", "pkg_rate": 58000.0, "cghs": 18500.0, "cghs_nabh": 21275.0, "proc": "cesarean_section_lscs"},
    {"name": "fracture_leg", "icd": "S82.90", "avg_los": 5, "dept": "Orthopedics", "pkg_rate": 88000.0, "cghs": 38000.0, "cghs_nabh": 43700.0, "proc": "orif_with_implant"},
    {"name": "knee_replacement", "icd": "M17.0", "avg_los": 5, "dept": "Orthopedics", "pkg_rate": 195000.0, "cghs": 92000.0, "cghs_nabh": 105800.0, "proc": "total_knee_replacement", "has_knee": True},
    {"name": "typhoid", "icd": "A01.0", "avg_los": 6, "dept": "General Medicine", "pkg_rate": 26000.0, "cghs": 11500.0, "cghs_nabh": 13225.0, "proc": "iv_antibiotic_therapy"},
    {"name": "kidney_stone", "icd": "N20.0", "avg_los": 2, "dept": "Urology", "pkg_rate": 48000.0, "cghs": 21000.0, "cghs_nabh": 24150.0, "proc": "ursl_with_dj_stenting"},
    {"name": "hysterectomy", "icd": "N81.4", "avg_los": 5, "dept": "Gynecology", "pkg_rate": 68000.0, "cghs": 28000.0, "cghs_nabh": 32200.0, "proc": "laparoscopic_hysterectomy"},
    {"name": "cataract", "icd": "H25.9", "avg_los": 1, "dept": "Ophthalmology", "pkg_rate": 32000.0, "cghs": 9000.0, "cghs_nabh": 10350.0, "proc": "phacoemulsification_iol"},
    {"name": "cholecystitis", "icd": "K80.0", "avg_los": 3, "dept": "General Surgery", "pkg_rate": 49000.0, "cghs": 24500.0, "cghs_nabh": 28175.0, "proc": "laparoscopic_cholecystectomy"},
    {"name": "dialysis_esrd", "icd": "N18.5", "avg_los": 2, "dept": "Nephrology", "pkg_rate": 16000.0, "cghs": 6500.0, "cghs_nabh": 7475.0, "proc": "hemodialysis_monitoring"},
    {"name": "gastroenteritis", "icd": "A09", "avg_los": 3, "dept": "General Medicine", "pkg_rate": 22000.0, "cghs": 11000.0, "cghs_nabh": 12650.0, "proc": "iv_hydration_and_labs"},
    {"name": "pneumonia", "icd": "J18.9", "avg_los": 5, "dept": "Pulmonology", "pkg_rate": 44000.0, "cghs": 17000.0, "cghs_nabh": 19550.0, "proc": "pulmonary_inpatient_care"},
]

# Essential Medicines with DPCO MRP and CGHS Benchmarks
MEDICINES = [
    {"name": "Inj. Pantoprazole 40mg", "norm": "pantoprazole_injection_40mg", "mrp": 86.0, "cghs_rate": 62.0, "category": "medicine", "unit": "vials"},
    {"name": "Inj. Ondansetron 4mg", "norm": "ondansetron_injection_4mg", "mrp": 18.0, "cghs_rate": 12.0, "category": "medicine", "unit": "ampoules"},
    {"name": "Inj. Ceftriaxone 1gm", "norm": "ceftriaxone_injection_1gm", "mrp": 52.0, "cghs_rate": 38.0, "category": "medicine", "unit": "vials"},
    {"name": "IV NS 500ml", "norm": "normal_saline_500ml", "mrp": 28.0, "cghs_rate": 18.0, "category": "medicine", "unit": "bottles"},
    {"name": "Inj. Tramadol 2ml", "norm": "tramadol_injection_50mg", "mrp": 14.0, "cghs_rate": 9.0, "category": "medicine", "unit": "ampoules"},
    {"name": "Inj. Meropenem 1gm", "norm": "meropenem_injection_1gm", "mrp": 780.0, "cghs_rate": 450.0, "category": "medicine", "unit": "vials"},
    {"name": "Inj. Enoxaparin 40mg", "norm": "enoxaparin_injection_40mg", "mrp": 420.0, "cghs_rate": 280.0, "category": "medicine", "unit": "prefilled_syringes"},
]

# Consumables
CONSUMABLES = [
    {"name": "Surgical gloves pair", "norm": "surgical_gloves_pair", "rate": 40.0, "cghs": 25.0, "category": "consumable", "unit": "pairs"},
    {"name": "IV cannula 18G", "norm": "iv_cannula_18g", "rate": 35.0, "cghs": 25.0, "category": "consumable", "unit": "pieces"},
    {"name": "Urine bag 2L", "norm": "urine_bag_2l", "rate": 55.0, "cghs": 40.0, "category": "consumable", "unit": "pieces"},
    {"name": "Nasogastric tube 16Fr", "norm": "nasogastric_tube_16fr", "rate": 120.0, "cghs": 80.0, "category": "consumable", "unit": "pieces"},
    {"name": "Suture silk 2-0", "norm": "suture_silk_2_0", "rate": 85.0, "cghs": 55.0, "category": "consumable", "unit": "pieces"},
]

# Standard Diagnostics
DIAGNOSTICS = [
    {"name": "Complete Blood Count (CBC)", "norm": "complete_blood_count", "rate": 250.0, "cghs": 155.0, "category": "diagnostic", "unit": "test"},
    {"name": "Kidney Function Test (KFT)", "norm": "kidney_function_test", "rate": 450.0, "cghs": 260.0, "category": "diagnostic", "unit": "test"},
    {"name": "Liver Function Test (LFT)", "norm": "liver_function_test", "rate": 450.0, "cghs": 260.0, "category": "diagnostic", "unit": "test"},
    {"name": "Serum Electrolytes", "norm": "serum_electrolytes", "rate": 300.0, "cghs": 180.0, "category": "diagnostic", "unit": "test"},
    {"name": "X-Ray Chest PA View", "norm": "xray_chest_pa", "rate": 300.0, "cghs": 150.0, "category": "diagnostic", "unit": "test"},
]


def build_bill_record(bill_idx: int, hospital: dict, diagnosis: dict, los: int, error_flags_to_inject: list) -> dict:
    """Build a complete, fully annotated bill object."""
    adm_date = date(2024, 1, 1) + timedelta(days=(bill_idx * 3) % 250)
    disch_date = adm_date + timedelta(days=los)

    # Ward selection based on hospital tier
    ward_types = ["general", "semi_private", "private_deluxe"]
    ward = ward_types[bill_idx % len(ward_types)]
    base_room_rate = 2200 if ward == "general" else (3800 if ward == "semi_private" else 5500)
    if hospital["tier"] == 1:
        base_room_rate *= 1.25
    cghs_room = 1000.0 if ward == "general" else (2000.0 if ward == "semi_private" else 3000.0)
    cghs_room_nabh = cghs_room * 1.15

    items = []
    item_counter = 1

    # 1. Room Stay Line Item
    room_rate = float(base_room_rate)
    room_flags = []
    if "rate_anomaly" in error_flags_to_inject:
        room_rate *= random.uniform(2.2, 4.0)
        room_flags.append("rate_anomaly")

    room_total = round(room_rate * los, 2)
    room_cghs_total = round((cghs_room_nabh if hospital["nabh"] else cghs_room) * los, 2)
    room_overcharge = max(0.0, room_total - room_cghs_total) if room_flags else 0.0

    items.append({
        "item_id": f"LI_{item_counter:03d}",
        "raw_text": f"Room charges {ward.replace('_', ' ').title()} {los} days",
        "normalized_name": f"room_{ward}_per_day",
        "category": "accommodation",
        "quantity": float(los),
        "unit": "days",
        "charged_rate": round(room_rate, 2),
        "charged_total": room_total,
        "cghs_rate": cghs_room,
        "cghs_rate_nabh": cghs_room_nabh,
        "mrp": None,
        "nppa_ceiling": None,
        "gst_rate_charged": 0,
        "correct_gst_rate": 0,
        "risk_flags": room_flags,
        "overcharge_amount": round(room_overcharge, 2),
        "plain_english": f"{los} days room stay in {ward.replace('_', ' ')}",
        # ML feature backward compatibility
        "item_name": f"Room Rent {ward.title()}",
        "unit_price": round(room_rate, 2),
        "total_amount": room_total,
        "labels": {lbl: (1 if lbl in room_flags else 0) for lbl in [
            "above_mrp", "duplicate_charge", "rate_anomaly", "gst_violation", "upcoding_suspected", "date_window_violation"
        ]}
    })
    item_counter += 1

    # 2. Main Procedure
    proc_charge = float(diagnosis["pkg_rate"]) * (1.2 if hospital["tier"] == 1 else 1.0)
    proc_flags = []
    if "upcoding_suspected" in error_flags_to_inject:
        proc_charge *= 1.85
        proc_flags.append("upcoding_suspected")

    proc_cghs = float(diagnosis["cghs"])
    proc_cghs_nabh = float(diagnosis["cghs_nabh"])
    proc_overcharge = max(0.0, proc_charge - proc_cghs_nabh) if proc_flags else 0.0

    items.append({
        "item_id": f"LI_{item_counter:03d}",
        "raw_text": f"{str(diagnosis['proc']).replace('_', ' ').title()} Procedure",
        "normalized_name": str(diagnosis["proc"]),
        "category": "procedure",
        "quantity": 1.0,
        "unit": "procedure",
        "charged_rate": round(proc_charge, 2),
        "charged_total": round(proc_charge, 2),
        "cghs_rate": proc_cghs,
        "cghs_rate_nabh": proc_cghs_nabh,
        "mrp": None,
        "nppa_ceiling": None,
        "gst_rate_charged": 0,
        "correct_gst_rate": 0,
        "risk_flags": proc_flags,
        "overcharge_amount": round(proc_overcharge, 2),
        "plain_english": f"Surgical procedure for {diagnosis['name']}",
        "item_name": str(diagnosis['proc']),
        "unit_price": round(proc_charge, 2),
        "total_amount": round(proc_charge, 2),
        "labels": {lbl: (1 if lbl in proc_flags else 0) for lbl in [
            "above_mrp", "duplicate_charge", "rate_anomaly", "gst_violation", "upcoding_suspected", "date_window_violation"
        ]}
    })
    item_counter += 1

    # 3. Medical Device / Stent if applicable
    if diagnosis.get("has_stent"):
        stent_cap = 38260.0
        stent_charged = stent_cap * (random.uniform(1.4, 2.2) if "above_mrp" in error_flags_to_inject else 1.0)
        stent_flags = ["above_mrp", "nppa_ceiling_exceeded"] if ("above_mrp" in error_flags_to_inject) else []
        stent_overcharge = max(0.0, stent_charged - stent_cap)

        items.append({
            "item_id": f"LI_{item_counter:03d}",
            "raw_text": "Coronary Drug Eluting Stent (DES) Capped",
            "normalized_name": "coronary_des_stent",
            "category": "implant",
            "quantity": 1.0,
            "unit": "stent",
            "charged_rate": round(stent_charged, 2),
            "charged_total": round(stent_charged, 2),
            "cghs_rate": stent_cap,
            "cghs_rate_nabh": stent_cap,
            "mrp": stent_cap,
            "nppa_ceiling": stent_cap,
            "gst_rate_charged": 5,
            "correct_gst_rate": 5,
            "risk_flags": stent_flags,
            "overcharge_amount": round(stent_overcharge, 2),
            "plain_english": f"Coronary stent billed at ₹{stent_charged:,.2f} (NPPA statutory cap: ₹{stent_cap:,.2f})",
            "item_name": "Coronary Stent DES",
            "unit_price": round(stent_charged, 2),
            "total_amount": round(stent_charged, 2),
            "labels": {lbl: (1 if lbl in stent_flags else 0) for lbl in [
                "above_mrp", "duplicate_charge", "rate_anomaly", "gst_violation", "upcoding_suspected", "date_window_violation"
            ]}
        })
        item_counter += 1

    # 4. Medicines
    num_meds = random.randint(2, 4)
    for m in random.sample(MEDICINES, num_meds):
        qty = float(random.randint(2, 6))
        m_mrp = float(m["mrp"])
        m_cghs = float(m["cghs_rate"])
        charged_rate = m_mrp
        m_flags = []
        if "above_mrp" in error_flags_to_inject and random.random() < 0.6:
            charged_rate = m_mrp * round(random.uniform(1.5, 3.2), 2)
            m_flags.append("above_mrp")

        charged_total = round(charged_rate * qty, 2)
        m_overcharge = round((charged_rate - m_mrp) * qty, 2) if m_flags else 0.0

        items.append({
            "item_id": f"LI_{item_counter:03d}",
            "raw_text": f"{m['name']} x {int(qty)}",
            "normalized_name": str(m["norm"]),
            "category": "medicine",
            "quantity": qty,
            "unit": str(m["unit"]),
            "charged_rate": round(charged_rate, 2),
            "charged_total": charged_total,
            "cghs_rate": m_cghs,
            "cghs_rate_nabh": round(m_cghs * 1.15, 2),
            "mrp": m_mrp,
            "nppa_ceiling": None,
            "gst_rate_charged": 12,
            "correct_gst_rate": 12,
            "risk_flags": m_flags,
            "overcharge_amount": m_overcharge,
            "plain_english": f"{int(qty)} units of {m['name']} (MRP: ₹{m_mrp})",
            "item_name": str(m["name"]),
            "unit_price": round(charged_rate, 2),
            "total_amount": charged_total,
            "labels": {lbl: (1 if lbl in m_flags else 0) for lbl in [
                "above_mrp", "duplicate_charge", "rate_anomaly", "gst_violation", "upcoding_suspected", "date_window_violation"
            ]}
        })
        item_counter += 1

    # 5. Diagnostics
    for d in random.sample(DIAGNOSTICS, 2):
        qty = float(random.randint(1, 2))
        d_charge = float(d["rate"])
        d_cghs = float(d["cghs"])
        d_flags = []
        if "duplicate_charge" in error_flags_to_inject and random.random() < 0.5:
            # Double bill the diagnostic test
            qty *= 2.0
            d_flags.append("duplicate_charge")

        d_total = round(d_charge * qty, 2)
        d_overcharge = round(d_total * 0.5, 2) if d_flags else 0.0

        items.append({
            "item_id": f"LI_{item_counter:03d}",
            "raw_text": f"{d['name']} ({int(qty)} tests)",
            "normalized_name": str(d["norm"]),
            "category": "diagnostic",
            "quantity": qty,
            "unit": str(d["unit"]),
            "charged_rate": d_charge,
            "charged_total": d_total,
            "cghs_rate": d_cghs,
            "cghs_rate_nabh": round(d_cghs * 1.15, 2),
            "mrp": None,
            "nppa_ceiling": None,
            "gst_rate_charged": 0,
            "correct_gst_rate": 0,
            "risk_flags": d_flags,
            "overcharge_amount": d_overcharge,
            "plain_english": f"{int(qty)} diagnostic tests of {d['name']}",
            "item_name": str(d["name"]),
            "unit_price": d_charge,
            "total_amount": d_total,
            "labels": {lbl: (1 if lbl in d_flags else 0) for lbl in [
                "above_mrp", "duplicate_charge", "rate_anomaly", "gst_violation", "upcoding_suspected", "date_window_violation"
            ]}
        })
        item_counter += 1

    # 6. Consumables with potential GST violation or Date Window violation
    for c in random.sample(CONSUMABLES, 2):
        qty = float(random.randint(1, 4))
        c_rate = float(c["rate"])
        c_cghs = float(c["cghs"])
        c_flags = []

        gst_charged = 0
        correct_gst = 0
        if "gst_violation" in error_flags_to_inject and random.random() < 0.7:
            gst_charged = 18
            c_flags.append("gst_violation")

        if "date_window_violation" in error_flags_to_inject and random.random() < 0.5:
            c_flags.append("date_window_violation")

        c_total = round(c_rate * qty, 2)
        c_overcharge = round(c_total * (0.18 if "gst_violation" in c_flags else 0.5), 2) if c_flags else 0.0

        items.append({
            "item_id": f"LI_{item_counter:03d}",
            "raw_text": f"{c['name']} x {int(qty)}",
            "normalized_name": str(c["norm"]),
            "category": "consumable",
            "quantity": qty,
            "unit": str(c["unit"]),
            "charged_rate": c_rate,
            "charged_total": c_total,
            "cghs_rate": c_cghs,
            "cghs_rate_nabh": round(c_cghs * 1.15, 2),
            "mrp": None,
            "nppa_ceiling": None,
            "gst_rate_charged": gst_charged,
            "correct_gst_rate": correct_gst,
            "risk_flags": c_flags,
            "overcharge_amount": c_overcharge,
            "plain_english": f"{int(qty)} units of {c['name']}",
            "item_name": str(c["name"]),
            "unit_price": c_rate,
            "total_amount": c_total,
            "labels": {lbl: (1 if lbl in c_flags else 0) for lbl in [
                "above_mrp", "duplicate_charge", "rate_anomaly", "gst_violation", "upcoding_suspected", "date_window_violation"
            ]}
        })
        item_counter += 1

    # Totals
    total_billed = round(sum(it["charged_total"] for it in items), 2)
    total_overcharge = round(sum(it["overcharge_amount"] for it in items), 2)
    cgst = round(sum(it["charged_total"] * (it["gst_rate_charged"] / 200.0) for it in items), 2)
    sgst = cgst
    cgst_correct = round(sum(it["charged_total"] * (it["correct_gst_rate"] / 200.0) for it in items), 2)
    sgst_correct = cgst_correct

    # Risk Assessment
    all_flags = sorted(list(set(f for it in items for f in it["risk_flags"])))
    risk_score = 15
    if "above_mrp" in all_flags or "nppa_ceiling_exceeded" in all_flags:
        risk_score += 45
    if "rate_anomaly" in all_flags or "upcoding_suspected" in all_flags:
        risk_score += 25
    if "duplicate_charge" in all_flags:
        risk_score += 20
    if "gst_violation" in all_flags or "date_window_violation" in all_flags:
        risk_score += 15
    risk_score = min(100, risk_score)

    risk_cat = "critical" if risk_score >= 80 else ("high" if risk_score >= 60 else ("medium" if risk_score >= 35 else "low"))
    most_impactful = all_flags[0] if all_flags else "none"

    actions = []
    if "above_mrp" in all_flags or "nppa_ceiling_exceeded" in all_flags:
        actions.append("demand_statutory_price_cap_refund")
    if "duplicate_charge" in all_flags:
        actions.append("request_duplicate_charge_deletion")
    if "rate_anomaly" in all_flags:
        actions.append("demand_itemized_audit")
    if "gst_violation" in all_flags:
        actions.append("contest_illegal_gst_under_cpa2019")
    if not actions:
        actions.append("proceed_with_standard_insurance_claim")

    bill = {
        "bill_id": f"SYNTH_BILL_{bill_idx+1:04d}",
        "metadata": {
            "hospital_name": hospital["name"],
            "hospital_city": hospital["city"],
            "hospital_tier": hospital["tier"],
            "hospital_type": hospital["type"],
            "is_nabh_accredited": hospital["nabh"],
            "admission_date": adm_date.isoformat(),
            "discharge_date": disch_date.isoformat(),
            "los_days": los,
        },
        "patient": {
            "age_group": "adult_35_60" if bill_idx % 2 == 0 else "senior_60_plus",
            "gender": "male" if bill_idx % 2 == 0 else "female",
            "primary_diagnosis": diagnosis["name"],
            "icd10_code": diagnosis["icd"],
            "procedure": diagnosis["proc"],
            "ward_type": ward,
            "room_rate_per_day": float(round(room_rate, 2)),
        },
        "line_items": items,
        "bill_totals": {
            "total_billed": total_billed,
            "total_overcharge_detected": total_overcharge,
            "cgst": cgst,
            "sgst": sgst,
            "cgst_correct": cgst_correct,
            "sgst_correct": sgst_correct,
        },
        "risk_assessment": {
            "risk_score": risk_score,
            "risk_category": risk_cat,
            "risk_flags": all_flags,
            "most_impactful_flag": most_impactful,
            "recommended_actions": actions,
        },
        "annotation_metadata": {
            "annotator": "synthetic_rule_engine_v2",
            "annotation_date": date(2026, 8, 26).isoformat(),
            "confidence": "high",
            "source": "synthetic_bills_generator",
        },
        # Top-level backward compatibility attributes for ML trainer
        "diagnosis_icd": diagnosis["icd"],
        "hospital_name": hospital["name"],
        "city": hospital["city"],
        "total_amount": total_billed,
        "error_types_injected": all_flags,
    }

    return bill


def main():
    print("=" * 70)
    print("  TIER 2: GENERATING 500 SYNTHETIC INDIAN HOSPITAL BILLS")
    print("=" * 70)

    # 40% deliberate error injection rate
    error_rate = 0.40
    candidate_errors = [
        "above_mrp",
        "duplicate_charge",
        "rate_anomaly",
        "gst_violation",
        "upcoding_suspected",
        "date_window_violation",
    ]

    bills = []
    for i in range(500):
        hosp = random.choice(HOSPITALS)
        diag = random.choice(DIAGNOSES)
        los = max(1, int(diag["avg_los"]) + random.randint(-1, 2))

        # Inject errors in 40% of bills
        inject = (random.random() < error_rate)
        selected_errors = []
        if inject:
            num_errs = random.choice([1, 2, 2, 3])
            selected_errors = random.sample(candidate_errors, k=num_errs)

        bill = build_bill_record(i, hosp, diag, los, selected_errors)
        bills.append(bill)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        for b in bills:
            f.write(json.dumps(b) + "\n")

    error_bills_count = sum(1 for b in bills if b["risk_assessment"]["risk_flags"])
    total_line_items = sum(len(b["line_items"]) for b in bills)

    print(f"[✓] Generated 500 synthetic bills saved to: {OUTPUT_FILE}")
    print(f"    - Total line items: {total_line_items}")
    print(f"    - Error bills: {error_bills_count} / 500 ({error_bills_count/500*100:.1f}%)")
    print(f"    - Clean bills: {500 - error_bills_count} / 500")


if __name__ == "__main__":
    main()
