from typing import Dict, Any


def reconcile_payments(
    total_billed: float,
    insurance_approved: float,
    razorpay_paid: float,
    total_overcharge: float,
    tpa_name: str = "TPA / Insurer"
) -> Dict[str, Any]:
    """
    Three-way financial reconciliation:
    1. Total Hospital Billed
    2. Insurance TPA Sanctioned / Approved
    3. Razorpay Out-of-Pocket Payment by Patient

    Calculates:
    - Legitimate Patient Co-Pay: max(0, (total_billed - total_overcharge) - insurance_approved)
    - Unjust Gap / Patient Overpayment: razorpay_paid - legitimate_co_pay
    """
    tpa_deductions = max(0.0, total_billed - insurance_approved)
    fair_bill_total = max(0.0, total_billed - total_overcharge)
    
    # What the patient should have paid legitimately after fair deductions
    legitimate_patient_share = max(0.0, fair_bill_total - insurance_approved)
    
    # What the patient paid out-of-pocket via Razorpay vs what was legitimately due
    unjust_gap = max(0.0, razorpay_paid - legitimate_patient_share)
    
    # Amount eligible for refund from hospital or reimbursement from TPA
    refundable_amount = min(unjust_gap, total_overcharge + (razorpay_paid - legitimate_patient_share))

    notes = (
        f"Reconciliation across {tpa_name}: Total billed was INR {total_billed:,.2f}. "
        f"Insurance approved INR {insurance_approved:,.2f} with INR {tpa_deductions:,.2f} in deductions. "
        f"Patient paid INR {razorpay_paid:,.2f} out-of-pocket. "
        f"Audit identified INR {total_overcharge:,.2f} in illegal overcharges. "
        f"Legitimate patient liability should have been only INR {legitimate_patient_share:,.2f}. "
        f"Patient overpaid by INR {unjust_gap:,.2f}, which is eligible for refund."
    )

    return {
        "total_billed": round(total_billed, 2),
        "insurance_approved": round(insurance_approved, 2),
        "tpa_deductions": round(tpa_deductions, 2),
        "razorpay_paid": round(razorpay_paid, 2),
        "legitimate_patient_share": round(legitimate_patient_share, 2),
        "patient_unjust_gap": round(unjust_gap, 2),
        "refundable_amount": round(refundable_amount, 2),
        "reconciliation_notes": notes,
        "refund_recommended": unjust_gap > 0
    }
