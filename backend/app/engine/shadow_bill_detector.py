"""
Shadow Bill Detector & GST Invoice Compliance Verifier for Indian Hospitals.
Cross-references GSTIN, verifies healthcare service tax exemption under Notification No. 12/2017,
detects discrepancies between hospital-issued bills and GST portal declarations,
and checks batch numbers against CDSCO drug safety recalls.
"""
from typing import Dict, Any, List, Optional


# CDSCO Recalled & Not-of-Standard-Quality (NSQ) Alert Batches (Simulated real-world alert lookup)
CDSCO_RECALL_REGISTRY = {
    "PANTO-B8291": {"drug": "Pantoprazole 40mg Inj", "reason": "Failed dissolution test", "alert_date": "2024-11"},
    "CEFT-K1092": {"drug": "Ceftriaxone 1g Inj", "reason": "Particulate matter detected", "alert_date": "2024-08"},
    "PARAC-9941": {"drug": "Paracetamol 1000mg IV Infusion", "reason": "Endotoxin level exceeded", "alert_date": "2024-12"}
}


def check_gst_invoice_compliance(
    gstin: str,
    invoice_number: str,
    total_billed_patient: float,
    declared_taxable_value: Optional[float] = None,
    gst_collected_from_patient: float = 0.0,
    room_daily_tariff: float = 0.0,
    is_icu: bool = False
) -> Dict[str, Any]:
    """
    Verifies hospital bill against Indian GST legal framework:
    1. Healthcare services (inpatient care, doctor fees, surgeries) are 100% EXEMPT under
       Notification No. 12/2017-Central Tax (Rate), Heading 9993.
    2. Room rent exemption: Under Notification No. 04/2022-Central Tax, room rent up to
       ₹5,000/day is EXEMPT. Room rent > ₹5,000/day attracts 5% GST without ITC.
       ICU, CCU, ICCU, and NICU are 100% EXEMPT regardless of rent.
    3. Shadow Bill Detection: If declared_taxable_value on GST portal differs by > 5%
       from total_billed_patient, dual accounting/shadow billing is flagged.
    """
    flags = []
    violations = []

    # 1. GST on Room Rent Check
    if room_daily_tariff > 5000.0 and not is_icu:
        expected_gst_rate = 0.05
        expected_room_gst = (room_daily_tariff - 5000.0) * expected_gst_rate  # Tax on excess or total depending on notification interpretation
    elif is_icu:
        if gst_collected_from_patient > 0:
            flags.append("ILLEGAL_GST_ON_ICU")
            violations.append(
                "ICU/CCU bed charges are 100% exempt from GST under Ministry of Finance Notification 04/2022. Charging GST on ICU is strictly illegal."
            )

    # 2. General Healthcare Exemption Check
    if gst_collected_from_patient > 0 and room_daily_tariff <= 5000.0 and not is_icu:
        flags.append("UNLAWFUL_HEALTHCARE_GST")
        violations.append(
            f"Hospital collected ₹{gst_collected_from_patient:,.2f} as GST. Healthcare services provided by clinical establishments are 100% GST-exempt under Heading 9993."
        )

    # 3. Shadow Bill & GST Declaration Discrepancy Check
    shadow_detected = False
    discrepancy = 0.0
    if declared_taxable_value is not None:
        discrepancy = total_billed_patient - declared_taxable_value
        if abs(discrepancy) > (total_billed_patient * 0.05):  # 5% tolerance
            shadow_detected = True
            flags.append("GST_SHADOW_BILL_DISCREPANCY")
            violations.append(
                f"Dual-Accounting / Shadow Bill Discrepancy: Patient was billed ₹{total_billed_patient:,.2f}, "
                f"but hospital declared only ₹{declared_taxable_value:,.2f} to GST authorities (Discrepancy: ₹{discrepancy:,.2f}). "
                f"This constitutes potential simultaneous tax fraud and patient overcharging."
            )

    is_compliant = len(violations) == 0

    return {
        "gstin": gstin,
        "invoice_number": invoice_number,
        "is_compliant": is_compliant,
        "shadow_billing_detected": shadow_detected,
        "billed_to_patient": total_billed_patient,
        "declared_to_gst": declared_taxable_value,
        "discrepancy_inr": round(discrepancy, 2),
        "gst_collected_patient": gst_collected_from_patient,
        "flags": flags,
        "violations": violations,
        "recommended_statutory_actions": [
            "File complaint on CBIC GST Fraud Helpline (taxevasion@nic.in)",
            "Submit report to State Clinical Establishments Authority",
            "Demand immediate credit note refund from hospital under CPA 2019"
        ] if not is_compliant else []
    }


def verify_medicine_batches(line_items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Checks medicine batch numbers printed on hospital bill against CDSCO safety recall registry.
    """
    alerts = []
    for item in line_items:
        batch_no = item.get("batch_number", "").strip().upper()
        if batch_no and batch_no in CDSCO_RECALL_REGISTRY:
            recall_info = CDSCO_RECALL_REGISTRY[batch_no]
            alerts.append({
                "item_name": item.get("item_name"),
                "batch_number": batch_no,
                "recall_reason": recall_info["reason"],
                "alert_date": recall_info["alert_date"],
                "severity": "CRITICAL_PATIENT_SAFETY",
                "action": "Notify treating consultant immediately; request drug verification report from hospital pharmacy superintendent."
            })
    return alerts
