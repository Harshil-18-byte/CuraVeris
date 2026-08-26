"""CuraVeris — Hard Negative Generator (Layer 4).

Generates complex, high-magnitude, unusual hospital bills that naive models routinely
misclassify as fraud, but which are 100% compliant with Indian statutory standards:
  - Legitimate prolonged ICU ventilation for severe ARDS / Sepsis
  - Legitimate multi-vessel twin stents for bifurcation lesions
  - Legitimate revision arthroplasty with NPPA-compliant revision kits
  - Legitimate high-cost oncology biologic immunotherapy
"""

import copy
import random
from typing import Dict, Any, List


class HardNegativeGenerator:
    """Generates complex, compliant hard negative bills."""

    def __init__(self, random_seed: int = 42):
        random.seed(random_seed)

    def generate_hard_negative(self, scenario_type: str, bill_idx: int) -> Dict[str, Any]:
        if scenario_type == "twin_stents":
            return self._generate_twin_stent_bill(bill_idx)
        elif scenario_type == "prolonged_icu":
            return self._generate_prolonged_icu_bill(bill_idx)
        elif scenario_type == "revision_tkr":
            return self._generate_revision_tkr_bill(bill_idx)
        else:
            return self._generate_oncology_biologic_bill(bill_idx)

    def _generate_twin_stent_bill(self, bill_idx: int) -> Dict[str, Any]:
        """Patient receives 2 DES stents for multi-vessel CAD — both billed at NPPA ceiling."""
        return {
            "bill_id": f"HARD_NEG_TWIN_STENT_{bill_idx:04d}",
            "hospital_name": "Medanta The Medicity",
            "city": "Gurugram",
            "state": "Haryana",
            "tier": 1,
            "is_nabh": True,
            "admission_date": "2026-05-10",
            "discharge_date": "2026-05-14",
            "days_admitted": 4,
            "diagnosis": "Double Vessel Coronary Artery Disease with Severe Angina",
            "icd10_code": "I25.10",
            "is_hard_negative": True,
            "total_billed": 182500.00,
            "line_items": [
                {
                    "item_id": "LI_001",
                    "raw_text": "Percutaneous Transluminal Coronary Angioplasty (PTCA) Multi-Vessel",
                    "category": "procedure",
                    "quantity": 1.0,
                    "unit_price": 68000.00,
                    "total_amount": 68000.00,
                    "labels": self._zero_labels()
                },
                {
                    "item_id": "LI_002",
                    "raw_text": "Coronary Stent - Drug Eluting (DES) LAD Artery (Everolimus)",
                    "category": "implant",
                    "quantity": 1.0,
                    "unit_price": 38260.00,
                    "total_amount": 38260.00,
                    "labels": self._zero_labels()
                },
                {
                    "item_id": "LI_003",
                    "raw_text": "Coronary Stent - Drug Eluting (DES) RCA Artery (Zotarolimus)",
                    "category": "implant",
                    "quantity": 1.0,
                    "unit_price": 38260.00,
                    "total_amount": 38260.00,
                    "labels": self._zero_labels()
                },
                {
                    "item_id": "LI_004",
                    "raw_text": "ICU Bed Charges (2 days with invasive monitoring)",
                    "category": "room_nursing",
                    "quantity": 2.0,
                    "unit_price": 5400.00,
                    "total_amount": 10800.00,
                    "labels": self._zero_labels()
                },
                {
                    "item_id": "LI_005",
                    "raw_text": "Coronary Angiography Film & CD",
                    "category": "diagnostic",
                    "quantity": 1.0,
                    "unit_price": 7500.00,
                    "total_amount": 7500.00,
                    "labels": self._zero_labels()
                },
                {
                    "item_id": "LI_006",
                    "raw_text": "Special Ward Room Rent (2 days)",
                    "category": "room_nursing",
                    "quantity": 2.0,
                    "unit_price": 3000.00,
                    "total_amount": 6000.00,
                    "labels": self._zero_labels()
                },
                {
                    "item_id": "LI_007",
                    "raw_text": "Specialist Cardiologist Daily Rounds (4 visits)",
                    "category": "consultation",
                    "quantity": 4.0,
                    "unit_price": 600.00,
                    "total_amount": 2400.00,
                    "labels": self._zero_labels()
                },
                {
                    "item_id": "LI_008",
                    "raw_text": "Inj. Enoxaparin 60mg PFS (4 doses)",
                    "category": "pharmacy",
                    "quantity": 4.0,
                    "unit_price": 580.00,
                    "total_amount": 2320.00,
                    "labels": self._zero_labels()
                },
                {
                    "item_id": "LI_009",
                    "raw_text": "Post-PCI Pathology Profile & Coagulation",
                    "category": "diagnostic",
                    "quantity": 1.0,
                    "unit_price": 1200.00,
                    "total_amount": 1200.00,
                    "labels": self._zero_labels()
                }
            ]
        }

    def _generate_prolonged_icu_bill(self, bill_idx: int) -> Dict[str, Any]:
        """Severe septic shock requiring 14 days ICU on ventilator — high total amount but 100% compliant."""
        return {
            "bill_id": f"HARD_NEG_ICU_VENT_{bill_idx:04d}",
            "hospital_name": "Apollo Super Speciality Hospital",
            "city": "New Delhi",
            "state": "Delhi",
            "tier": 1,
            "is_nabh": True,
            "admission_date": "2026-03-01",
            "discharge_date": "2026-03-18",
            "days_admitted": 17,
            "diagnosis": "Severe Sepsis with Septic Shock and Acute Respiratory Distress Syndrome (ARDS)",
            "icd10_code": "R65.21",
            "is_hard_negative": True,
            "total_billed": 245000.00,
            "line_items": [
                {
                    "item_id": "LI_001",
                    "raw_text": "ICU Ventilator Bed with Hemodynamic Monitoring (14 days)",
                    "category": "room_nursing",
                    "quantity": 14.0,
                    "unit_price": 7500.00,
                    "total_amount": 105000.00,
                    "labels": self._zero_labels()
                },
                {
                    "item_id": "LI_002",
                    "raw_text": "Step-Down HDU Bed Charges (3 days)",
                    "category": "room_nursing",
                    "quantity": 3.0,
                    "unit_price": 4000.00,
                    "total_amount": 12000.00,
                    "labels": self._zero_labels()
                },
                {
                    "item_id": "LI_003",
                    "raw_text": "Critical Care Specialist / Intensivist Rounds (17 days)",
                    "category": "consultation",
                    "quantity": 17.0,
                    "unit_price": 900.00,
                    "total_amount": 15300.00,
                    "labels": self._zero_labels()
                },
                {
                    "item_id": "LI_004",
                    "raw_text": "Inj. Meropenem 1g IV (28 vials)",
                    "category": "pharmacy",
                    "quantity": 28.0,
                    "unit_price": 950.00,
                    "total_amount": 26600.00,
                    "labels": self._zero_labels()
                },
                {
                    "item_id": "LI_005",
                    "raw_text": "Inj. Piperacillin + Tazobactam 4.5g IV (20 vials)",
                    "category": "pharmacy",
                    "quantity": 20.0,
                    "unit_price": 440.00,
                    "total_amount": 8800.00,
                    "labels": self._zero_labels()
                },
                {
                    "item_id": "LI_006",
                    "raw_text": "Daily Arterial Blood Gas (ABG Analysis x17)",
                    "category": "diagnostic",
                    "quantity": 17.0,
                    "unit_price": 300.00,
                    "total_amount": 5100.00,
                    "labels": self._zero_labels()
                },
                {
                    "item_id": "LI_007",
                    "raw_text": "Blood & Tracheal Culture Sensitivity Panels (4 panels)",
                    "category": "diagnostic",
                    "quantity": 4.0,
                    "unit_price": 1200.00,
                    "total_amount": 4800.00,
                    "labels": self._zero_labels()
                },
                {
                    "item_id": "LI_008",
                    "raw_text": "Hemodialysis Session for Acute Kidney Injury (3 sessions)",
                    "category": "procedure",
                    "quantity": 3.0,
                    "unit_price": 1500.00,
                    "total_amount": 4500.00,
                    "labels": self._zero_labels()
                }
            ]
        }

    def _generate_revision_tkr_bill(self, bill_idx: int) -> Dict[str, Any]:
        """Revision TKR using specialized revision implant kit under NPPA S.O. 2668(E) ceiling."""
        return {
            "bill_id": f"HARD_NEG_REV_TKR_{bill_idx:04d}",
            "hospital_name": "Shalby Multispecialty Hospital",
            "city": "Ahmedabad",
            "state": "Gujarat",
            "tier": 2,
            "is_nabh": True,
            "admission_date": "2026-02-15",
            "discharge_date": "2026-02-22",
            "days_admitted": 7,
            "diagnosis": "Failed Total Knee Arthroplasty with Aseptic Loosening for Revision TKR",
            "icd10_code": "T84.04",
            "is_hard_negative": True,
            "total_billed": 265000.00,
            "line_items": [
                {
                    "item_id": "LI_001",
                    "raw_text": "Revision Total Knee Arthroplasty Surgery",
                    "category": "procedure",
                    "quantity": 1.0,
                    "unit_price": 95000.00,
                    "total_amount": 95000.00,
                    "labels": self._zero_labels()
                },
                {
                    "item_id": "LI_002",
                    "raw_text": "Knee Implant System - Revision TKR with Stem Augments",
                    "category": "implant",
                    "quantity": 1.0,
                    "unit_price": 128480.00,
                    "total_amount": 128480.00,
                    "labels": self._zero_labels()
                },
                {
                    "item_id": "LI_003",
                    "raw_text": "Antibiotic Loaded High Viscosity Bone Cement (40g pack)",
                    "category": "implant",
                    "quantity": 2.0,
                    "unit_price": 3800.00,
                    "total_amount": 7600.00,
                    "labels": self._zero_labels()
                },
                {
                    "item_id": "LI_004",
                    "raw_text": "Private Ward Bed Charges (7 days)",
                    "category": "room_nursing",
                    "quantity": 7.0,
                    "unit_price": 3500.00,
                    "total_amount": 24500.00,
                    "labels": self._zero_labels()
                },
                {
                    "item_id": "LI_005",
                    "raw_text": "Inj. Cefuroxime 1.5g IV (8 doses)",
                    "category": "pharmacy",
                    "quantity": 8.0,
                    "unit_price": 110.00,
                    "total_amount": 880.00,
                    "labels": self._zero_labels()
                }
            ]
        }

    def _generate_oncology_biologic_bill(self, bill_idx: int) -> Dict[str, Any]:
        """Oncology biologic immunotherapy charged at authentic statutory MRP."""
        return {
            "bill_id": f"HARD_NEG_ONCO_BIO_{bill_idx:04d}",
            "hospital_name": "Kokilaben Dhirubhai Ambani Hospital",
            "city": "Mumbai",
            "state": "Maharashtra",
            "tier": 1,
            "is_nabh": True,
            "admission_date": "2026-04-05",
            "discharge_date": "2026-04-06",
            "days_admitted": 1,
            "diagnosis": "Metastatic Non-Small Cell Lung Cancer for Immunotherapy",
            "icd10_code": "C34.90",
            "is_hard_negative": True,
            "total_billed": 195000.00,
            "line_items": [
                {
                    "item_id": "LI_001",
                    "raw_text": "Daycare Chemotherapy / Immunotherapy Infusion Bed",
                    "category": "room_nursing",
                    "quantity": 1.0,
                    "unit_price": 4500.00,
                    "total_amount": 4500.00,
                    "labels": self._zero_labels()
                },
                {
                    "item_id": "LI_002",
                    "raw_text": "Inj. Pembrolizumab 100mg/4ml IV Solution (1 vial at MRP)",
                    "category": "pharmacy",
                    "quantity": 1.0,
                    "unit_price": 185000.00,
                    "total_amount": 185000.00,
                    "labels": self._zero_labels()
                },
                {
                    "item_id": "LI_003",
                    "raw_text": "Medical Oncologist Chemotherapy Planning & Supervision",
                    "category": "consultation",
                    "quantity": 1.0,
                    "unit_price": 1500.00,
                    "total_amount": 1500.00,
                    "labels": self._zero_labels()
                },
                {
                    "item_id": "LI_004",
                    "raw_text": "Pre-Chemotherapy Complete Blood Count & Renal Panel",
                    "category": "diagnostic",
                    "quantity": 1.0,
                    "unit_price": 850.00,
                    "total_amount": 850.00,
                    "labels": self._zero_labels()
                }
            ]
        }

    @staticmethod
    def _zero_labels() -> Dict[str, int]:
        return {
            "nppa_ceiling_violation": 0,
            "above_mrp": 0,
            "consumable_unbundled": 0,
            "duplicate_charge": 0,
            "gst_on_exempt": 0,
            "rate_anomaly": 0,
            "package_unbundled": 0
        }
