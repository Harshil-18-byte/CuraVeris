"""Insurance Reconciler Module for TPA and Cashless Settlement Audits."""

from dataclasses import dataclass
from typing import List, Dict, Any, Optional
from app.core.logging import logger


@dataclass
class ClaimReconciliationResult:
    billed_amount: float
    pre_auth_amount: float
    claimed_amount: float
    approved_amount: float
    co_pay_amount: float
    deduction_amount: float
    patient_out_of_pocket: float
    settlement_gap: float
    unjustified_deductions: List[Dict[str, Any]]
    dispute_points: List[str]
    ombudsman_admissible: bool


class InsuranceReconciler:
    """Audits insurance pre-authorizations vs final settlement statements."""

    def reconcile_claim(
        self,
        billed_amount: float,
        pre_auth_amount: float,
        claimed_amount: float,
        approved_amount: float,
        co_pay_amount: float,
        deduction_amount: float,
        items: Optional[List[Any]] = None,
    ) -> ClaimReconciliationResult:
        patient_out_of_pocket = round(billed_amount - approved_amount, 2)
        settlement_gap = round(claimed_amount - approved_amount - co_pay_amount, 2)

        unjustified_deductions = []
        dispute_points = []

        if approved_amount < pre_auth_amount:
            shortfall = pre_auth_amount - approved_amount
            dispute_points.append(
                f"TPA approved amount (₹{approved_amount:,.2f}) is lower than the initial Pre-Authorization "
                f"letter (₹{pre_auth_amount:,.2f}) by ₹{shortfall:,.2f} without documented medical rationale."
            )
            unjustified_deductions.append({
                "category": "Pre-Authorization Deviation",
                "amount": round(shortfall, 2),
                "reason": "Final cashless approval cannot be arbitrarily reduced below pre-auth without newly discovered exclusion.",
                "statutory_reference": "IRDAI Health Insurance Regulations (Cashless Settlement Norms)"
            })

        if items:
            consumable_total = sum(float(getattr(it, "total_amount", 0.0) or 0.0) for it in items if getattr(it, "category", "") == "consumable")
            if deduction_amount > 0 and consumable_total > 0 and deduction_amount >= consumable_total * 0.8:
                dispute_points.append("Routine surgical consumables were deducted wholesale in violation of IRDAI package guidelines.")
                unjustified_deductions.append({
                    "category": "Consumable Disallowance",
                    "amount": round(min(deduction_amount, consumable_total), 2),
                    "reason": "Wholesale disallowance of consumables violates IRDAI standard guidelines.",
                    "statutory_reference": "IRDAI Circular Ref: IRDAI/HLT/REG/CIR/193/07/2020"
                })

        ombudsman_admissible = len(unjustified_deductions) > 0 or settlement_gap > 5000.0

        return ClaimReconciliationResult(
            billed_amount=billed_amount,
            pre_auth_amount=pre_auth_amount,
            claimed_amount=claimed_amount,
            approved_amount=approved_amount,
            co_pay_amount=co_pay_amount,
            deduction_amount=deduction_amount,
            patient_out_of_pocket=max(0.0, patient_out_of_pocket),
            settlement_gap=max(0.0, settlement_gap),
            unjustified_deductions=unjustified_deductions,
            dispute_points=dispute_points,
            ombudsman_admissible=ombudsman_admissible,
        )
