"""CuraVeris — Clinical Pathway Scenario Generator (Layer 2).

Generates end-to-end clinically realistic hospital inpatient bills modeled on authentic
treatment pathways:
  Patient Profile -> Diagnosis (ICD-10) -> Hospital Tier (NABH/non-NABH)
  -> Length of Stay (ALOS) -> Procedures -> Implants -> Pharmacy -> Consumables
  -> Diagnostics -> Professional Fees -> Taxes -> Verified Totals.
"""

import os
import json
import random
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, cast

HOSPITALS: List[Dict[str, Any]] = [
    {"name": "Apollo Super Speciality Hospital", "city": "New Delhi", "state": "Delhi", "tier": 1, "is_nabh": True},
    {"name": "Fortis Escorts Heart Institute", "city": "New Delhi", "state": "Delhi", "tier": 1, "is_nabh": True},
    {"name": "Max Super Speciality Hospital", "city": "Saket, New Delhi", "state": "Delhi", "tier": 1, "is_nabh": True},
    {"name": "Medanta The Medicity", "city": "Gurugram", "state": "Haryana", "tier": 1, "is_nabh": True},
    {"name": "Manipal Hospital", "city": "Bengaluru", "state": "Karnataka", "tier": 1, "is_nabh": True},
    {"name": "Narayana Institute of Cardiac Sciences", "city": "Bengaluru", "state": "Karnataka", "tier": 1, "is_nabh": True},
    {"name": "Kokilaben Dhirubhai Ambani Hospital", "city": "Mumbai", "state": "Maharashtra", "tier": 1, "is_nabh": True},
    {"name": "Lilavati Hospital & Research Centre", "city": "Mumbai", "state": "Maharashtra", "tier": 1, "is_nabh": True},
    {"name": "Ruby Hall Clinic", "city": "Pune", "state": "Maharashtra", "tier": 2, "is_nabh": True},
    {"name": "KIMS Hospitals", "city": "Hyderabad", "state": "Telangana", "tier": 1, "is_nabh": True},
    {"name": "Care Hospitals", "city": "Bhubaneswar", "state": "Odisha", "tier": 2, "is_nabh": False},
    {"name": "Surat Civil Trust Hospital", "city": "Surat", "state": "Gujarat", "tier": 2, "is_nabh": False},
    {"name": "Shalby Multispecialty Hospital", "city": "Ahmedabad", "state": "Gujarat", "tier": 2, "is_nabh": True},
    {"name": "Apex City Hospital", "city": "Jaipur", "state": "Rajasthan", "tier": 2, "is_nabh": False},
    {"name": "Ganga Hospital", "city": "Coimbatore", "state": "Tamil Nadu", "tier": 2, "is_nabh": True},
    {"name": "Patna Care Nursing Home", "city": "Patna", "state": "Bihar", "tier": 3, "is_nabh": False},
    {"name": "Lucknow Metro Hospital", "city": "Lucknow", "state": "Uttar Pradesh", "tier": 2, "is_nabh": False},
    {"name": "Ranchi Lifeline Hospital", "city": "Ranchi", "state": "Jharkhand", "tier": 3, "is_nabh": False},
]

CLINICAL_PATHWAYS: List[Dict[str, Any]] = [
    {
        "pathway_id": "CARDIAC_PTCA_STENT",
        "diagnosis": "Acute Anterior Wall Myocardial Infarction (STEMI) with Primary PCI",
        "icd10_code": "I21.09",
        "alos_days": (3, 5),
        "icu_days": (1, 2),
        "primary_procedure": {
            "name": "Percutaneous Transluminal Coronary Angioplasty (PTCA)",
            "cghs_code": "CGHS_064",
            "base_rate": 55000.0,
            "category": "procedure"
        },
        "diagnostics": [
            ("Coronary Angiography (CAG)", 7500.0, "diagnostic"),
            ("12-Lead Electrocardiogram (ECG)", 150.0, "diagnostic"),
            ("Echocardiography with Color Doppler", 1450.0, "diagnostic"),
            ("Serum Troponin-I Quantitative", 650.0, "diagnostic"),
            ("Complete Blood Count (CBC)", 155.0, "diagnostic"),
            ("Kidney Function Test (KFT)", 260.0, "diagnostic"),
        ],
        "implants": [
            ("Drug Eluting Coronary Stent (DES) - Everolimus", 38260.0, "implant", "NPPA_DES"),
            ("PTCA Steerable Guide Wire", 3200.0, "consumable", None),
            ("PTCA Balloon Dilatation Catheter", 11200.0, "implant", "NPPA_BALLOON"),
        ],
        "pharmacy": [
            ("Inj. Enoxaparin 60mg PFS", 580.0, 4, "pharmacy", "DPCO"),
            ("Inj. Pantoprazole 40mg IV", 54.20, 6, "pharmacy", "DPCO"),
            ("Tab. Atorvastatin 40mg", 24.00, 5, "pharmacy", "DPCO"),
            ("Tab. Clopidogrel 75mg", 11.20, 10, "pharmacy", "DPCO"),
            ("Tab. Aspirin 75mg", 1.50, 10, "pharmacy", "DPCO"),
            ("IV Normal Saline 0.9% 500ml", 24.50, 8, "pharmacy", "DPCO"),
        ],
        "consumables": [
            ("Sterile Angiography Drape Kit", 850.0, "consumable"),
            ("IV Cannula 20G with Fixator", 95.0, "consumable"),
            ("Sterile Surgical Gloves 7.0 (Pairs)", 65.0, "consumable"),
        ]
    },
    {
        "pathway_id": "ORTHO_TKR_UNILATERAL",
        "diagnosis": "Severe Tricompartmental Osteoarthritis Knee with Total Knee Arthroplasty",
        "icd10_code": "M17.11",
        "alos_days": (4, 6),
        "icu_days": (0, 1),
        "primary_procedure": {
            "name": "Total Knee Replacement (TKR) Unilateral",
            "cghs_code": "CGHS_066",
            "base_rate": 85000.0,
            "category": "procedure"
        },
        "diagnostics": [
            ("X-Ray Both Knees AP/Lateral Standing View", 400.0, "diagnostic"),
            ("Complete Blood Count (CBC)", 155.0, "diagnostic"),
            ("Coagulation Profile (PT/INR)", 350.0, "diagnostic"),
            ("Pre-Operative Cardiac Clearance (ECG + Echo)", 1600.0, "diagnostic"),
            ("Urine Routine & Microscopy", 55.0, "diagnostic"),
        ],
        "implants": [
            ("Primary Knee Implant System (Cruciate Retaining)", 63800.0, "implant", "NPPA_KNEE"),
            ("Antibiotic Loaded Bone Cement (40g pack)", 3800.0, "implant", "NPPA_CEMENT"),
        ],
        "pharmacy": [
            ("Inj. Cefuroxime 1.5g IV", 110.0, 6, "pharmacy", "DPCO"),
            ("Inj. Tramadol 50mg IV", 18.0, 4, "pharmacy", "DPCO"),
            ("Inj. Paracetamol 1000mg IV Infusion", 42.50, 6, "pharmacy", "DPCO"),
            ("Tab. Pantoprazole 40mg", 9.80, 7, "pharmacy", "DPCO"),
            ("Inj. Enoxaparin 40mg PFS (DVT Prophylaxis)", 420.0, 5, "pharmacy", "DPCO"),
        ],
        "consumables": [
            ("Disposable Orthopedic Drape Sheet Kit", 1200.0, "consumable"),
            ("Negative Pressure Wound Suction Drain 14G", 450.0, "consumable"),
            ("Sterile Gauze and Compression Bandage 15cm", 180.0, "consumable"),
        ]
    },
    {
        "pathway_id": "GASTRO_LAP_CHOLECYSTECTOMY",
        "diagnosis": "Symptomatic Cholelithiasis with Chronic Cholecystitis",
        "icd10_code": "K80.20",
        "alos_days": (2, 3),
        "icu_days": (0, 0),
        "primary_procedure": {
            "name": "Laparoscopic Cholecystectomy",
            "cghs_code": "CGHS_062",
            "base_rate": 24500.0,
            "category": "procedure"
        },
        "diagnostics": [
            ("Ultrasound Whole Abdomen (USG)", 540.0, "diagnostic"),
            ("Liver Function Test (LFT Panel)", 260.0, "diagnostic"),
            ("Complete Blood Count (CBC)", 155.0, "diagnostic"),
            ("Serum Amylase & Lipase", 550.0, "diagnostic"),
        ],
        "implants": [
            ("Titanium Laparoscopic Ligating Clips (Medium-Large)", 850.0, "consumable", None),
        ],
        "pharmacy": [
            ("Inj. Amoxicillin + Clavulanic Acid 1.2g IV", 132.50, 4, "pharmacy", "DPCO"),
            ("Inj. Ondansetron 4mg IV", 12.80, 4, "pharmacy", "DPCO"),
            ("Inj. Tramadol 50mg IV", 18.0, 3, "pharmacy", "DPCO"),
            ("Inj. Pantoprazole 40mg IV", 54.20, 4, "pharmacy", "DPCO"),
            ("IV Ringer Lactate 500ml", 26.0, 4, "pharmacy", "DPCO"),
        ],
        "consumables": [
            ("Laparoscopic Hand Port / Trocar Seal 10mm", 650.0, "consumable"),
            ("Sterile Suction Irrigation Tubing 5mm", 320.0, "consumable"),
            ("Disposable Surgical Gowns (Reinforced)", 350.0, "consumable"),
        ]
    },
    {
        "pathway_id": "CARDIAC_CABG_OPEN_HEART",
        "diagnosis": "Triple Vessel Coronary Artery Disease for Off-Pump CABG",
        "icd10_code": "I25.10",
        "alos_days": (7, 10),
        "icu_days": (3, 5),
        "primary_procedure": {
            "name": "Coronary Artery Bypass Grafting (CABG)",
            "cghs_code": "CGHS_065",
            "base_rate": 138000.0,
            "category": "procedure"
        },
        "diagnostics": [
            ("Coronary Angiography Film CD", 7800.0, "diagnostic"),
            ("Cardiac Echo with Left Ventricular Function", 1450.0, "diagnostic"),
            ("Carotid Doppler Bilateral", 1800.0, "diagnostic"),
            ("Arterial Blood Gas (ABG Analysis x6)", 1800.0, "diagnostic"),
            ("Coagulation Profile & Cross Match", 1200.0, "diagnostic"),
        ],
        "implants": [
            ("Chest Sternotomy Sternal Wires (Stainless Steel)", 1800.0, "implant", None),
            ("Graftmaster Coronary Stabilizer (Octopus)", 12500.0, "consumable", None),
        ],
        "pharmacy": [
            ("Inj. Meropenem 1g IV", 950.0, 10, "pharmacy", "DPCO"),
            ("Inj. Piperacillin + Tazobactam 4.5g IV", 440.0, 8, "pharmacy", "DPCO"),
            ("Inj. Noradrenaline 4mg Ampoule", 85.0, 6, "pharmacy", "DPCO"),
            ("Inj. Potassium Chloride IV 20mEq", 32.0, 8, "pharmacy", "DPCO"),
            ("Tab. Atorvastatin 40mg", 24.0, 10, "pharmacy", "DPCO"),
        ],
        "consumables": [
            ("Cardiothoracic Surgery Custom Pack", 4500.0, "consumable"),
            ("Thoracic Chest Drainage Bottle with Tubing", 850.0, "consumable"),
            ("Endotracheal Tube 7.5mm with Cuff", 220.0, "consumable"),
        ]
    }
]


class ClinicalScenarioGenerator:
    """Generates authentic, highly realistic baseline hospital bills from clinical pathways."""

    def __init__(self, random_seed: int = 42):
        random.seed(random_seed)

    def generate_bill(self, bill_idx: int = 1) -> Dict[str, Any]:
        hosp = random.choice(HOSPITALS)
        pathway = random.choice(CLINICAL_PATHWAYS)

        stay_days = random.randint(*pathway["alos_days"])
        icu_days = min(random.randint(*pathway["icu_days"]), stay_days)
        ward_days = stay_days - icu_days

        start_date = datetime(2026, 1, 1) + timedelta(days=random.randint(0, 180))
        end_date = start_date + timedelta(days=stay_days)

        bill_id = f"CLIN_SCEN_{bill_idx:05d}"
        items = []
        item_counter = 1

        # 1. Room and Nursing
        if icu_days > 0:
            icu_rate = 5400.0 if hosp["is_nabh"] else 4500.0
            items.append({
                "item_id": f"LI_{item_counter:03d}",
                "raw_text": f"ICU Bed and Monitoring Charges ({icu_days} days)",
                "category": "room_nursing",
                "quantity": float(icu_days),
                "unit_price": icu_rate,
                "total_amount": round(icu_days * icu_rate, 2),
                "labels": self._clean_labels()
            })
            item_counter += 1

        if ward_days > 0:
            ward_rate = 3000.0 if hosp["is_nabh"] else 2200.0
            items.append({
                "item_id": f"LI_{item_counter:03d}",
                "raw_text": f"Special Ward Room Rent ({ward_days} days)",
                "category": "room_nursing",
                "quantity": float(ward_days),
                "unit_price": ward_rate,
                "total_amount": round(ward_days * ward_rate, 2),
                "labels": self._clean_labels()
            })
            item_counter += 1

        # Nursing Care
        nursing_rate = 450.0 if hosp["is_nabh"] else 350.0
        items.append({
            "item_id": f"LI_{item_counter:03d}",
            "raw_text": f"General Nursing and Patient Monitoring ({stay_days} days)",
            "category": "room_nursing",
            "quantity": float(stay_days),
            "unit_price": nursing_rate,
            "total_amount": round(stay_days * nursing_rate, 2),
            "labels": self._clean_labels()
        })
        item_counter += 1

        # 2. Primary Surgical / Medical Procedure
        proc = pathway["primary_procedure"]
        proc_markup = 1.15 if hosp["is_nabh"] else 1.0
        proc_rate = round(proc["base_rate"] * proc_markup, 2)
        items.append({
            "item_id": f"LI_{item_counter:03d}",
            "raw_text": proc["name"],
            "category": proc["category"],
            "quantity": 1.0,
            "unit_price": proc_rate,
            "total_amount": proc_rate,
            "labels": self._clean_labels()
        })
        item_counter += 1

        # Doctor / Specialist Visit
        doc_visits = stay_days
        doc_rate = 600.0 if hosp["is_nabh"] else 500.0
        items.append({
            "item_id": f"LI_{item_counter:03d}",
            "raw_text": f"Specialist Doctor Inpatient Rounds ({doc_visits} visits)",
            "category": "consultation",
            "quantity": float(doc_visits),
            "unit_price": doc_rate,
            "total_amount": round(doc_visits * doc_rate, 2),
            "labels": self._clean_labels()
        })
        item_counter += 1

        # 3. Implants
        for imp in pathway.get("implants", []):
            imp_name, imp_price, imp_cat, nppa_tag = imp
            items.append({
                "item_id": f"LI_{item_counter:03d}",
                "raw_text": imp_name,
                "category": imp_cat,
                "quantity": 1.0,
                "unit_price": float(imp_price),
                "total_amount": float(imp_price),
                "labels": self._clean_labels()
            })
            item_counter += 1

        # 4. Diagnostics
        for diag in pathway.get("diagnostics", []):
            d_name, d_price, d_cat = diag
            items.append({
                "item_id": f"LI_{item_counter:03d}",
                "raw_text": d_name,
                "category": d_cat,
                "quantity": 1.0,
                "unit_price": float(d_price),
                "total_amount": float(d_price),
                "labels": self._clean_labels()
            })
            item_counter += 1

        # 5. Pharmacy
        for rx in pathway.get("pharmacy", []):
            rx_name, rx_price, rx_qty, rx_cat, dpco_tag = rx
            items.append({
                "item_id": f"LI_{item_counter:03d}",
                "raw_text": rx_name,
                "category": rx_cat,
                "quantity": float(rx_qty),
                "unit_price": float(rx_price),
                "total_amount": round(rx_price * rx_qty, 2),
                "labels": self._clean_labels()
            })
            item_counter += 1

        # 6. Consumables
        for c in pathway.get("consumables", []):
            c_name, c_price, c_cat = c
            c_qty = float(random.randint(1, 3))
            items.append({
                "item_id": f"LI_{item_counter:03d}",
                "raw_text": c_name,
                "category": c_cat,
                "quantity": c_qty,
                "unit_price": float(c_price),
                "total_amount": round(c_price * c_qty, 2),
                "labels": self._clean_labels()
            })
            item_counter += 1

        total_billed = round(sum(i["total_amount"] for i in items), 2)

        return {
            "bill_id": bill_id,
            "hospital_name": hosp["name"],
            "city": hosp["city"],
            "state": hosp["state"],
            "tier": hosp["tier"],
            "is_nabh": hosp["is_nabh"],
            "admission_date": start_date.strftime("%Y-%m-%d"),
            "discharge_date": end_date.strftime("%Y-%m-%d"),
            "days_admitted": stay_days,
            "diagnosis": pathway["diagnosis"],
            "icd10_code": pathway["icd10_code"],
            "pathway_id": pathway["pathway_id"],
            "total_billed": total_billed,
            "line_items": items
        }

    @staticmethod
    def _clean_labels() -> Dict[str, int]:
        return {
            "nppa_ceiling_violation": 0,
            "above_mrp": 0,
            "consumable_unbundled": 0,
            "duplicate_charge": 0,
            "gst_on_exempt": 0,
            "rate_anomaly": 0,
            "package_unbundled": 0
        }
