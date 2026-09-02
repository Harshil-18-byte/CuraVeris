from uuid import UUID
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.core.database import get_db
from app.models.user import User
from app.models.bill import Bill, BillLineItem
from app.models.audit import Audit, AuditFinding
from app.models.financial_risk import FinancialRiskAssessment, StressScenarioResult
from app.schemas.frm import (
    FRMInputRequest,
    FinancialRiskAssessmentResponse,
    StressScenarioResponse,
    LossDistributionResponse,
    ModelRiskResponse,
    FRMAsyncResponse,
)
from app.api.v1.auth import get_current_user
from app.audit_engine.frm.orchestrator import run_frm_assessment
from app.audit_engine.frm import (
    DISCLAIMER_EL,
    DISCLAIMER_VAR,
    DISCLAIMER_MODEL_RISK,
    DISCLAIMER_STRESS,
    DISCLAIMER_LEGAL,
)
from app.audit_engine.frm.model_risk import TRAINING_FEATURE_BOUNDS

router = APIRouter(tags=["Financial Risk Management (FRM)"])


@router.post(
    "/bills/{bill_id}/frm/assess",
    response_model=FRMAsyncResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
async def start_frm_assessment(
    bill_id: UUID,
    inputs: FRMInputRequest,
    response: Response,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Computes quantitative financial risk assessment for a verified bill and completed audit.
    Executes asynchronously or synchronously based on environment, returning 202 Accepted.
    """
    # 1. Verify bill ownership
    stmt = select(Bill).where(and_(Bill.id == bill_id, Bill.deleted_at.is_(None)))
    bill = (await db.execute(stmt)).scalar_one_or_none()
    if not bill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")

    if bill.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # 2. Verify audit exists and is completed
    audit_stmt = select(Audit).where(Audit.bill_id == bill_id)
    audit = (await db.execute(audit_stmt)).scalar_one_or_none()
    if not audit:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Statutory audit must be completed before computing financial risk assessment.",
        )

    # 3. Load findings and line items
    findings_stmt = select(AuditFinding).where(AuditFinding.audit_id == audit.id)
    findings = (await db.execute(findings_stmt)).scalars().all()

    items_stmt = select(BillLineItem).where(BillLineItem.bill_id == bill_id).order_by(BillLineItem.item_sequence)
    line_items = (await db.execute(items_stmt)).scalars().all()

    user_financial_inputs = inputs.model_dump()
    for k, v in user_financial_inputs.items():
        if v is not None:
            user_financial_inputs[k] = float(v)

    # Try Celery dispatch if available; execute inline for reliability & fast response
    assessment_id = None
    try:
        from app.workers.frm_task import compute_frm_assessment
        task = compute_frm_assessment.delay(str(bill.id), user_financial_inputs)
        logger_msg = f"Queued Celery FRM task: {task.id}"
    except Exception:
        # Fallback to direct synchronous execution in FastAPI event loop
        assessment = await run_frm_assessment(
            bill=bill,
            audit=audit,
            findings=findings,
            line_items=line_items,
            user_financial_inputs=user_financial_inputs,
            db=db,
        )
        assessment_id = assessment.id

    response.status_code = status.HTTP_202_ACCEPTED
    return FRMAsyncResponse(
        assessment_id=assessment_id,
        status="COMPUTING" if assessment_id is None else "COMPLETED",
        message="FRM analysis started" if assessment_id is None else "FRM analysis computed successfully",
    )


@router.get("/bills/{bill_id}/frm/assess", response_model=FinancialRiskAssessmentResponse)
async def get_frm_assessment(
    bill_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieves full Financial Risk Assessment record for a bill."""
    stmt = select(Bill).where(and_(Bill.id == bill_id, Bill.deleted_at.is_(None)))
    bill = (await db.execute(stmt)).scalar_one_or_none()
    if not bill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")

    if bill.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    assessment_stmt = select(FinancialRiskAssessment).where(FinancialRiskAssessment.bill_id == bill_id)
    assessment = (await db.execute(assessment_stmt)).scalar_one_or_none()
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Financial risk assessment not yet computed for this bill. Please provide financial details.",
        )

    return FinancialRiskAssessmentResponse.model_validate(assessment)


@router.get("/bills/{bill_id}/frm/stress-scenarios", response_model=List[StressScenarioResponse])
async def get_stress_scenarios(
    bill_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieves stress test scenarios breakdown and severity classifications."""
    stmt = select(Bill).where(and_(Bill.id == bill_id, Bill.deleted_at.is_(None)))
    bill = (await db.execute(stmt)).scalar_one_or_none()
    if not bill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")

    if bill.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    assessment_stmt = select(FinancialRiskAssessment).where(FinancialRiskAssessment.bill_id == bill_id)
    assessment = (await db.execute(assessment_stmt)).scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")

    if assessment.stress_scenarios and isinstance(assessment.stress_scenarios, list):
        return [StressScenarioResponse.model_validate(s) for s in assessment.stress_scenarios]

    # Fallback to scenario_results relation
    sc_stmt = select(StressScenarioResult).where(StressScenarioResult.assessment_id == assessment.id)
    scenarios = (await db.execute(sc_stmt)).scalars().all()
    return [
        StressScenarioResponse(
            scenario_code=s.scenario_code,
            scenario_name=s.scenario_name,
            description=s.description,
            assumption_changes=s.assumption_changes,
            resulting_ead=s.resulting_ead,
            resulting_pd=s.resulting_pd,
            resulting_lgd=s.resulting_lgd,
            resulting_el=s.resulting_el,
            delta_el=s.delta_el,
            resulting_lcr=s.resulting_lcr,
            delta_lcr=s.delta_lcr,
            resulting_time_to_insolvency=s.resulting_time_to_insolvency,
            stress_severity=s.stress_severity,
        )
        for s in scenarios
    ]


@router.get("/bills/{bill_id}/frm/loss-distribution", response_model=LossDistributionResponse)
async def get_loss_distribution(
    bill_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieves 10,000-sample Monte Carlo simulated loss distribution and VaR/CVaR metrics."""
    stmt = select(Bill).where(and_(Bill.id == bill_id, Bill.deleted_at.is_(None)))
    bill = (await db.execute(stmt)).scalar_one_or_none()
    if not bill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")

    if bill.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    assessment_stmt = select(FinancialRiskAssessment).where(FinancialRiskAssessment.bill_id == bill_id)
    assessment = (await db.execute(assessment_stmt)).scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")

    var_95_val = float(assessment.var_95 or 0)
    cvar_95_val = float(assessment.cvar_95 or 0)

    plain_var95 = (
        f"In the worst 5% of scenarios, your financial loss from this bill "
        f"would be ₹{var_95_val:,.0f} or more."
    )
    plain_cvar95 = (
        f"In those worst 5% of scenarios, your average loss would be ₹{cvar_95_val:,.0f}. "
        f"This is your Expected Shortfall — the risk you cannot diversify away."
    )

    return LossDistributionResponse(
        mc_sample_count=assessment.mc_sample_count or 10000,
        el_mean=assessment.el_mean,
        el_std=assessment.el_std,
        var_90=assessment.var_90,
        var_95=assessment.var_95,
        cvar_95=assessment.cvar_95,
        el_distribution_summary=assessment.el_distribution_summary,
        plain_english_var95=plain_var95,
        plain_english_cvar95=plain_cvar95,
        disclaimer=DISCLAIMER_VAR,
    )


@router.get("/bills/{bill_id}/frm/model-risk", response_model=ModelRiskResponse)
async def get_model_risk(
    bill_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieves Model Risk Management (MRM) metrics, OOD detection, and human review flags."""
    stmt = select(Bill).where(and_(Bill.id == bill_id, Bill.deleted_at.is_(None)))
    bill = (await db.execute(stmt)).scalar_one_or_none()
    if not bill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")

    if bill.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    assessment_stmt = select(FinancialRiskAssessment).where(FinancialRiskAssessment.bill_id == bill_id)
    assessment = (await db.execute(assessment_stmt)).scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")

    pred_conf = float(assessment.prediction_confidence or 0.0)
    if pred_conf >= 0.80:
        confidence_interp = "High confidence. Model results are reliable for this bill type."
    elif pred_conf >= 0.60:
        confidence_interp = "Moderate confidence. Results are directionally reliable but treat specific amounts as estimates."
    else:
        confidence_interp = "Low confidence. Treat AI results as indicative only. Statutory findings are unaffected."

    # Extract ood_features if recorded in reasons or calculate
    ood_features = []
    if assessment.human_review_reasons:
        for r in assessment.human_review_reasons:
            if "out-of-distribution" in r and ":" in r:
                features_part = r.split(":")[-1].replace(")", "").strip()
                ood_features = [f.strip() for f in features_part.split(",") if f.strip()]

    return ModelRiskResponse(
        prediction_confidence=assessment.prediction_confidence,
        data_quality_score=assessment.data_quality_score,
        ood_ratio=assessment.ood_ratio,
        ood_features=ood_features,
        model_risk_level=assessment.model_risk_level,
        requires_human_review=assessment.requires_human_review,
        human_review_reasons=assessment.human_review_reasons,
        confidence_interpretation=confidence_interp,
        disclaimer=DISCLAIMER_MODEL_RISK,
    )
