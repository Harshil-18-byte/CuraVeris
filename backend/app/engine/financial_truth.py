"""Deterministic, evidence-ready healthcare financial truth calculations.

This module deliberately has no database, gateway, OCR, or ML dependency.  It
is the canonical calculation boundary for a verified patient obligation; ML
findings may be attached to a result but never change an amount calculated here.
"""
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Dict, Optional

from app.core.currency import TWO_PLACES, ZERO, FinancialInvariantError, to_decimal


def _non_negative(value: Any, field: str) -> Decimal:
    amount = to_decimal(value)
    if amount < ZERO:
        raise FinancialInvariantError(f"{field} must be non-negative")
    return amount


@dataclass(frozen=True)
class FinancialTruthInput:
    """Known monetary facts for a single financial obligation.

    ``tpa_adjustment`` is a documented contribution/credit that reduces the
    patient obligation.  It is intentionally distinct from legacy
    ``tpa_deductions`` used by the compatibility reconciliation engine.
    """

    obligation_id: str
    invoice_total: Any
    insurance_contribution: Any = ZERO
    tpa_adjustment: Any = ZERO
    deposits: Any = ZERO
    payments: Any = ZERO
    refunds: Any = ZERO
    hospital_requested: Optional[Any] = None
    currency: str = "INR"
    calculation_version: str = "financial-truth/v1"


@dataclass(frozen=True)
class FinancialTruthResult:
    obligation_id: str
    currency: str
    calculation_version: str
    invoice_total: Decimal
    insurance_contribution: Decimal
    tpa_adjustment: Decimal
    verified_patient_responsibility: Decimal
    deposits: Decimal
    payments: Decimal
    refunds: Decimal
    net_paid: Decimal
    outstanding_balance: Decimal
    overpayment: Decimal
    hospital_requested: Optional[Decimal]
    unexplained_variance: Optional[Decimal]
    status: str
    calculated_at: datetime

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class FinancialTruthEngine:
    """Calculates verified liability from known financial inputs only."""

    def calculate(self, value: FinancialTruthInput) -> FinancialTruthResult:
        if not value.obligation_id.strip():
            raise FinancialInvariantError("obligation_id is required")
        if not value.currency.strip():
            raise FinancialInvariantError("currency is required")

        invoice_total = _non_negative(value.invoice_total, "invoice_total")
        insurance = _non_negative(value.insurance_contribution, "insurance_contribution")
        adjustment = _non_negative(value.tpa_adjustment, "tpa_adjustment")
        deposits = _non_negative(value.deposits, "deposits")
        payments = _non_negative(value.payments, "payments")
        refunds = _non_negative(value.refunds, "refunds")
        requested = (
            _non_negative(value.hospital_requested, "hospital_requested")
            if value.hospital_requested is not None
            else None
        )

        verified = max(ZERO, invoice_total - insurance - adjustment).quantize(TWO_PLACES)
        net_paid = max(ZERO, deposits + payments - refunds).quantize(TWO_PLACES)
        outstanding = max(ZERO, verified - net_paid).quantize(TWO_PLACES)
        overpayment = max(ZERO, net_paid - verified).quantize(TWO_PLACES)
        variance = (
            max(ZERO, requested - verified).quantize(TWO_PLACES)
            if requested is not None
            else None
        )

        if overpayment > ZERO:
            status = "OVERPAID"
        elif outstanding > ZERO:
            status = "PAYABLE"
        elif variance and variance > ZERO:
            status = "REVIEW_REQUIRED"
        else:
            status = "VERIFIED"

        return FinancialTruthResult(
            obligation_id=value.obligation_id,
            currency=value.currency.upper(),
            calculation_version=value.calculation_version,
            invoice_total=invoice_total,
            insurance_contribution=insurance,
            tpa_adjustment=adjustment,
            verified_patient_responsibility=verified,
            deposits=deposits,
            payments=payments,
            refunds=refunds,
            net_paid=net_paid,
            outstanding_balance=outstanding,
            overpayment=overpayment,
            hospital_requested=requested,
            unexplained_variance=variance,
            status=status,
            calculated_at=datetime.now(timezone.utc),
        )


financial_truth_engine = FinancialTruthEngine()
