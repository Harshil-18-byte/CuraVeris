"""Hard Negatives Synthesizer for Realistic Non-Error Anomalies."""

import random
from typing import List

from .schema import BillRecord, BillItem, AnomalyLabels


class HardNegativeSynthesizer:
    """Generates complex, high-magnitude hospital bills that are 100% compliant."""

    def __init__(self, random_seed: int = 42):
        self.rng = random.Random(random_seed)

    def synthesize_twin_stents(self, idx: int) -> BillRecord:
        """Double DES stents for multivessel disease, each at exact NPPA cap."""
        items = [
            BillItem(
                item_id="LI_001",
                raw_text="PTCA Multi-Vessel Angioplasty Procedure",
                category="procedure",
                quantity=1.0,
                unit_price=68000.0,
                total_amount=68000.0,
                labels=AnomalyLabels()
            ),
            BillItem(
                item_id="LI_002",
                raw_text="Coronary Stent - Drug Eluting (DES) LAD Artery (Everolimus)",
                category="implant",
                quantity=1.0,
                unit_price=38260.0,
                total_amount=38260.0,
                labels=AnomalyLabels()
            ),
            BillItem(
                item_id="LI_003",
                raw_text="Coronary Stent - Drug Eluting (DES) RCA Artery (Zotarolimus)",
                category="implant",
                quantity=1.0,
                unit_price=38260.0,
                total_amount=38260.0,
                labels=AnomalyLabels()
            ),
            BillItem(
                item_id="LI_004",
                raw_text="ICU Monitoring Bed Charges (2 days)",
                category="room_nursing",
                quantity=2.0,
                unit_price=5400.0,
                total_amount=10800.0,
                labels=AnomalyLabels()
            ),
            BillItem(
                item_id="LI_005",
                raw_text="Coronary Angiography Film & Record CD",
                category="diagnostic",
                quantity=1.0,
                unit_price=7500.0,
                total_amount=7500.0,
                labels=AnomalyLabels()
            )
        ]
        total = round(sum(i.total_amount for i in items), 2)
        return BillRecord(
            bill_id=f"HARD_NEG_TWIN_{idx:05d}",
            family_id=f"FAM_HN_{idx:05d}",
            hospital_name="Medanta The Medicity",
            city="Gurugram",
            state="Haryana",
            tier=1,
            is_nabh=True,
            admission_date="2026-04-10",
            discharge_date="2026-04-14",
            days_admitted=4,
            diagnosis="Double Vessel Coronary Artery Disease with Severe Angina",
            icd10_code="I25.10",
            total_billed=total,
            line_items=items,
            source_type="hard_negative",
            scenario_id="HARD_NEG_TWIN_STENT",
            generation_seed=42,
            validation_status="VALIDATED"
        )

    def synthesize_prolonged_icu(self, idx: int) -> BillRecord:
        """Severe sepsis with 14 days mechanical ventilation — legitimate high cost."""
        items = [
            BillItem(
                item_id="LI_001",
                raw_text="ICU Ventilator Bed with Hemodynamic Monitoring (14 days)",
                category="room_nursing",
                quantity=14.0,
                unit_price=7500.0,
                total_amount=105000.0,
                labels=AnomalyLabels()
            ),
            BillItem(
                item_id="LI_002",
                raw_text="Critical Care Intensivist Daily Rounds (14 days)",
                category="consultation",
                quantity=14.0,
                unit_price=900.0,
                total_amount=12600.0,
                labels=AnomalyLabels()
            ),
            BillItem(
                item_id="LI_003",
                raw_text="Inj. Meropenem 1g IV Infusion (28 vials at DPCO cap)",
                category="pharmacy",
                quantity=28.0,
                unit_price=950.0,
                total_amount=26600.0,
                labels=AnomalyLabels()
            ),
            BillItem(
                item_id="LI_004",
                raw_text="Daily Arterial Blood Gas (ABG Analysis x14)",
                category="diagnostic",
                quantity=14.0,
                unit_price=300.0,
                total_amount=4200.0,
                labels=AnomalyLabels()
            )
        ]
        total = round(sum(i.total_amount for i in items), 2)
        return BillRecord(
            bill_id=f"HARD_NEG_ICU_{idx:05d}",
            family_id=f"FAM_HN_{idx:05d}",
            hospital_name="Apollo Super Speciality Hospital",
            city="New Delhi",
            state="Delhi",
            tier=1,
            is_nabh=True,
            admission_date="2026-03-01",
            discharge_date="2026-03-16",
            days_admitted=15,
            diagnosis="Septic Shock with Acute Respiratory Failure",
            icd10_code="R65.21",
            total_billed=total,
            line_items=items,
            source_type="hard_negative",
            scenario_id="HARD_NEG_PROLONGED_ICU",
            generation_seed=42,
            validation_status="VALIDATED"
        )
