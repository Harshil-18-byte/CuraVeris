import pytest
from app.audit_engine.frm.expected_loss import compute_expected_loss, ELInputs
from app.audit_engine.frm.liquidity_risk import compute_liquidity_risk, LiquidityInputs
from app.audit_engine.frm.stress_testing import run_stress_tests
from app.audit_engine.frm.var_cvar import compute_var_cvar, VaRInputs
from app.audit_engine.frm.model_risk import compute_model_risk, ModelRiskInputs
from app.audit_engine.frm.orchestrator import _classify_hardship, _generate_recommendations


def test_el_zero_overcharge():
    """If total_overcharge=0 and already_paid=0 and insurance covers billed amount, EL is 0."""
    inputs = ELInputs(
        total_billed=100000.0,
        total_overcharge_deterministic=0.0,
        already_paid=0.0,
        insurance_type='cghs',
        insurance_coverage_claimed=100000.0,
        ml_risk_score=0.4,
        finding_types=[],
    )
    result = compute_expected_loss(inputs)
    assert result.ead == 0.0
    assert result.expected_loss == 0.0
    assert result.lgd == 0.0


def test_el_full_insurance_recovery():
    """If insurance covers full amount and payment rate is high, recovery rate is high and LGD is low."""
    inputs = ELInputs(
        total_billed=200000.0,
        total_overcharge_deterministic=50000.0,
        already_paid=0.0,
        insurance_type='pmjay',  # 0.90 pay rate
        insurance_coverage_claimed=100000.0,
        ml_risk_score=0.5,
        finding_types=['cghs'],
    )
    result = compute_expected_loss(inputs)
    # Expected insurance is 90k, EAD is 50k -> insurance contribution is 1.0 (capped)
    assert result.recovery_rate >= 0.99
    assert result.lgd <= 0.01
    assert result.expected_loss <= 500.0


def test_el_self_pay_no_insurance():
    """Self pay with zero insurance and no dispute findings has low recovery and high LGD."""
    inputs = ELInputs(
        total_billed=100000.0,
        total_overcharge_deterministic=80000.0,
        already_paid=0.0,
        insurance_type='self',
        insurance_coverage_claimed=0.0,
        ml_risk_score=0.8,
        finding_types=[],
    )
    result = compute_expected_loss(inputs)
    assert result.p_insurance_pays == 0.0
    assert result.expected_insurance_amount == 0.0
    # Base dispute recovery + waiver only
    assert result.recovery_rate < 1.0
    assert result.lgd > 0.0
    assert result.expected_loss > 0.0


def test_liquidity_deficit():
    """Savings=0, monthly_disposable is negative -> LCR category must be DEFICIT."""
    inputs = LiquidityInputs(
        total_billed=150000.0,
        insurance_coverage_claimed=0.0,
        expected_insurance_amount=0.0,
        already_paid=0.0,
        disputed_amount=0.0,
        monthly_income=30000.0,
        monthly_expenses=45000.0,  # negative disposable
        verified_savings=0.0,
    )
    result = compute_liquidity_risk(inputs)
    assert result.lcr_category == 'DEFICIT'
    assert result.liquidity_gap < 0.0
    assert result.lcr < 1.0


def test_liquidity_adequate():
    """Savings=500000, obligation=100000 -> LCR must be ADEQUATE or STRONG."""
    inputs = LiquidityInputs(
        total_billed=100000.0,
        insurance_coverage_claimed=0.0,
        expected_insurance_amount=0.0,
        already_paid=0.0,
        disputed_amount=0.0,
        monthly_income=80000.0,
        monthly_expenses=40000.0,
        verified_savings=500000.0,
    )
    result = compute_liquidity_risk(inputs)
    assert result.lcr_category in ('ADEQUATE', 'STRONG')
    assert result.lcr > 1.5
    assert result.liquidity_gap > 0.0


def test_time_to_insolvency_zero():
    """Savings=0 and monthly surplus is negative -> time_to_insolvency must be 0."""
    inputs = LiquidityInputs(
        total_billed=240000.0,  # 20k / mo burden
        insurance_coverage_claimed=0.0,
        expected_insurance_amount=0.0,
        already_paid=0.0,
        disputed_amount=0.0,
        monthly_income=50000.0,
        monthly_expenses=45000.0,  # 5k disposable - 20k burden = -15k surplus
        verified_savings=0.0,
    )
    result = compute_liquidity_risk(inputs)
    assert result.time_to_insolvency_months == 0


def test_stress_insurance_rejection():
    """Insurance rejection scenario produces higher expected loss than baseline when insurance was claimed."""
    el_inputs = ELInputs(
        total_billed=200000.0,
        total_overcharge_deterministic=100000.0,
        already_paid=0.0,
        insurance_type='irdai',
        insurance_coverage_claimed=80000.0,
        ml_risk_score=0.6,
        finding_types=['cghs'],
    )
    el_res = compute_expected_loss(el_inputs)

    liq_inputs = LiquidityInputs(
        total_billed=200000.0,
        insurance_coverage_claimed=80000.0,
        expected_insurance_amount=el_res.expected_insurance_amount,
        already_paid=0.0,
        disputed_amount=100000.0,
        monthly_income=60000.0,
        monthly_expenses=30000.0,
        verified_savings=50000.0,
    )
    liq_res = compute_liquidity_risk(liq_inputs)

    scenarios = run_stress_tests(el_inputs, liq_inputs, el_res, liq_res)
    ins_rej = next(s for s in scenarios if s['scenario_code'] == 'INSURANCE_REJECTION')
    assert ins_rej['resulting_el'] > el_res.expected_loss
    assert ins_rej['delta_el'] > 0


def test_stress_combined_adverse():
    """Combined adverse scenario produces highest or critical severity and significant loss."""
    el_inputs = ELInputs(
        total_billed=300000.0,
        total_overcharge_deterministic=150000.0,
        already_paid=0.0,
        insurance_type='cghs',
        insurance_coverage_claimed=120000.0,
        ml_risk_score=0.7,
        finding_types=['cghs'],
    )
    el_res = compute_expected_loss(el_inputs)

    liq_inputs = LiquidityInputs(
        total_billed=300000.0,
        insurance_coverage_claimed=120000.0,
        expected_insurance_amount=el_res.expected_insurance_amount,
        already_paid=0.0,
        disputed_amount=150000.0,
        monthly_income=70000.0,
        monthly_expenses=40000.0,
        verified_savings=80000.0,
    )
    liq_res = compute_liquidity_risk(liq_inputs)

    scenarios = run_stress_tests(el_inputs, liq_inputs, el_res, liq_res)
    comb = next(s for s in scenarios if s['scenario_code'] == 'COMBINED_ADVERSE')
    assert comb['stress_severity'] in ('HIGH', 'CRITICAL')
    assert comb['resulting_el'] >= max(s['resulting_el'] for s in scenarios if s['scenario_code'] != 'COMBINED_ADVERSE')


def test_var_ordering():
    """VaR monotonicity: VaR_90 <= VaR_95 <= VaR_99 must always hold."""
    inputs = VaRInputs(
        ead=100000.0,
        pd_mean=0.6,
        pd_uncertainty_lower=0.4,
        pd_uncertainty_upper=0.8,
        recovery_rate_mean=0.4,
        expected_insurance_amount=30000.0,
        insurance_coverage_claimed=50000.0,
        n_samples=5000,
        random_seed=42,
    )
    res = compute_var_cvar(inputs)
    assert res.var_90 <= res.var_95
    assert res.var_95 <= res.var_99


def test_cvar_geq_var():
    """CVaR-95 (Expected Shortfall) must be >= VaR-95 by mathematical definition."""
    inputs = VaRInputs(
        ead=150000.0,
        pd_mean=0.5,
        pd_uncertainty_lower=0.35,
        pd_uncertainty_upper=0.65,
        recovery_rate_mean=0.5,
        expected_insurance_amount=40000.0,
        insurance_coverage_claimed=60000.0,
        n_samples=5000,
        random_seed=123,
    )
    res = compute_var_cvar(inputs)
    assert res.cvar_95 >= res.var_95
    assert res.cvar_99 >= res.var_99


def test_model_risk_high_uncertainty():
    """Uncertainty interval of 0.8 produces low confidence score."""
    inputs = ModelRiskInputs(
        uncertainty_lower=0.1,
        uncertainty_upper=0.9,  # width = 0.8 -> confidence = 0.2
        extraction_confidences=[0.9, 0.85, 0.95],
        feature_vector={
            'total_billed_log': 11.0,
            'line_item_count': 20,
            'drug_ratio': 0.3,
            'procedure_ratio': 0.4,
            'gst_ratio': 0.05,
            'max_single_item': 0.2,
            'statutory_violation_count': 2,
        },
        ml_risk_score=0.5,
    )
    res = compute_model_risk(inputs)
    assert res.prediction_confidence <= 0.25
    assert res.requires_human_review is True


def test_model_risk_ood():
    """Features outside training bounds appear in ood_features list."""
    inputs = ModelRiskInputs(
        uncertainty_lower=0.4,
        uncertainty_upper=0.6,
        extraction_confidences=[0.9, 0.95],
        feature_vector={
            'total_billed_log': 20.0,  # Out of bounds: upper is 16.0
            'line_item_count': 300,   # Out of bounds: upper is 150
            'drug_ratio': 0.2,
            'procedure_ratio': 0.4,
            'gst_ratio': 0.05,
            'max_single_item': 0.2,
            'statutory_violation_count': 2,
        },
        ml_risk_score=0.5,
    )
    res = compute_model_risk(inputs)
    assert 'total_billed_log' in res.ood_features
    assert 'line_item_count' in res.ood_features
    assert res.ood_ratio > 0.0


def test_human_review_trigger():
    """Expected loss > 200,000 triggers human review in recommendations."""
    class DummyEL:
        expected_loss = 250000.0
        p_insurance_pays = 0.8

    class DummyLiq:
        lcr_category = 'ADEQUATE'
        lcr = 2.0

    class DummyVaR:
        cvar_95 = 300000.0

    class DummyMR:
        requires_human_review = False

    recs = _generate_recommendations(DummyEL(), DummyLiq(), DummyVaR(), DummyMR(), None)
    assert any("dispute" in r['action'].lower() for r in recs)


def test_monte_carlo_reproducibility():
    """Same random seed produces identical VaR and CVaR results."""
    inputs1 = VaRInputs(
        ead=100000.0,
        pd_mean=0.5,
        pd_uncertainty_lower=0.3,
        pd_uncertainty_upper=0.7,
        recovery_rate_mean=0.4,
        expected_insurance_amount=20000.0,
        insurance_coverage_claimed=40000.0,
        n_samples=2000,
        random_seed=777,
    )
    inputs2 = VaRInputs(
        ead=100000.0,
        pd_mean=0.5,
        pd_uncertainty_lower=0.3,
        pd_uncertainty_upper=0.7,
        recovery_rate_mean=0.4,
        expected_insurance_amount=20000.0,
        insurance_coverage_claimed=40000.0,
        n_samples=2000,
        random_seed=777,
    )
    res1 = compute_var_cvar(inputs1)
    res2 = compute_var_cvar(inputs2)
    assert res1.var_95 == res2.var_95
    assert res1.cvar_95 == res2.cvar_95
    assert res1.el_mean == res2.el_mean


def test_recommendations_ordered():
    """Recommendations are sorted in ascending order of priority."""
    class DummyEL:
        expected_loss = 60000.0
        p_insurance_pays = 0.5

    class DummyLiq:
        lcr_category = 'DEFICIT'
        lcr = 0.8

    class DummyVaR:
        cvar_95 = 250000.0

    class DummyMR:
        requires_human_review = True

    recs = _generate_recommendations(DummyEL(), DummyLiq(), DummyVaR(), DummyMR(), None)
    priorities = [r['priority'] for r in recs]
    assert priorities == sorted(priorities)


def test_hardship_classification():
    """DSTI thresholds map accurately to hardship categories."""
    assert _classify_hardship(0.10) == 'MANAGEABLE'
    assert _classify_hardship(0.25) == 'MODERATE'
    assert _classify_hardship(0.40) == 'SEVERE'
    assert _classify_hardship(0.60) == 'CRITICAL'


@pytest.mark.asyncio
async def test_frm_orchestrator_persistence(db_session):
    """Verifies complete end-to-end run_frm_assessment orchestrator with DB records."""
    import uuid
    from decimal import Decimal
    from app.models.user import User
    from app.models.bill import Bill, BillLineItem
    from app.models.audit import Audit, AuditFinding
    from app.models.financial_risk import FinancialRiskAssessment
    from app.audit_engine.frm.orchestrator import run_frm_assessment
    from sqlalchemy import select

    user = User(
        id=uuid.uuid4(),
        email=f"frm_test_{uuid.uuid4().hex[:6]}@example.com",
        password_hash="testpass",
        full_name="Risk Test User",
    )
    db_session.add(user)
    await db_session.flush()

    bill = Bill(
        id=uuid.uuid4(),
        user_id=user.id,
        hospital_name="Apollo Hospitals Delhi",
        total_billed_amount=Decimal("350000.00"),
        insurance_type="cghs",
        processing_status="COMPLETED",
        file_key="dummy_bill.pdf",
        file_name_original="dummy_bill.pdf",
        file_size_bytes=1024,
        file_mime_type="application/pdf",
        file_hash_sha256="abc123hash",
    )
    db_session.add(bill)
    await db_session.flush()

    audit = Audit(
        id=uuid.uuid4(),
        bill_id=bill.id,
        user_id=user.id,
        total_overcharge_deterministic=Decimal("120000.00"),
        risk_score=Decimal("0.65"),
        uncertainty_lower=Decimal("0.50"),
        uncertainty_upper=Decimal("0.80"),
        finding_count=2,
    )
    db_session.add(audit)
    await db_session.flush()

    finding1 = AuditFinding(
        audit_id=audit.id,
        finding_type="CGHS_RATE_EXCEEDED",
        finding_source="DETERMINISTIC",
        severity="HIGH",
        item_description="MRI Brain",
        billed_amount=Decimal("12000.00"),
        overcharge_amount=Decimal("6000.00"),
    )
    db_session.add(finding1)

    item1 = BillLineItem(
        bill_id=bill.id,
        raw_description="MRI Brain",
        category="procedure",
        total_price=Decimal("12000.00"),
        extraction_confidence=Decimal("0.95"),
    )
    db_session.add(item1)
    await db_session.commit()

    inputs = {
        "monthly_income": 90000.0,
        "monthly_expenses": 50000.0,
        "verified_savings": 200000.0,
        "insurance_coverage_claimed": 30000.0,
        "already_paid": 20000.0,
    }

    assessment = await run_frm_assessment(
        bill=bill,
        audit=audit,
        findings=[finding1],
        line_items=[item1],
        user_financial_inputs=inputs,
        db=db_session,
    )

    assert assessment is not None
    assert assessment.bill_id == bill.id
    assert assessment.expected_loss > 0
    assert assessment.lcr is not None
    assert assessment.var_95 is not None
    assert len(assessment.stress_scenarios) == 5

    # Verify query
    fetched = (await db_session.execute(
        select(FinancialRiskAssessment).where(FinancialRiskAssessment.id == assessment.id)
    )).scalar_one()
    assert fetched.worst_case_el is not None

