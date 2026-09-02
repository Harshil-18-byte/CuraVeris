"""
Expected Loss Engine
EL = PD × LGD × EAD

PD: sourced from ML ensemble risk_score
LGD: computed from recovery probability estimates
EAD: net disputed exposure in ₹
"""

import numpy as np
from dataclasses import dataclass
from typing import List

INSURANCE_PAY_RATES = {
    'cghs': 0.85,
    'pmjay': 0.90,
    'irdai': 0.72,
    'tpa': 0.68,
    'self': 0.0,
    'other': 0.60,
}

DISPUTE_SUCCESS_RATES = {
    'cghs': 0.78,
    'nppa': 0.88,
    'dpco': 0.82,
    'irdai': 0.65,
    'gst': 0.71,
    'shadow_bill': 0.60,
    'default': 0.65,
}

HOSPITAL_WAIVER_BASE_RATE = 0.15


@dataclass
class ELInputs:
    total_billed: float
    total_overcharge_deterministic: float
    already_paid: float
    insurance_type: str
    insurance_coverage_claimed: float
    ml_risk_score: float
    finding_types: List[str]


@dataclass
class ELResult:
    ead: float
    pd: float
    p_insurance_pays: float
    p_dispute_succeeds: float
    p_hospital_waives: float
    recovery_rate: float
    lgd: float
    expected_loss: float
    expected_insurance_amount: float
    interpretation: str


def compute_expected_loss(inputs: ELInputs) -> ELResult:
    # EAD = net amount at risk
    # = total disputed amount - what insurance is expected to cover / already paid
    if inputs.total_overcharge_deterministic > 0:
        ead = max(0.0, float(inputs.total_overcharge_deterministic) - float(inputs.already_paid))
    else:
        ead = max(0.0, float(inputs.total_billed) - float(inputs.insurance_coverage_claimed) - float(inputs.already_paid))

    # PD = ML risk score (probability the disputed amount is not recovered)
    pd = max(0.0, min(1.0, float(inputs.ml_risk_score)))

    # P(insurance pays) = based on insurance type historical settlement rates
    ins_key = str(inputs.insurance_type).lower().strip() if inputs.insurance_type else 'self'
    p_insurance = INSURANCE_PAY_RATES.get(ins_key, INSURANCE_PAY_RATES.get('other', 0.60))
    expected_insurance_amount = float(inputs.insurance_coverage_claimed) * p_insurance

    # P(dispute succeeds) = weighted average of success rates for finding types present
    if inputs.finding_types:
        dispute_probs = [
            DISPUTE_SUCCESS_RATES.get(ft.lower().split('_')[0], DISPUTE_SUCCESS_RATES['default'])
            for ft in inputs.finding_types
        ]
        p_dispute = float(np.mean(dispute_probs))
    else:
        p_dispute = DISPUTE_SUCCESS_RATES['default']

    # P(hospital waives) = base rate, higher if overcharge is large and statutory
    waiver_rate = HOSPITAL_WAIVER_BASE_RATE
    if float(inputs.total_overcharge_deterministic) > 100000:
        waiver_rate = 0.25
    p_waiver = waiver_rate

    # Recovery rate = combined probability of recovering the loss
    # If ead is 0, recovery rate is 1.0 (no unrecovered loss)
    if ead <= 0.0:
        recovery_rate = 1.0
        lgd = 0.0
        expected_loss = 0.0
    else:
        insurance_contribution = min(1.0, expected_insurance_amount / ead) if ead > 0 else 0.0
        dispute_contribution = (1.0 - insurance_contribution) * p_dispute
        waiver_contribution = (1.0 - insurance_contribution - dispute_contribution) * p_waiver
        recovery_rate = min(1.0, max(0.0, insurance_contribution + dispute_contribution + waiver_contribution))
        lgd = max(0.0, min(1.0, 1.0 - recovery_rate))
        expected_loss = pd * lgd * ead

    # Human interpretation
    if expected_loss < 10000:
        interpretation = "Low expected financial loss. Recovery probability is high."
    elif expected_loss < 50000:
        interpretation = "Moderate expected loss. Pursue insurance claim and formal dispute."
    elif expected_loss < 200000:
        interpretation = "High expected loss. Immediate dispute filing recommended."
    else:
        interpretation = "Critical expected loss. Seek legal counsel and file ombudsman petition."

    return ELResult(
        ead=round(ead, 2),
        pd=round(pd, 6),
        p_insurance_pays=round(p_insurance, 6),
        p_dispute_succeeds=round(p_dispute, 6),
        p_hospital_waives=round(p_waiver, 6),
        recovery_rate=round(recovery_rate, 6),
        lgd=round(lgd, 6),
        expected_loss=round(expected_loss, 2),
        expected_insurance_amount=round(expected_insurance_amount, 2),
        interpretation=interpretation,
    )
