"""
Multi-Party Healthcare Financial Reconciliation Engine for CuraVeris.

Authoritative 4-Way Reconciliation:
1. Hospital Invoice (Gross Billed - Statutory Audit Overcharges = Fair Bill Total)
2. Insurance / TPA (Claimed Amount ↔ Approved Amount ↔ TPA Deductions = Effective Insurer Responsibility)
3. Patient Liability (Fair Bill Total - Effective Insurer Responsibility = Legitimate Patient Co-Pay)
4. Payment System / Gateway (Razorpay Out-of-Pocket Payments ↔ Settlements ↔ Refunds = Net Patient Paid)

Calculates:
- Patient Unjust Gap (Overpayment due for refund)
- Outstanding Patient Balance (Shortfall due to hospital)
- Settlement Discrepancies (Gateway fees vs Net UTR Bank Settlement)
- Automated Exception Generation (Categorized by severity and cause)
"""
from decimal import Decimal
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.core.currency import to_decimal, verify_reconciliation_equation, ZERO, format_inr
from app.core.logging import logger


class ReconciliationEngine:
    """Deterministic Multi-Party Financial Reconciliation and Exception Processor."""

    def reconcile_transaction(
        self,
        invoice_id: str,
        gross_billed: Any,
        statutory_overcharge: Any,
        insurance_approved: Any = 0,
        tpa_deductions: Any = 0,
        patient_paid: Any = 0,
        settled_amount: Optional[Any] = None,
        tpa_name: str = "TPA / Insurer"
    ) -> Dict[str, Any]:
        """
        Executes four-way reconciliation and generates structured exceptions.
        """
        gross = to_decimal(gross_billed)
        overcharge = to_decimal(statutory_overcharge)
        ins_app = to_decimal(insurance_approved)
        tpa_ded = to_decimal(tpa_deductions)
        paid = to_decimal(patient_paid)
        settled = to_decimal(settled_amount) if settled_amount is not None else paid

        # Calculate authoritative equations
        eq = verify_reconciliation_equation(
            gross_billed=gross,
            statutory_overcharge=overcharge,
            insurance_approved=ins_app,
            tpa_deductions=tpa_ded,
            patient_paid=paid,
            settled_amount=settled
        )

        unjust_gap = eq["patient_unjust_gap"]
        outstanding = eq["outstanding_balance"]
        discrepancy = eq["settlement_discrepancy"]
        fair_total = eq["fair_bill_total"]
        insurer_share = eq["effective_insurer_share"]
        legit_patient_share = eq["legitimate_patient_share"]

        # Generate automated exception records
        exceptions: List[Dict[str, Any]] = []

        # 1. Statutory Overcharge Exception
        if overcharge > ZERO:
            exceptions.append({
                "exception_type": "OVERCHARGE",
                "severity": "HIGH" if overcharge > Decimal("10000.00") else "MEDIUM",
                "amount": overcharge,
                "cause": f"Audit identified {format_inr(overcharge)} in charges exceeding NPPA/DPCO/CGHS/IRDAI statutory thresholds.",
                "suggested_action": "Credit or deduct statutory overcharge from invoice prior to final discharge settlement."
            })

        # 2. TPA Arbitrary Deduction Mismatch
        if tpa_ded > ZERO:
            exceptions.append({
                "exception_type": "TPA_MISMATCH",
                "severity": "MEDIUM",
                "amount": tpa_ded,
                "cause": f"{tpa_name} deducted {format_inr(tpa_ded)} from the sanctioned insurance claim.",
                "suggested_action": "Submit itemized justification or dispute non-payable deduction with TPA desk."
            })

        # 3. Patient Overpayment / Unjust Gap
        if unjust_gap > ZERO:
            exceptions.append({
                "exception_type": "PAYMENT_GAP",
                "severity": "CRITICAL" if unjust_gap > Decimal("20000.00") else "HIGH",
                "amount": unjust_gap,
                "cause": f"Patient paid {format_inr(paid)} out-of-pocket, which exceeds legitimate liability ({format_inr(legit_patient_share)}) by {format_inr(unjust_gap)}.",
                "suggested_action": "Initiate automated Razorpay refund or hospital credit note to patient."
            })

        # 4. Uncollected / Outstanding Patient Balance
        if outstanding > ZERO:
            exceptions.append({
                "exception_type": "UNEXPLAINED_BALANCE",
                "severity": "MEDIUM",
                "amount": outstanding,
                "cause": f"Legitimate patient co-pay responsibility of {format_inr(legit_patient_share)} has remaining unpaid balance of {format_inr(outstanding)}.",
                "suggested_action": "Generate payment link or dispatch automated patient reminder."
            })

        # 5. Settlement Deficit / Discrepancy
        if discrepancy != ZERO:
            exceptions.append({
                "exception_type": "SETTLEMENT_DEFICIT",
                "severity": "LOW",
                "amount": abs(discrepancy),
                "cause": f"Gateway collection ({format_inr(paid)}) does not match bank settlement ({format_inr(settled)}) by {format_inr(abs(discrepancy))}.",
                "suggested_action": "Reconcile payment gateway MDR fee deductions and bank UTR statement."
            })

        # Determine overall reconciliation status
        if unjust_gap > ZERO:
            status = "REFUND_DUE"
        elif outstanding > ZERO or overcharge > ZERO or tpa_ded > ZERO:
            status = "EXCEPTION"
        elif discrepancy != ZERO:
            status = "PENDING_SETTLEMENT"
        else:
            status = "BALANCED"

        notes = (
            f"4-Way Reconciliation for Invoice {invoice_id} via {tpa_name}: "
            f"Gross Billed: {format_inr(gross)}; "
            f"Statutory Deductions: {format_inr(overcharge)}; "
            f"Fair Bill: {format_inr(fair_total)}; "
            f"Insurance/TPA Share: {format_inr(insurer_share)}; "
            f"Legitimate Co-Pay: {format_inr(legit_patient_share)}; "
            f"Patient Paid: {format_inr(paid)}. "
            f"Status: {status}."
        )

        return {
            "invoice_id": invoice_id,
            "gross_billed": gross,
            "statutory_overcharge": overcharge,
            "fair_bill_total": fair_total,
            "insurance_approved": ins_app,
            "tpa_deductions": tpa_ded,
            "effective_insurer_share": insurer_share,
            "legitimate_patient_share": legit_patient_share,
            "patient_paid": paid,
            "patient_unjust_gap": unjust_gap,
            "outstanding_patient_balance": outstanding,
            "settled_amount": settled,
            "settlement_discrepancy": discrepancy,
            "status": status,
            "reconciliation_notes": notes,
            "refund_link_recommended": unjust_gap > ZERO,
            "exceptions": exceptions,
            "created_at": datetime.now(timezone.utc)
        }


reconciliation_engine = ReconciliationEngine()
