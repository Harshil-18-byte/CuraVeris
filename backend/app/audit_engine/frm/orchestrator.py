"""
FRM Orchestrator

Runs all five FRM modules in sequence, validates business rules,
and persists the FinancialRiskAssessment and StressScenarioResult records.
"""

import math
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from .expected_loss import compute_expected_loss, ELInputs
from .liquidity_risk import compute_liquidity_risk, LiquidityInputs
from .stress_testing import run_stress_tests
from .var_cvar import compute_var_cvar, VaRInputs
from .model_risk import compute_model_risk, ModelRiskInputs
from app.models.audit import Audit, AuditFinding
from app.models.bill import Bill, BillLineItem
from app.models.financial_risk import FinancialRiskAssessment, StressScenarioResult

FRM_ENGINE_VERSION = '1.0.0'


async def run_frm_assessment(
    bill: Bill,
    audit: Audit,
    findings: List[AuditFinding],
    line_items: List[BillLineItem],
    user_financial_inputs: Dict[str, Any],
    db: AsyncSession,
) -> FinancialRiskAssessment:
    """
    user_financial_inputs: {
        'monthly_income': float,
        'monthly_expenses': float,
        'verified_savings': float,
        'insurance_coverage_claimed': float,
        'already_paid': float,
    }
    """
    # 1. Assemble EL inputs
    finding_types = [f.finding_type for f in findings if f.finding_source == 'DETERMINISTIC']
    el_inputs = ELInputs(
        total_billed=float(bill.total_billed_amount or 0.0),
        total_overcharge_deterministic=float(audit.total_overcharge_deterministic or 0.0),
        already_paid=float(user_financial_inputs.get('already_paid', 0.0)),
        insurance_type=bill.insurance_type or 'self',
        insurance_coverage_claimed=float(user_financial_inputs.get('insurance_coverage_claimed', 0.0)),
        ml_risk_score=float(audit.risk_score if audit.risk_score is not None else 0.5),
        finding_types=finding_types,
    )
    el_result = compute_expected_loss(el_inputs)
    
    # 2. Assemble Liquidity inputs
    liq_inputs = LiquidityInputs(
        total_billed=float(bill.total_billed_amount or 0.0),
        insurance_coverage_claimed=el_inputs.insurance_coverage_claimed,
        expected_insurance_amount=el_result.expected_insurance_amount,
        already_paid=el_inputs.already_paid,
        disputed_amount=float(audit.total_overcharge_deterministic or 0.0),
        monthly_income=float(user_financial_inputs.get('monthly_income', 0.0)),
        monthly_expenses=float(user_financial_inputs.get('monthly_expenses', 0.0)),
        verified_savings=float(user_financial_inputs.get('verified_savings', 0.0)),
    )
    liq_result = compute_liquidity_risk(liq_inputs)
    
    # 3. Stress Tests
    stress_results = run_stress_tests(el_inputs, liq_inputs, el_result, liq_result)
    combined_adverse = next((s for s in stress_results if s['scenario_code'] == 'COMBINED_ADVERSE'), stress_results[-1])
    
    # 4. VaR / CVaR (10,000 Monte Carlo samples)
    pd_mean = float(audit.risk_score) if audit.risk_score is not None else 0.5
    pd_lower = float(audit.uncertainty_lower) if audit.uncertainty_lower is not None else max(0.0, pd_mean - 0.15)
    pd_upper = float(audit.uncertainty_upper) if audit.uncertainty_upper is not None else min(1.0, pd_mean + 0.15)
    
    var_inputs = VaRInputs(
        ead=el_result.ead,
        pd_mean=pd_mean,
        pd_uncertainty_lower=pd_lower,
        pd_uncertainty_upper=pd_upper,
        recovery_rate_mean=el_result.recovery_rate,
        expected_insurance_amount=el_result.expected_insurance_amount,
        insurance_coverage_claimed=el_inputs.insurance_coverage_claimed,
        n_samples=10000,
    )
    var_result = compute_var_cvar(var_inputs)
    
    # 5. Model Risk
    extraction_confidences = [float(li.extraction_confidence or 0.0) for li in line_items]
    feature_vector = _build_feature_dict(bill, audit, line_items)
    model_risk_inputs = ModelRiskInputs(
        uncertainty_lower=pd_lower,
        uncertainty_upper=pd_upper,
        extraction_confidences=extraction_confidences,
        feature_vector=feature_vector,
        ml_risk_score=pd_mean,
    )
    model_risk_result = compute_model_risk(model_risk_inputs)
    
    # 6. Human review triggers
    review_reasons = list(model_risk_result.human_review_reasons)
    if el_result.expected_loss > 200000.0:
        review_reasons.append(f"Expected Loss exceeds ₹2,00,000 threshold (₹{el_result.expected_loss:,.0f}).")
    if var_result.cvar_95 > 500000.0:
        review_reasons.append(f"CVaR-95 exceeds ₹5,00,000 threshold (₹{var_result.cvar_95:,.0f}).")
    requires_review = (len(review_reasons) > 0) or model_risk_result.requires_human_review
    
    # 7. Financial recommendations
    recommendations = _generate_recommendations(el_result, liq_result, var_result, model_risk_result, audit)
    
    # 8. Hardship category
    hardship = _classify_hardship(liq_result.dsti_ratio)
    
    # 9. Persist / Update FinancialRiskAssessment
    existing_stmt = select(FinancialRiskAssessment).where(FinancialRiskAssessment.bill_id == bill.id)
    assessment = (await db.execute(existing_stmt)).scalar_one_or_none()
    
    if not assessment:
        assessment = FinancialRiskAssessment(
            bill_id=bill.id,
            audit_id=audit.id,
            user_id=bill.user_id,
        )
        db.add(assessment)
        await db.flush()

    # Populate assessment fields
    assessment.monthly_income = liq_inputs.monthly_income
    assessment.monthly_expenses = liq_inputs.monthly_expenses
    assessment.verified_savings = liq_inputs.verified_savings
    assessment.insurance_coverage_claimed = el_inputs.insurance_coverage_claimed
    assessment.insurance_type = bill.insurance_type
    assessment.already_paid = el_inputs.already_paid
    assessment.ead = el_result.ead
    assessment.pd = el_result.pd
    assessment.lgd = el_result.lgd
    assessment.recovery_rate = el_result.recovery_rate
    assessment.expected_loss = el_result.expected_loss
    assessment.p_insurance_pays = el_result.p_insurance_pays
    assessment.p_dispute_succeeds = el_result.p_dispute_succeeds
    assessment.p_hospital_waives = el_result.p_hospital_waives
    assessment.expected_insurance_amount = el_result.expected_insurance_amount
    assessment.immediate_obligation = liq_result.immediate_obligation
    assessment.available_liquid_resources = liq_result.available_liquid_resources
    assessment.liquidity_gap = liq_result.liquidity_gap
    assessment.lcr = liq_result.lcr
    assessment.lcr_category = liq_result.lcr_category
    assessment.dsti_ratio = liq_result.dsti_ratio
    assessment.time_to_insolvency_months = liq_result.time_to_insolvency_months
    assessment.mc_sample_count = 10000
    assessment.el_mean = var_result.el_mean
    assessment.el_std = var_result.el_std
    assessment.var_90 = var_result.var_90
    assessment.var_95 = var_result.var_95
    assessment.cvar_95 = var_result.cvar_95
    assessment.el_distribution_summary = var_result.el_distribution_summary
    assessment.stress_scenarios = stress_results
    assessment.worst_case_el = combined_adverse['resulting_el']
    assessment.worst_case_lcr = combined_adverse['resulting_lcr']
    assessment.prediction_confidence = model_risk_result.prediction_confidence
    assessment.data_quality_score = model_risk_result.data_quality_score
    assessment.ood_ratio = model_risk_result.ood_ratio
    assessment.model_risk_level = model_risk_result.model_risk_level
    assessment.requires_human_review = requires_review
    assessment.human_review_reasons = review_reasons
    assessment.financial_recommendations = recommendations
    assessment.hardship_category = hardship
    assessment.frm_engine_version = FRM_ENGINE_VERSION
    
    # Clean up and recreate scenario results
    await db.execute(delete(StressScenarioResult).where(StressScenarioResult.assessment_id == assessment.id))
    for s_data in stress_results:
        scenario_record = StressScenarioResult(
            assessment_id=assessment.id,
            scenario_name=s_data['scenario_name'],
            scenario_code=s_data['scenario_code'],
            description=s_data['description'],
            assumption_changes=s_data['assumption_changes'],
            resulting_ead=s_data['resulting_ead'],
            resulting_pd=s_data['resulting_pd'],
            resulting_lgd=s_data['resulting_lgd'],
            resulting_el=s_data['resulting_el'],
            delta_el=s_data['delta_el'],
            resulting_lcr=s_data['resulting_lcr'],
            delta_lcr=s_data['delta_lcr'],
            resulting_time_to_insolvency=s_data['resulting_time_to_insolvency'],
            stress_severity=s_data['stress_severity'],
        )
        db.add(scenario_record)

    # Link audit to this assessment
    audit.frm_assessment_id = assessment.id
    
    await db.commit()
    await db.refresh(assessment)
    return assessment


def _classify_hardship(dsti: float) -> str:
    if dsti < 0.15:
        return 'MANAGEABLE'
    elif dsti < 0.35:
        return 'MODERATE'
    elif dsti < 0.50:
        return 'SEVERE'
    else:
        return 'CRITICAL'


def _generate_recommendations(el, liq, var, model_risk, audit) -> List[Dict[str, Any]]:
    recs = []
    if el.expected_loss > 50000:
        recs.append({
            'priority': 1,
            'action': 'File formal dispute immediately',
            'rationale': f'Expected loss of ₹{el.expected_loss:,.0f} is recoverable through statutory dispute process.',
        })
    if liq.lcr_category in ('DEFICIT', 'MARGINAL'):
        recs.append({
            'priority': 2,
            'action': 'Negotiate instalment payment plan',
            'rationale': f'Liquidity Coverage Ratio of {liq.lcr:.2f}x indicates insufficient immediate resources.',
        })
    if el.p_insurance_pays < 0.70:
        recs.append({
            'priority': 3,
            'action': 'Pre-authorise insurance claim with supporting audit evidence',
            'rationale': 'Insurance settlement probability is below average. Attach CuraVeris audit report to claim.',
        })
    if var.cvar_95 > 200000:
        recs.append({
            'priority': 4,
            'action': 'Consult patient advocacy legal counsel',
            'rationale': f'Tail risk (CVaR-95) of ₹{var.cvar_95:,.0f} warrants professional legal support.',
        })
    if model_risk.requires_human_review:
        recs.append({
            'priority': 5,
            'action': 'Request CuraVeris manual review',
            'rationale': 'Model confidence flags indicate this bill may benefit from expert human review.',
        })
    return sorted(recs, key=lambda r: r['priority'])


def _build_feature_dict(bill: Bill, audit: Audit, line_items: List[BillLineItem]) -> Dict[str, Any]:
    total = float(bill.total_billed_amount or 1.0)
    drugs = sum(float(li.total_price or 0.0) for li in line_items if li.category == 'drug')
    procs = sum(float(li.total_price or 0.0) for li in line_items if li.category == 'procedure')
    gst = sum(float(li.gst_rate_applied or 0.0) * float(li.total_price or 0.0) / 100.0 for li in line_items)
    max_item = max((float(li.total_price or 0.0) for li in line_items), default=0.0)
    
    return {
        'total_billed_log': math.log1p(total),
        'line_item_count': len(line_items),
        'drug_ratio': drugs / total if total > 0 else 0.0,
        'procedure_ratio': procs / total if total > 0 else 0.0,
        'gst_ratio': gst / total if total > 0 else 0.0,
        'max_single_item': max_item / total if total > 0 else 0.0,
        'statutory_violation_count': audit.finding_count or 0,
    }
