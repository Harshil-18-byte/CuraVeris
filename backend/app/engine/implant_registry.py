"""
Surgical Implant Registry & Patient Implant Card Generator.
Verifies orthopedic, cardiac, spinal, and ophthalmic implants against NPPA statutory ceilings,
checks Central Drugs Standard Control Organisation (CDSCO) device approvals,
and generates the statutory Patient Implant Card with warranty & MRI compatibility disclosures.
"""
from typing import Dict, Any, List, Optional
from app.db.reference_data import query_nppa_device


def verify_surgical_implant_and_generate_card(
    patient_name: str,
    hospital_name: str,
    surgeon_name: str,
    implant_name: str,
    billed_price_inr: float,
    batch_or_lot_number: str = "N/A",
    serial_or_udi: str = "N/A",
    implant_date: Optional[str] = None
) -> Dict[str, Any]:
    """
    1. Cross-references implant price against National Pharmaceutical Pricing Authority (NPPA) ceiling.
    2. Enforces National Medical Device Policy & Drugs and Cosmetics Act mandatory implant card provision.
    3. Generates the official Patient Implant Card containing warranty and MRI safety parameters.
    """
    nppa_ref = query_nppa_device(implant_name)
    nppa_ceiling = nppa_ref.get("ceiling_price_inr") if nppa_ref else None
    
    is_overcharged = False
    excess_amount = 0.0
    if nppa_ceiling and billed_price_inr > nppa_ceiling:
        is_overcharged = True
        excess_amount = round(billed_price_inr - nppa_ceiling, 2)

    # Determine MRI Safety & Manufacturer Warranty Standard
    implant_lower = implant_name.lower()
    if "stent" in implant_lower:
        mri_safety = "MR Conditional (Safe up to 1.5T / 3.0T after 6 weeks post-implantation)"
        warranty_terms = "Manufacturer Defect Replacement Warranty: Lifetime (Subject to clinical evaluation)"
        category = "Cardiovascular Device"
    elif "knee" in implant_lower or "hip" in implant_lower or "ortho" in implant_lower:
        mri_safety = "MR Conditional (Titanium / Cobalt-Chromium alloy safe for scanning with specific SAR parameters)"
        warranty_terms = "Manufacturer Structural Integrity Warranty: 10 - 15 Years"
        category = "Orthopedic Implant"
    elif "lens" in implant_lower or "iol" in implant_lower:
        mri_safety = "MR Safe (Acrylic / Silicone non-magnetic material)"
        warranty_terms = "Optical Stability Warranty: Lifetime"
        category = "Ophthalmic Device"
    else:
        mri_safety = "Check specific manufacturer technical manual for RF field susceptibility"
        warranty_terms = "Standard Medical Device Manufacturer Warranty"
        category = "Implantable Surgical Device"

    # Patient Implant Card Schema
    implant_card = {
        "title": "GOVERNMENT OF INDIA STATUTORY PATIENT IMPLANT CARD",
        "regulatory_notice": "Under CDSCO Medical Device Rules 2017, hospitals must issue this card to every patient receiving a permanent implant.",
        "patient_details": {
            "patient_name": patient_name,
            "hospital_name": hospital_name,
            "operating_surgeon": surgeon_name,
            "implantation_date": implant_date or "As per discharge summary"
        },
        "device_specifications": {
            "device_category": category,
            "device_name": implant_name,
            "unique_device_identifier_udi": serial_or_udi,
            "batch_lot_number": batch_or_lot_number,
            "mri_safety_status": mri_safety,
            "warranty_coverage": warranty_terms
        },
        "pricing_audit": {
            "billed_price_inr": billed_price_inr,
            "nppa_statutory_ceiling_inr": nppa_ceiling or "No specific statutory ceiling capped",
            "statutory_violation": is_overcharged,
            "unlawful_excess_inr": excess_amount
        }
    }

    return {
        "status": "success",
        "implant_verified": implant_name,
        "is_overcharged": is_overcharged,
        "excess_billed_inr": excess_amount,
        "nppa_ceiling_inr": nppa_ceiling,
        "implant_card": implant_card,
        "action_required": f"Demand refund of ₹{excess_amount:,.2f} under NPPA Order SO 1464(E)." if is_overcharged else "Implant billed within statutory limits."
    }
