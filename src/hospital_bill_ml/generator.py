"""Scenario-Based Synthetic Medical Bill Generator."""

import random
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

from .schema import BillRecord, BillItem, AnomalyLabels

HOSPITAL_CATALOG = [
    {"name": "Apollo Super Speciality Hospital", "city": "New Delhi", "state": "Delhi", "tier": 1, "is_nabh": True},
    {"name": "Fortis Escorts Heart Institute", "city": "New Delhi", "state": "Delhi", "tier": 1, "is_nabh": True},
    {"name": "Medanta The Medicity", "city": "Gurugram", "state": "Haryana", "tier": 1, "is_nabh": True},
    {"name": "Manipal Hospital", "city": "Bengaluru", "state": "Karnataka", "tier": 1, "is_nabh": True},
    {"name": "Kokilaben Dhirubhai Ambani Hospital", "city": "Mumbai", "state": "Maharashtra", "tier": 1, "is_nabh": True},
    {"name": "Ruby Hall Clinic", "city": "Pune", "state": "Maharashtra", "tier": 2, "is_nabh": True},
    {"name": "KIMS Hospitals", "city": "Hyderabad", "state": "Telangana", "tier": 1, "is_nabh": True},
    {"name": "Surat Sunshine Multi-Specialty", "city": "Surat", "state": "Gujarat", "tier": 2, "is_nabh": False},
    {"name": "Shalby Multispecialty Hospital", "city": "Ahmedabad", "state": "Gujarat", "tier": 2, "is_nabh": True},
    {"name": "Patna Care Nursing Home", "city": "Patna", "state": "Bihar", "tier": 3, "is_nabh": False},
]

SCENARIO_BLUEPRINTS = [
    {
        "scenario_id": "SCEN_CARDIAC_PCI",
        "diagnosis": "Acute Anterior Wall STEMI with Primary PCI",
        "icd10_code": "I21.09",
        "alos_range": (3, 5),
        "icu_range": (1, 2),
        "primary_proc": ("Percutaneous Transluminal Coronary Angioplasty (PTCA)", 55000.0),
        "diagnostics": [
            ("Coronary Angiography (CAG)", 7500.0),
            ("12-Lead Electrocardiogram (ECG)", 150.0),
            ("Echocardiography with Color Doppler", 1450.0),
            ("Serum Troponin-I Quantitative", 650.0),
        ],
        "implants": [
            ("Drug Eluting Coronary Stent (DES) - Everolimus", 38260.0),
            ("PTCA Balloon Dilatation Catheter", 11200.0),
        ],
        "pharmacy": [
            ("Inj. Enoxaparin 60mg PFS", 580.0, 4),
            ("Inj. Pantoprazole 40mg IV", 54.20, 6),
            ("Tab. Atorvastatin 40mg", 24.00, 5),
            ("Tab. Clopidogrel 75mg", 11.20, 10),
        ],
        "consumables": [
            ("Sterile Angiography Drape Kit", 850.0, 1),
            ("IV Cannula 20G with Fixator", 95.0, 2),
        ]
    },
    {
        "scenario_id": "SCEN_ORTHO_TKR",
        "diagnosis": "Severe Tricompartmental Knee Osteoarthritis with TKA",
        "icd10_code": "M17.11",
        "alos_range": (4, 6),
        "icu_range": (0, 1),
        "primary_proc": ("Total Knee Replacement (TKR) Unilateral", 85000.0),
        "diagnostics": [
            ("X-Ray Both Knees AP/Lateral Standing", 400.0),
            ("Complete Blood Count (CBC)", 155.0),
            ("Coagulation Profile (PT/INR)", 350.0),
        ],
        "implants": [
            ("Primary Knee Implant System (Cruciate Retaining)", 63800.0),
            ("Antibiotic Loaded Bone Cement (40g pack)", 3800.0),
        ],
        "pharmacy": [
            ("Inj. Cefuroxime 1.5g IV", 110.0, 6),
            ("Inj. Tramadol 50mg IV", 18.0, 4),
            ("Tab. Pantoprazole 40mg", 9.80, 7),
        ],
        "consumables": [
            ("Orthopedic Drape Sheet Pack", 1200.0, 1),
            ("Wound Suction Drain 14G", 450.0, 1),
        ]
    },
    {
        "scenario_id": "SCEN_GASTRO_CHOLE",
        "diagnosis": "Symptomatic Cholelithiasis with Chronic Cholecystitis",
        "icd10_code": "K80.20",
        "alos_range": (2, 3),
        "icu_range": (0, 0),
        "primary_proc": ("Laparoscopic Cholecystectomy", 24500.0),
        "diagnostics": [
            ("Ultrasound Whole Abdomen (USG)", 540.0),
            ("Liver Function Test (LFT)", 260.0),
        ],
        "implants": [],
        "pharmacy": [
            ("Inj. Amoxicillin + Clavulanic Acid 1.2g IV", 132.50, 4),
            ("Inj. Ondansetron 4mg IV", 12.80, 4),
        ],
        "consumables": [
            ("Laparoscopic Trocar Port Seal", 650.0, 1),
            ("Sterile Surgical Gloves 7.5", 65.0, 3),
        ]
    }
]


class ScenarioBillGenerator:
    """Generates synthetic baseline hospital bills based on scenario state machines."""

    def __init__(self, random_seed: int = 42):
        self.seed = random_seed
        self.rng = random.Random(random_seed)

    def generate_bill(self, bill_idx: int) -> BillRecord:
        hosp = self.rng.choice(HOSPITAL_CATALOG)
        scen = self.rng.choice(SCENARIO_BLUEPRINTS)

        stay_days = self.rng.randint(*scen["alos_range"])
        icu_days = min(self.rng.randint(*scen["icu_range"]), stay_days)
        ward_days = stay_days - icu_days

        start_date = datetime(2026, 1, 1) + timedelta(days=self.rng.randint(0, 180))
        end_date = start_date + timedelta(days=stay_days)

        bill_id = f"SYNTH_BILL_{bill_idx:05d}"
        family_id = f"FAM_{bill_idx:05d}"
        items = []
        item_counter = 1

        # 1. Room & Nursing
        if icu_days > 0:
            rate = 5400.0 if hosp["is_nabh"] else 4500.0
            items.append(BillItem(
                item_id=f"LI_{item_counter:03d}",
                raw_text=f"ICU Bed Charges ({icu_days} days)",
                category="room_nursing",
                quantity=float(icu_days),
                unit_price=rate,
                total_amount=round(icu_days * rate, 2),
                labels=AnomalyLabels()
            ))
            item_counter += 1

        if ward_days > 0:
            rate = 3000.0 if hosp["is_nabh"] else 2200.0
            items.append(BillItem(
                item_id=f"LI_{item_counter:03d}",
                raw_text=f"Special Ward Room Rent ({ward_days} days)",
                category="room_nursing",
                quantity=float(ward_days),
                unit_price=rate,
                total_amount=round(ward_days * rate, 2),
                labels=AnomalyLabels()
            ))
            item_counter += 1

        # 2. Procedure
        p_name, p_rate = scen["primary_proc"]
        markup = 1.15 if hosp["is_nabh"] else 1.0
        final_proc_rate = round(p_rate * markup, 2)
        items.append(BillItem(
            item_id=f"LI_{item_counter:03d}",
            raw_text=p_name,
            category="procedure",
            quantity=1.0,
            unit_price=final_proc_rate,
            total_amount=final_proc_rate,
            labels=AnomalyLabels()
        ))
        item_counter += 1

        # 3. Implants
        for imp_name, imp_rate in scen["implants"]:
            items.append(BillItem(
                item_id=f"LI_{item_counter:03d}",
                raw_text=imp_name,
                category="implant",
                quantity=1.0,
                unit_price=imp_rate,
                total_amount=imp_rate,
                labels=AnomalyLabels()
            ))
            item_counter += 1

        # 4. Diagnostics
        for d_name, d_rate in scen["diagnostics"]:
            items.append(BillItem(
                item_id=f"LI_{item_counter:03d}",
                raw_text=d_name,
                category="diagnostic",
                quantity=1.0,
                unit_price=d_rate,
                total_amount=d_rate,
                labels=AnomalyLabels()
            ))
            item_counter += 1

        # 5. Pharmacy
        for rx_name, rx_rate, rx_qty in scen["pharmacy"]:
            items.append(BillItem(
                item_id=f"LI_{item_counter:03d}",
                raw_text=rx_name,
                category="pharmacy",
                quantity=float(rx_qty),
                unit_price=rx_rate,
                total_amount=round(rx_rate * rx_qty, 2),
                labels=AnomalyLabels()
            ))
            item_counter += 1

        # 6. Consumables
        for c_name, c_rate, c_qty in scen["consumables"]:
            items.append(BillItem(
                item_id=f"LI_{item_counter:03d}",
                raw_text=c_name,
                category="consumable",
                quantity=float(c_qty),
                unit_price=c_rate,
                total_amount=round(c_rate * c_qty, 2),
                labels=AnomalyLabels()
            ))
            item_counter += 1

        total_billed = round(sum(i.total_amount for i in items), 2)

        return BillRecord(
            bill_id=bill_id,
            family_id=family_id,
            hospital_name=hosp["name"],
            city=hosp["city"],
            state=hosp["state"],
            tier=hosp["tier"],
            is_nabh=hosp["is_nabh"],
            admission_date=start_date.strftime("%Y-%m-%d"),
            discharge_date=end_date.strftime("%Y-%m-%d"),
            days_admitted=stay_days,
            diagnosis=scen["diagnosis"],
            icd10_code=scen["icd10_code"],
            total_billed=total_billed,
            line_items=items,
            source_type="synthetic",
            scenario_id=scen["scenario_id"],
            generation_seed=self.seed,
            validation_status="VALIDATED"
        )
