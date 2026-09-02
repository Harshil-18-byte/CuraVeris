"""
Stress Testing & Scenario Analysis

Five adverse scenarios applied to baseline EL and Liquidity calculations.
Each scenario modifies specific inputs and recomputes all FRM metrics.
"""

from typing import List, Dict, Any
from .expected_loss import compute_expected_loss, ELInputs, ELResult
from .liquidity_risk import compute_liquidity_risk, LiquidityInputs, LiquidityResult

SCENARIOS = [
    {
        'code': 'INSURANCE_REJECTION',
        'name': 'Insurance Rejection',
        'description': 'Insurance company rejects the claim entirely. Patient bears full net bill.',
        'assumption_changes': {'insurance_coverage_claimed': 0.0, 'expected_insurance_amount': 0.0},
    },
    {
        'code': 'INCOME_SHOCK',
        'name': '30% Income Reduction',
        'description': 'Patient experiences 30% income reduction due to illness or job loss.',
        'assumption_changes': {'monthly_income_multiplier': 0.70},
    },
    {
        'code': 'TPA_DELAY',
        'name': 'TPA Reimbursement Delay (6 months)',
        'description': 'TPA delays reimbursement by 6 months. Reimbursement discounted by cost of delay.',
        'assumption_changes': {'insurance_delay_months': 6, 'delay_discount_rate': 0.12},
    },
    {
        'code': 'ADDITIONAL_CHARGES',
        'name': 'Additional Disputed Charges (+25%)',
        'description': 'Post-audit review reveals 25% additional disputed charges.',
        'assumption_changes': {'ead_multiplier': 1.25},
    },
    {
        'code': 'COMBINED_ADVERSE',
        'name': 'Combined Adverse Scenario',
        'description': 'Insurance rejection + income shock + TPA delay simultaneously.',
        'assumption_changes': {
            'insurance_coverage_claimed': 0.0,
            'monthly_income_multiplier': 0.70,
            'insurance_delay_months': 6,
            'ead_multiplier': 1.25,
        },
    },
]


def run_stress_tests(
    baseline_el_inputs: ELInputs,
    baseline_liq_inputs: LiquidityInputs,
    baseline_el_result: ELResult,
    baseline_liq_result: LiquidityResult,
) -> List[Dict[str, Any]]:
    results = []
    
    for scenario in SCENARIOS:
        el_inputs = ELInputs(**baseline_el_inputs.__dict__)
        liq_inputs = LiquidityInputs(**baseline_liq_inputs.__dict__)
        changes = scenario['assumption_changes']
        
        if 'insurance_coverage_claimed' in changes:
            el_inputs.insurance_coverage_claimed = float(changes['insurance_coverage_claimed'])
            liq_inputs.insurance_coverage_claimed = float(changes['insurance_coverage_claimed'])
            liq_inputs.expected_insurance_amount = 0.0
        
        if 'monthly_income_multiplier' in changes:
            liq_inputs.monthly_income = baseline_liq_inputs.monthly_income * float(changes['monthly_income_multiplier'])
        
        if 'insurance_delay_months' in changes:
            months = float(changes['insurance_delay_months'])
            rate = float(changes.get('delay_discount_rate', 0.12))
            discount_factor = 1.0 / ((1.0 + rate) ** (months / 12.0))
            el_inputs.insurance_coverage_claimed *= discount_factor
            liq_inputs.expected_insurance_amount *= discount_factor
        
        if 'ead_multiplier' in changes:
            el_inputs.total_overcharge_deterministic *= float(changes['ead_multiplier'])
            liq_inputs.disputed_amount *= float(changes['ead_multiplier'])
        
        scenario_el = compute_expected_loss(el_inputs)
        
        # Ensure updated expected_insurance_amount is used in liquidity if insurance changed
        if 'insurance_coverage_claimed' in changes or 'insurance_delay_months' in changes:
            liq_inputs.expected_insurance_amount = scenario_el.expected_insurance_amount
            
        scenario_liq = compute_liquidity_risk(liq_inputs)
        
        delta_el = scenario_el.expected_loss - baseline_el_result.expected_loss
        delta_lcr = scenario_liq.lcr - baseline_liq_result.lcr
        
        if baseline_el_result.expected_loss > 0:
            el_increase_pct = (delta_el / baseline_el_result.expected_loss) * 100.0
        else:
            el_increase_pct = 100.0 if delta_el > 0 else 0.0
        
        if el_increase_pct > 100.0 or scenario_liq.lcr_category == 'DEFICIT':
            severity = 'CRITICAL'
        elif el_increase_pct > 50.0 or scenario_liq.lcr_category == 'MARGINAL':
            severity = 'HIGH'
        elif el_increase_pct > 25.0:
            severity = 'MEDIUM'
        else:
            severity = 'LOW'
        
        results.append({
            'scenario_code': scenario['code'],
            'scenario_name': scenario['name'],
            'description': scenario['description'],
            'assumption_changes': changes,
            'resulting_ead': scenario_el.ead,
            'resulting_pd': scenario_el.pd,
            'resulting_lgd': scenario_el.lgd,
            'resulting_el': scenario_el.expected_loss,
            'delta_el': round(delta_el, 2),
            'resulting_lcr': scenario_liq.lcr,
            'delta_lcr': round(delta_lcr, 4),
            'resulting_time_to_insolvency': scenario_liq.time_to_insolvency_months,
            'stress_severity': severity,
        })
    
    return results
