"""
Financial Risk Management (FRM) & Medical Toxicity Engine for Indian Patients.
Calculates catastrophic health expenditure risk, income shocks, DSTI (Debt Service to Income),
and unlocks automatic social safety nets (PM-JAY, CM Relief Funds, CSR Medical Grants).
"""
import math
from typing import Dict, Any, List, Optional


def calculate_emi(principal: float, annual_rate_pct: float = 18.0, tenure_months: int = 24) -> float:
    """Calculate monthly loan amortization EMI for medical bill financing."""
    if principal <= 0:
        return 0.0
    monthly_rate = (annual_rate_pct / 100.0) / 12.0
    emi = principal * monthly_rate * ((1 + monthly_rate) ** tenure_months) / (((1 + monthly_rate) ** tenure_months) - 1)
    return round(emi, 2)


def calculate_financial_toxicity(
    total_billed: float,
    patient_payable: float,
    annual_household_income: float,
    liquid_savings: float = 0.0,
    insurance_approved: float = 0.0,
    payment_method: str = "card",  # 'emi', 'upi', 'card', 'cash', 'netbanking'
    has_prior_debt: bool = False,
    state: str = "India"
) -> Dict[str, Any]:
    """
    Computes household Financial Toxicity Score (0-100) using quantitative FRM indicators:
    1. Income Shock: Out-of-pocket share vs annual income (Catastrophic if > 10% annual income under WHO/NITI Aayog norms)
    2. Coverage Gap: Uninsured portion of hospital invoice
    3. EMI Stress Factor: Razorpay payment method signal (EMI indicates liquidity failure)
    4. Savings Depletion Runway: Months of reserves consumed by hospital bill
    5. DSTI (Debt Service to Income): Burden of financing out-of-pocket liability
    """
    monthly_income = max(1000.0, annual_household_income / 12.0)
    patient_payable = max(0.0, patient_payable)
    total_billed = max(100.0, total_billed)

    # 1. Income Shock (Cap at 1.0)
    income_shock = min(1.0, patient_payable / max(10000.0, annual_household_income))

    # 2. Coverage Gap
    coverage_gap = max(0.0, min(1.0, (total_billed - insurance_approved) / total_billed))

    # 3. EMI Distress Signal from Razorpay
    is_emi = payment_method.lower() == "emi"
    emi_stress = 1.0 if is_emi else 0.0

    # 4. Savings Runway Depletion
    # How many months of patient payable can liquid savings survive?
    monthly_payable_equivalent = max(100.0, patient_payable / 12.0)
    savings_runway = liquid_savings / monthly_payable_equivalent if liquid_savings > 0 else 0.0
    runway_stress = min(1.0, 1.0 / max(savings_runway, 0.2))

    # 5. Debt Service to Income (DSTI)
    emi_if_financed = calculate_emi(patient_payable, annual_rate_pct=18.0, tenure_months=24)
    dsti = min(1.0, emi_if_financed / monthly_income)

    # FRM Quantitative Toxicity Score (0-100)
    raw_toxicity = (
        (income_shock * 0.30) +
        (coverage_gap * 0.25) +
        (emi_stress * 0.20) +
        (runway_stress * 0.15) +
        (dsti * 0.10)
    ) * 100.0

    # Boost score if patient already has prior debt or bill consumes > 50% savings
    if has_prior_debt:
        raw_toxicity = min(100.0, raw_toxicity + 8.0)
    if liquid_savings > 0 and patient_payable > liquid_savings:
        raw_toxicity = min(100.0, raw_toxicity + 10.0)

    score = round(max(0.0, min(100.0, raw_toxicity)), 1)

    # Classify Severity Category
    if score >= 75.0:
        category = "CRITICAL (Catastrophic Medical Bankruptcy Risk)"
        color = "rose"
        risk_summary = "Bill constitutes a catastrophic financial shock capable of impoverishing the household. Immediate emergency relief interventions recommended."
    elif score >= 50.0:
        category = "HIGH (Severe Liquidity Exhaustion)"
        color = "amber"
        risk_summary = "Bill heavily depletes family savings reserves and requires debt or EMI restructuring."
    elif score >= 25.0:
        category = "MODERATE (Budget Strain)"
        color = "cyan"
        risk_summary = "Bill causes noticeable financial discomfort but remains manageable through planned cash flow."
    else:
        category = "LOW (Affordable)"
        color = "emerald"
        risk_summary = "Bill is well within household financial safety thresholds."

    # Identify Eligible Government Schemes & Safety Nets
    eligible_schemes = []
    if annual_household_income <= 300000.0:
        eligible_schemes.append({
            "scheme_name": "Ayushman Bharat PM-JAY",
            "coverage_limit": "₹5,00,000 per family/year",
            "eligibility": "BPL / Low Income Household (< ₹3 Lakhs/yr)",
            "authority": "National Health Authority (NHA)",
            "portal": "https://pmjay.gov.in"
        })
        eligible_schemes.append({
            "scheme_name": "Chief Minister's Relief Fund (CMRF)",
            "coverage_limit": "₹50,000 - ₹3,00,000 one-time grant",
            "eligibility": f"State Resident of {state}",
            "authority": "State Health Secretariat",
            "portal": "State CM Relief Portal"
        })

    # Hospital Indigent Patient Trust Fund (Mandatory under Public Trust Act for Tier 1 trust hospitals)
    eligible_schemes.append({
        "scheme_name": "Hospital Indigent Patients Trust Fund (IPTF)",
        "coverage_limit": "50% - 100% concession on Bed & Diagnostics",
        "eligibility": "Income below state median; mandatory 10% beds reserved in Charitable Trust hospitals (e.g. CMC, Hinduja, Lilavati)",
        "authority": "State Charity Commissioner / Hospital Medical Superintendent",
        "portal": "Hospital Social Welfare Desk"
    })

    if is_emi or score >= 50.0:
        eligible_schemes.append({
            "scheme_name": "Corporate CSR Healthcare Emergency Aid",
            "coverage_limit": "₹25,000 - ₹2,00,000",
            "eligibility": "Catastrophic illness with verified hospital bill as documentary proof",
            "authority": "Partner Healthcare Foundations",
            "portal": "CSR Medical Desk"
        })

    return {
        "financial_toxicity_score": score,
        "category": category,
        "color_code": color,
        "summary": risk_summary,
        "metrics": {
            "income_shock_ratio": round(income_shock, 3),
            "coverage_gap_ratio": round(coverage_gap, 3),
            "emi_distress_active": is_emi,
            "savings_runway_months": round(savings_runway, 1),
            "dsti_ratio": round(dsti, 3),
            "estimated_24m_emi_inr": emi_if_financed
        },
        "eligible_safety_nets": eligible_schemes,
        "razorpay_stress_signal": "EMI payment detected on medical bill indicates active household liquidity depletion" if is_emi else "No EMI distress signal"
    }
