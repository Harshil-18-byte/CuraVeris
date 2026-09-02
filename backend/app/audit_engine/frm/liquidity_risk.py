"""
Liquidity Risk Engine

Measures ability to meet immediate billing obligation.
Extends existing DSTI concept with:
- Liquidity Coverage Ratio (LCR)
- Time-to-Insolvency
- Cash flow timeline
"""

from dataclasses import dataclass
from typing import List, Dict, Any
import math


@dataclass
class LiquidityInputs:
    total_billed: float
    insurance_coverage_claimed: float
    expected_insurance_amount: float  # from EL engine
    already_paid: float
    disputed_amount: float
    monthly_income: float
    monthly_expenses: float
    verified_savings: float


@dataclass
class LiquidityResult:
    immediate_obligation: float
    available_liquid_resources: float
    liquidity_gap: float
    lcr: float
    lcr_category: str
    dsti_ratio: float
    monthly_disposable: float
    time_to_insolvency_months: int
    cash_flow_timeline: List[Dict[str, Any]]
    interpretation: str


def compute_liquidity_risk(inputs: LiquidityInputs) -> LiquidityResult:
    monthly_disposable = float(inputs.monthly_income) - float(inputs.monthly_expenses)
    
    # Immediate obligation = what patient must pay right now
    # = total bill - confirmed insurance coverage - disputed hold (assumed 50% deferred) - already paid
    immediate_obligation = max(
        0.0,
        float(inputs.total_billed)
        - float(inputs.expected_insurance_amount)
        - (float(inputs.disputed_amount) * 0.50)
        - float(inputs.already_paid)
    )
    
    # Available liquid resources = savings + 3 months disposable income (3 months buffer)
    available_resources = max(0.0, float(inputs.verified_savings)) + max(0.0, monthly_disposable * 3.0)
    
    liquidity_gap = available_resources - immediate_obligation
    
    # LCR = Available / Obligation
    if immediate_obligation > 0:
        lcr = available_resources / immediate_obligation
    else:
        lcr = 999.0
    
    if lcr < 1.0:
        lcr_category = 'DEFICIT'
    elif lcr < 1.5:
        lcr_category = 'MARGINAL'
    elif lcr < 3.0:
        lcr_category = 'ADEQUATE'
    else:
        lcr_category = 'STRONG'
    
    # DSTI = annual bill burden / annual income
    if float(inputs.monthly_income) > 0:
        dsti_ratio = (immediate_obligation / 12.0) / float(inputs.monthly_income)
        dsti_ratio = max(0.0, min(dsti_ratio, 1.0))
    else:
        dsti_ratio = 1.0 if immediate_obligation > 0 else 0.0
    
    # Time-to-Insolvency = months savings + disposable can cover obligation
    # Assuming monthly EMI = immediate_obligation / 12
    monthly_burden = immediate_obligation / 12.0
    monthly_surplus = monthly_disposable - monthly_burden
    
    if monthly_surplus >= 0:
        time_to_insolvency = 999  # Sustainable
    else:
        if float(inputs.verified_savings) > 0 and monthly_surplus < 0:
            time_to_insolvency = math.floor(float(inputs.verified_savings) / abs(monthly_surplus))
        else:
            time_to_insolvency = 0
    
    # Cash flow timeline: project 12 months
    cash_flow_timeline = []
    running_savings = float(inputs.verified_savings)
    for month in range(1, 13):
        running_savings += monthly_disposable
        running_savings -= monthly_burden
        expected_insurance_month = float(inputs.expected_insurance_amount) if month == 3 else 0.0
        running_savings += expected_insurance_month
        cash_flow_timeline.append({
            'month': month,
            'running_savings': round(max(0.0, running_savings), 2),
            'cumulative_paid': round(monthly_burden * month, 2),
            'insurance_received': round(expected_insurance_month, 2),
            'is_deficit': running_savings < 0,
        })
    
    # Interpretation
    if lcr_category == 'DEFICIT':
        interpretation = (
            f"Liquidity deficit of ₹{abs(liquidity_gap):,.0f}. Patient cannot meet immediate obligation "
            f"without financial distress. Immediate dispute filing and instalment negotiation recommended."
        )
    elif lcr_category == 'MARGINAL':
        interpretation = (
            f"Marginal liquidity. Resources cover obligation by {lcr:.1f}x. "
            f"Pursue insurance claim promptly to avoid shortfall."
        )
    elif lcr_category == 'ADEQUATE':
        interpretation = f"Adequate liquidity. Resources cover obligation by {lcr:.1f}x."
    else:
        interpretation = f"Strong liquidity position. Resources cover obligation by {lcr:.1f}x."
    
    return LiquidityResult(
        immediate_obligation=round(immediate_obligation, 2),
        available_liquid_resources=round(available_resources, 2),
        liquidity_gap=round(liquidity_gap, 2),
        lcr=round(lcr, 4),
        lcr_category=lcr_category,
        dsti_ratio=round(dsti_ratio, 4),
        monthly_disposable=round(monthly_disposable, 2),
        time_to_insolvency_months=time_to_insolvency,
        cash_flow_timeline=cash_flow_timeline,
        interpretation=interpretation,
    )
