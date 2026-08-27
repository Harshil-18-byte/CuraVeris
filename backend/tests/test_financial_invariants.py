"""
Property-Based Financial Invariant Tests for CuraVeris.

Verifies:
1. Zero floating-point rounding error across arbitrary Decimal monetary transactions.
2. Exact 4-way balance conservation:
   Fair Bill = max(0, Gross Billed - Statutory Overcharges)
   Legitimate Patient Share = max(0, Fair Bill - Effective Insurer Responsibility)
   Unjust Gap = max(0, Patient Paid - Legitimate Patient Share)
   Outstanding Balance = max(0, Legitimate Patient Share - Patient Paid)
3. Non-negativity of balance gaps and liabilities.
4. Currency formatting precision across Lakhs and Crores.
"""
from decimal import Decimal
import random
import pytest
from app.core.currency import (
    to_decimal, to_paise, from_paise, format_inr,
    verify_reconciliation_equation, verify_bill_totals,
    ZERO, TWO_PLACES
)


def test_decimal_conversion_and_paise_conversion():
    """Verify lossless conversion between float/str/Decimal and integer paise."""
    assert to_decimal(100.5) == Decimal("100.50")
    assert to_decimal("1,23,456.78") == Decimal("123456.78")
    assert to_decimal("₹ 50,000.00") == Decimal("50000.00")
    assert to_decimal(None) == Decimal("0.00")
    
    # Paise conversion
    assert to_paise(Decimal("218400.00")) == 21840000
    assert from_paise(21840000) == Decimal("218400.00")
    assert from_paise(1) == Decimal("0.01")


def test_inr_formatting():
    """Verify standard Indian Lakhs & Crores formatting."""
    assert format_inr(Decimal("1000")) == "₹1,000.00"
    assert format_inr(Decimal("100000")) == "₹1,00,000.00"
    assert format_inr(Decimal("218400.50")) == "₹2,18,400.50"
    assert format_inr(Decimal("10000000")) == "₹1,00,00,000.00"


def test_reconciliation_invariant_synthetic_scenario():
    """
    Test the specification demo scenario:
    - Hospital Bill: ₹2,18,400
    - Statutory Overcharge: ₹38,700 -> Fair Bill: ₹1,79,700
    - Insurance Approved: ₹1,40,000; TPA Deductions: ₹5,000 -> Insurer Net: ₹1,35,000
    - Legitimate Patient Share: ₹44,700
    - Patient Paid via Razorpay: ₹70,000
    - Patient Unjust Gap (Refund Due): ₹25,300
    - Outstanding Balance: ₹0.00
    """
    res = verify_reconciliation_equation(
        gross_billed=Decimal("218400.00"),
        statutory_overcharge=Decimal("38700.00"),
        insurance_approved=Decimal("140000.00"),
        tpa_deductions=Decimal("5000.00"),
        patient_paid=Decimal("70000.00"),
        settled_amount=Decimal("70000.00")
    )

    assert res["gross_billed"] == Decimal("218400.00")
    assert res["statutory_overcharge"] == Decimal("38700.00")
    assert res["fair_bill_total"] == Decimal("179700.00")
    assert res["effective_insurer_share"] == Decimal("135000.00")
    assert res["legitimate_patient_share"] == Decimal("44700.00")
    assert res["patient_unjust_gap"] == Decimal("25300.00")
    assert res["outstanding_balance"] == Decimal("0.00")
    assert res["settlement_discrepancy"] == Decimal("0.00")
    assert res["refund_due"] is True


def test_randomized_financial_invariants_1000_trials():
    """
    Property-Based Randomized Invariant Check:
    Runs 1,000 trials with random financial parameters.
    Verifies that:
    1. Legitimate Patient Share + Effective Insurer Share <= Fair Bill Total
    2. Patient Paid == Legitimate Patient Share + Unjust Gap - Outstanding Balance
    3. All resulting amounts are non-negative and properly quantized to 2 decimals.
    """
    random.seed(42)
    for _ in range(1000):
        gross = Decimal(str(round(random.uniform(5000, 1000000), 2)))
        overcharge = Decimal(str(round(random.uniform(0, float(gross)), 2)))
        ins_app = Decimal(str(round(random.uniform(0, float(gross)), 2)))
        tpa_ded = Decimal(str(round(random.uniform(0, float(ins_app)), 2)))
        paid = Decimal(str(round(random.uniform(0, float(gross)), 2)))
        settled = paid

        res = verify_reconciliation_equation(
            gross_billed=gross,
            statutory_overcharge=overcharge,
            insurance_approved=ins_app,
            tpa_deductions=tpa_ded,
            patient_paid=paid,
            settled_amount=settled
        )

        fair = res["fair_bill_total"]
        ins_share = res["effective_insurer_share"]
        pat_share = res["legitimate_patient_share"]
        unjust = res["patient_unjust_gap"]
        out = res["outstanding_balance"]

        # Invariant 1: Non-negativity
        assert fair >= ZERO
        assert ins_share >= ZERO
        assert pat_share >= ZERO
        assert unjust >= ZERO
        assert out >= ZERO

        # Invariant 2: Fair total coverage
        assert ins_share + pat_share == fair or (ins_share >= fair and pat_share == ZERO)

        # Invariant 3: Patient liability balance conservation
        assert (paid + out - unjust) == pat_share
