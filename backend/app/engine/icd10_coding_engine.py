"""
Automated ICD-10-CM & SNOMED-CT Clinical Coding & ALOS Benchmarking Engine for CuraVeris.
Translates unstructured clinical diagnostic free-text, discharge impressions,
and clinical procedures into official WHO and SNOMED healthcare ontologies.
"""
import re
from typing import Dict, Any, List, Optional
from app.db.disease_registry import DISEASE_REGISTRY, lookup_disease_context

CLINICAL_ONTOLOGY_MAP: Dict[str, Dict[str, Any]] = {
    "stemi": {
        "canonical_name": "ST-Elevation Myocardial Infarction (STEMI) of Anterior Wall",
        "icd10_code": "I21.09",
        "snomed_concept_id": "233829009",
        "specialty": "Cardiology / Interventional Cardiology",
        "standard_alos_days": 3,
        "max_admissible_icu_days": 2,
        "pmjay_package_code": "MC001A",
        "pmjay_package_name": "Primary Percutaneous Coronary Intervention (PCI)",
        "expected_implants": ["Drug-Eluting Stent (DES)"],
        "critical_biomarkers": ["Troponin I / T", "CK-MB", "ECG ST Elevation"]
    },
    "nstemi": {
        "canonical_name": "Non-ST-Elevation Myocardial Infarction (NSTEMI)",
        "icd10_code": "I21.4",
        "snomed_concept_id": "401303003",
        "specialty": "Cardiology",
        "standard_alos_days": 4,
        "max_admissible_icu_days": 2,
        "pmjay_package_code": "MC002A",
        "pmjay_package_name": "Medical Management of Acute Coronary Syndrome",
        "expected_implants": [],
        "critical_biomarkers": ["Troponin", "Echo"]
    },
    "knee_osteoarthritis": {
        "canonical_name": "Primary Osteoarthritis of Knee, Unilateral or Bilateral",
        "icd10_code": "M17.11",
        "snomed_concept_id": "239872002",
        "specialty": "Orthopedics / Joint Replacement",
        "standard_alos_days": 4,
        "max_admissible_icu_days": 0,
        "pmjay_package_code": "SO001A",
        "pmjay_package_name": "Total Knee Arthroplasty / Replacement (TKR)",
        "expected_implants": ["Primary Knee Implant System (Femoral & Tibial Components)"],
        "critical_biomarkers": ["Weight-bearing Knee Radiograph", "CRP"]
    },
    "hip_avascular_necrosis": {
        "canonical_name": "Avascular Necrosis of Femoral Head / Secondary Hip Osteoarthritis",
        "icd10_code": "M87.051",
        "snomed_concept_id": "52857007",
        "specialty": "Orthopedics",
        "standard_alos_days": 5,
        "max_admissible_icu_days": 0,
        "pmjay_package_code": "SO002B",
        "pmjay_package_name": "Total Hip Replacement (THR) Uncemented / Hybrid",
        "expected_implants": ["Acetabular Cup", "Femoral Stem & Ceramic/Metal Head"],
        "critical_biomarkers": ["Pelvis X-Ray", "MRI Hip"]
    },
    "cholelithiasis": {
        "canonical_name": "Calculus of Gallbladder with Acute Cholecystitis",
        "icd10_code": "K80.00",
        "snomed_concept_id": "235919008",
        "specialty": "General & Laparoscopic Surgery",
        "standard_alos_days": 2,
        "max_admissible_icu_days": 0,
        "pmjay_package_code": "SG003A",
        "pmjay_package_name": "Laparoscopic Cholecystectomy",
        "expected_implants": [],
        "critical_biomarkers": ["Abdominal Ultrasound", "LFT"]
    },
    "type_2_diabetes": {
        "canonical_name": "Type 2 Diabetes Mellitus with Peripheral Neuropathy & Hyperglycemia",
        "icd10_code": "E11.40",
        "snomed_concept_id": "44054006",
        "specialty": "Endocrinology & Diabetology",
        "standard_alos_days": 2,
        "max_admissible_icu_days": 0,
        "pmjay_package_code": "MD004A",
        "pmjay_package_name": "Diabetic Ketoacidosis & Hyperglycemic Management",
        "expected_implants": [],
        "critical_biomarkers": ["HbA1c", "Fasting Blood Sugar", "Urine Ketones"]
    },
    "dengue": {
        "canonical_name": "Dengue Fever with Thrombocytopenia and Warning Signs",
        "icd10_code": "A97.1",
        "snomed_concept_id": "38362002",
        "specialty": "Infectious Diseases / General Medicine",
        "standard_alos_days": 3,
        "max_admissible_icu_days": 1,
        "pmjay_package_code": "MG005A",
        "pmjay_package_name": "Dengue Inpatient Hydration & Platelet Support",
        "expected_implants": [],
        "critical_biomarkers": ["Platelet Count", "Dengue NS1 Antigen", "Hematocrit"]
    },
    "cesarean_section": {
        "canonical_name": "Maternal Care for Low Transverse Cesarean Delivery (LSCS)",
        "icd10_code": "O82.0",
        "snomed_concept_id": "11466000",
        "specialty": "Obstetrics & Gynecology",
        "standard_alos_days": 3,
        "max_admissible_icu_days": 0,
        "pmjay_package_code": "OB001A",
        "pmjay_package_name": "Cesarean Delivery with or without Tubectomy",
        "expected_implants": [],
        "critical_biomarkers": ["Fetal Heart Monitoring", "Hemoglobin", "Blood Grouping"]
    },
    "kidney_stones": {
        "canonical_name": "Calculus of Kidney and Ureter with Hydronephrosis",
        "icd10_code": "N20.2",
        "snomed_concept_id": "5636009",
        "specialty": "Urology",
        "standard_alos_days": 2,
        "max_admissible_icu_days": 0,
        "pmjay_package_code": "SU004A",
        "pmjay_package_name": "Percutaneous Nephrolithotomy (PCNL) / URS Stenting",
        "expected_implants": ["Double J (DJ) Ureteral Stent"],
        "critical_biomarkers": ["NCCT KUB", "Renal Function Test"]
    },
    "cataract": {
        "canonical_name": "Age-Related Nuclear Cataract with Phacoemulsification",
        "icd10_code": "H25.10",
        "snomed_concept_id": "193570009",
        "specialty": "Ophthalmology",
        "standard_alos_days": 1,
        "max_admissible_icu_days": 0,
        "pmjay_package_code": "OP001A",
        "pmjay_package_name": "Phacoemulsification with Foldable Hydrophobic IOL",
        "expected_implants": ["Intraocular Lens (IOL)"],
        "critical_biomarkers": ["Slit Lamp Examination", "A-Scan Biometry"]
    }
}


def resolve_clinical_icd10(
    diagnostic_text: str,
    days_in_hospital: Optional[int] = None
) -> Dict[str, Any]:
    """
    Resolves diagnostic impressions and free-text physician notes into standardized
    ICD-10-CM codes, SNOMED-CT identifiers, and length-of-stay compliance audits.
    """
    if not diagnostic_text:
        return {
            "matched": False,
            "raw_query": "",
            "icd10_code": "Z03.89",
            "canonical_name": "General Inpatient Medical Observation",
            "snomed_concept_id": "27885002",
            "specialty": "General Medicine",
            "standard_alos_days": 3,
            "alos_compliance": "NORMAL"
        }

    q = diagnostic_text.lower().strip()
    match_key = None

    # Keyword mappings
    term_to_key = {
        "stemi": "stemi",
        "heart attack": "stemi",
        "infarction": "stemi",
        "nstemi": "nstemi",
        "cad": "stemi",
        "angina": "stemi",
        "coronary": "stemi",
        "knee": "knee_osteoarthritis",
        "tkr": "knee_osteoarthritis",
        "osteoarthritis": "knee_osteoarthritis",
        "hip": "hip_avascular_necrosis",
        "thr": "hip_avascular_necrosis",
        "chole": "cholelithiasis",
        "gall": "cholelithiasis",
        "diabetes": "type_2_diabetes",
        "sugar": "type_2_diabetes",
        "hba1c": "type_2_diabetes",
        "dengue": "dengue",
        "platelet": "dengue",
        "c-section": "cesarean_section",
        "cesarean": "cesarean_section",
        "lscs": "cesarean_section",
        "delivery": "cesarean_section",
        "stone": "kidney_stones",
        "renal": "kidney_stones",
        "pcnl": "kidney_stones",
        "cataract": "cataract",
        "phaco": "cataract",
        "lens": "cataract",
        "eye": "cataract"
    }

    for term, key in term_to_key.items():
        if term in q:
            match_key = key
            break

    if match_key and match_key in CLINICAL_ONTOLOGY_MAP:
        data = dict(CLINICAL_ONTOLOGY_MAP[match_key])
        data["matched"] = True
        data["raw_query"] = diagnostic_text
    else:
        # Fallback to broader disease registry
        broader = lookup_disease_context(diagnostic_text) or {}
        data = {
            "matched": True,
            "raw_query": diagnostic_text,
            "canonical_name": broader.get("canonical_name", f"Inpatient Care ({diagnostic_text.title()})"),
            "icd10_code": broader.get("icd_10", "Z03.8"),
            "snomed_concept_id": "27885002",
            "specialty": broader.get("specialty", "General Medicine"),
            "standard_alos_days": broader.get("typical_alos_days", 3),
            "max_admissible_icu_days": 1,
            "pmjay_package_code": broader.get("cghs_package_code", "CGHS_GEN"),
            "pmjay_package_name": "Standard Inpatient Clinical Care",
            "expected_implants": broader.get("nppa_capped_implants", []),
            "critical_biomarkers": broader.get("critical_tests", ["CBC", "RFT"])
        }

    # ALOS (Average Length of Stay) Audit
    if days_in_hospital is not None:
        standard_alos = data.get("standard_alos_days", 3)
        if days_in_hospital > (standard_alos * 2):
            data["alos_compliance"] = "EXCESSIVE_STAY_FLAG"
            data["alos_finding"] = (
                f"Patient admitted for {days_in_hospital} days vs typical ALOS benchmark of {standard_alos} days. "
                f"Potential unwarranted bed-blocking / artificial bill inflation detected."
            )
        elif days_in_hospital > standard_alos:
            data["alos_compliance"] = "ELEVATED_STAY"
            data["alos_finding"] = f"Stay exceeds typical benchmark by {days_in_hospital - standard_alos} days."
        else:
            data["alos_compliance"] = "OPTIMAL_STAY"
            data["alos_finding"] = f"Stay of {days_in_hospital} days is fully within typical clinical guidelines."

    return data
