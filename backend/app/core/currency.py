"""
Currency and Decimal-Safe Monetary Arithmetic Module for CuraVeris.

Authoritative financial operations must never use IEEE-754 binary floating point.
This module enforces:
1. Exact Python Decimal representation with ROUND_HALF_UP rounding.
2. Two-decimal precision for Indian Rupee (INR) and integer paise representation.
3. Domain-specific financial property invariants and invariant checking.
"""
from decimal import Decimal, ROUND_HALF_UP, InvalidOperation
from typing import Union, Optional, Tuple, Dict, Any

# Canonical Decimal precision for Indian Rupee calculations
TWO_PLACES = Decimal("0.01")
ZERO = Decimal("0.00")


def to_decimal(val: Optional[Union[int, float, str, Decimal, Any]], default: Decimal = ZERO) -> Decimal:
    """
    Safely converts any numerical or string input into a quantized 2-place Decimal.
    Returns default if input is None, empty, or unparseable.
    """
    if val is None:
        return default
    if isinstance(val, Decimal):
        return val.quantize(TWO_PLACES, rounding=ROUND_HALF_UP)
    if isinstance(val, (int, float)):
        # Convert float via string representation to avoid immediate floating precision artifacts
        return Decimal(str(val)).quantize(TWO_PLACES, rounding=ROUND_HALF_UP)
    if isinstance(val, str):
        cleaned = val.strip().replace(",", "").replace("₹", "").replace("INR", "").replace("Rs.", "").replace("Rs", "").strip()
        if not cleaned:
            return default
        try:
            return Decimal(cleaned).quantize(TWO_PLACES, rounding=ROUND_HALF_UP)
        except (InvalidOperation, ValueError):
            return default
    return default


def to_paise(val: Union[int, float, str, Decimal]) -> int:
    """Converts an INR decimal amount to integer paise for payment gateways (e.g. Razorpay)."""
    d = to_decimal(val)
    return int((d * Decimal("100")).to_integral_value(rounding=ROUND_HALF_UP))


def from_paise(paise: int) -> Decimal:
    """Converts integer paise from a payment gateway into a 2-place Decimal INR."""
    return (Decimal(paise) / Decimal("100")).quantize(TWO_PLACES, rounding=ROUND_HALF_UP)


def format_inr(val: Union[int, float, str, Decimal], include_symbol: bool = True) -> str:
    """
    Formats a monetary value according to the Indian Numbering System (Lakhs and Crores).
    Example: 1234567.89 -> '₹12,34,567.89'
    """
    d = to_decimal(val)
    is_negative = d < 0
    d_abs = abs(d)
    
    parts = f"{d_abs:.2f}".split(".")
    integer_part = parts[0]
    decimal_part = parts[1]
    
    if len(integer_part) <= 3:
        formatted_int = integer_part
    else:
        # Last 3 digits
        last_three = integer_part[-3:]
        remaining = integer_part[:-3]
        
        # Group remaining digits in pairs of 2 from right to left
        groups = []
        while remaining:
            groups.insert(0, remaining[-2:])
            remaining = remaining[:-2]
        
        formatted_int = ",".join(groups) + "," + last_three

    res = f"{formatted_int}.{decimal_part}"
    if is_negative:
        res = f"-{res}"
    return f"₹{res}" if include_symbol else res


class FinancialInvariantError(ValueError):
    """Raised when a financial invariant or balance equation is breached."""
    pass


def verify_bill_totals(
    line_items_total: Decimal,
    discount_amount: Decimal,
    tax_amount: Decimal,
    net_billed_amount: Decimal,
    tolerance: Decimal = Decimal("0.05")
) -> Tuple[bool, Decimal]:
    """
    Verifies that:
    line_items_total - discount_amount + tax_amount == net_billed_amount (within tolerance)
    """
    expected = line_items_total - discount_amount + tax_amount
    diff = abs(expected - net_billed_amount)
    is_valid = diff <= tolerance
    return is_valid, diff


def verify_reconciliation_equation(
    gross_billed: Decimal,
    statutory_overcharge: Decimal,
    insurance_approved: Decimal,
    tpa_deductions: Decimal,
    patient_paid: Decimal,
    settled_amount: Decimal
) -> Dict[str, Any]:
    """
    Authoritative 4-way financial reconciliation invariant:
    1. Fair Bill Total = max(0, gross_billed - statutory_overcharge)
    2. Effective Insurer Responsibility = max(0, insurance_approved - tpa_deductions)
    3. Legitimate Patient Co-Pay = max(0, fair_bill_total - effective_insurer_responsibility)
    4. Patient Unjust Gap (Overpayment) = max(0, patient_paid - legitimate_patient_co_pay)
    5. Outstanding Patient Balance = max(0, legitimate_patient_co_pay - patient_paid)
    6. Net Settled = settled_amount
    """
    gross = to_decimal(gross_billed)
    overcharge = to_decimal(statutory_overcharge)
    ins_app = to_decimal(insurance_approved)
    tpa_ded = to_decimal(tpa_deductions)
    paid = to_decimal(patient_paid)
    settled = to_decimal(settled_amount)

    fair_bill_total = max(ZERO, gross - overcharge)
    effective_insurer_share = max(ZERO, ins_app - tpa_ded)
    legitimate_patient_share = max(ZERO, fair_bill_total - effective_insurer_share)
    
    unjust_gap = max(ZERO, paid - legitimate_patient_share)
    outstanding_balance = max(ZERO, legitimate_patient_share - paid)
    settlement_discrepancy = paid - settled

    return {
        "gross_billed": gross,
        "statutory_overcharge": overcharge,
        "fair_bill_total": fair_bill_total,
        "effective_insurer_share": effective_insurer_share,
        "legitimate_patient_share": legitimate_patient_share,
        "patient_paid": paid,
        "patient_unjust_gap": unjust_gap,
        "outstanding_balance": outstanding_balance,
        "settled_amount": settled,
        "settlement_discrepancy": settlement_discrepancy,
        "is_reconciled": unjust_gap == ZERO and outstanding_balance == ZERO and settlement_discrepancy == ZERO,
        "refund_due": unjust_gap > ZERO
    }
