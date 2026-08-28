from decimal import Decimal

import pytest

from app.core.currency import FinancialInvariantError
from app.engine.financial_truth import FinancialTruthEngine, FinancialTruthInput


def test_demo_liability_is_deterministic_and_explains_variance():
    result = FinancialTruthEngine().calculate(FinancialTruthInput(
        obligation_id="demo-13500",
        invoice_total="218400",
        insurance_contribution="140000",
        tpa_adjustment="5000",
        hospital_requested="86900",
    ))

    assert result.verified_patient_responsibility == Decimal("73400.00")
    assert result.unexplained_variance == Decimal("13500.00")
    assert result.outstanding_balance == Decimal("73400.00")
    assert result.status == "PAYABLE"
    assert result.currency == "INR"


def test_paid_and_refunded_amounts_reconcile_without_negative_liability():
    result = FinancialTruthEngine().calculate(FinancialTruthInput(
        obligation_id="refund-case",
        invoice_total="73400",
        payments="83400",
        refunds="10000",
    ))

    assert result.net_paid == Decimal("73400.00")
    assert result.outstanding_balance == Decimal("0.00")
    assert result.overpayment == Decimal("0.00")
    assert result.status == "VERIFIED"


def test_negative_known_amounts_are_rejected():
    with pytest.raises(FinancialInvariantError):
        FinancialTruthEngine().calculate(FinancialTruthInput(
            obligation_id="invalid",
            invoice_total="100",
            payments="-1",
        ))
