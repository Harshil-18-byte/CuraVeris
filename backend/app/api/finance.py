"""
Hospital Finance Operations & Revenue Recovery Controller API for CuraVeris.

Powers the CFO / Finance Operations Dashboard:
- Aggregated financial KPI metrics (Gross Billed, Collected, Recoverable Revenue, Exception Rates)
- Unresolved Exception Queue with priority and suggested resolutions
- AI-Assisted Revenue Recovery Prioritization (Aging, probability, business impact)
"""
from decimal import Decimal
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.db.database import get_db
from app.db.models import (
    Invoice, Reconciliation, ReconciliationException, Payment, Claim, User
)
from app.models.schemas import ReconciliationExceptionResponse
from app.core.security import require_roles
from app.core.currency import to_decimal, ZERO, format_inr

router = APIRouter(prefix="/finance", tags=["Hospital Finance & Revenue Recovery"])


@router.get("/metrics")
async def get_finance_dashboard_metrics(
    tenant_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Returns aggregated financial controller metrics:
    - Gross Billed, Collected, Outstanding, Settlement Pending
    - Statutory Overcharges Flagged
    - TPA & Payment Exceptions count & volume
    - Potential Recoverable Revenue
    - Overall Reconciliation Balanced Rate
    """
    # Invoices aggregate
    inv_query = select(
        func.count(Invoice.id).label("total_invoices"),
        func.coalesce(func.sum(Invoice.gross_amount), Decimal("0.00")).label("gross_billed"),
        func.coalesce(func.sum(Invoice.total_overcharge), Decimal("0.00")).label("total_overcharge")
    )
    if tenant_id:
        inv_query = inv_query.where(Invoice.tenant_id == tenant_id)
    inv_res = (await db.execute(inv_query)).first()

    # Reconciliations aggregate
    rec_query = select(
        func.count(Reconciliation.id).label("total_reconciliations"),
        func.coalesce(func.sum(Reconciliation.patient_paid), Decimal("0.00")).label("collected"),
        func.coalesce(func.sum(Reconciliation.outstanding_patient_balance), Decimal("0.00")).label("outstanding"),
        func.coalesce(func.sum(Reconciliation.patient_unjust_gap), Decimal("0.00")).label("refunds_due"),
        func.coalesce(func.sum(Reconciliation.settled_amount), Decimal("0.00")).label("settled")
    )
    if tenant_id:
        rec_query = rec_query.where(Reconciliation.tenant_id == tenant_id)
    rec_res = (await db.execute(rec_query)).first()

    # Exceptions count & volume
    exc_query = select(
        func.count(ReconciliationException.id).label("open_exceptions_count"),
        func.coalesce(func.sum(ReconciliationException.amount), Decimal("0.00")).label("open_exceptions_amount")
    ).where(ReconciliationException.status == "OPEN")
    exc_res = (await db.execute(exc_query)).first()

    gross = to_decimal(inv_res.gross_billed if inv_res else ZERO)
    collected = to_decimal(rec_res.collected if rec_res else ZERO)
    outstanding = to_decimal(rec_res.outstanding if rec_res else ZERO)
    refunds_due = to_decimal(rec_res.refunds_due if rec_res else ZERO)
    overcharge = to_decimal(inv_res.total_overcharge if inv_res else ZERO)
    settled = to_decimal(rec_res.settled if rec_res else ZERO)
    
    total_recs = (rec_res.total_reconciliations if rec_res else 0) or 1
    balanced_query = select(func.count(Reconciliation.id)).where(Reconciliation.status == "BALANCED")
    if tenant_id:
        balanced_query = balanced_query.where(Reconciliation.tenant_id == tenant_id)
    balanced_count = (await db.execute(balanced_query)).scalar() or 0

    reconciliation_rate = round((balanced_count / max(total_recs, 1)) * 100, 1)
    recoverable_revenue = max(ZERO, outstanding + to_decimal(exc_res.open_exceptions_amount if exc_res else ZERO) - refunds_due)

    return {
        "gross_billed": gross,
        "gross_billed_formatted": format_inr(gross),
        "collected_amount": collected,
        "collected_amount_formatted": format_inr(collected),
        "outstanding_balance": outstanding,
        "outstanding_balance_formatted": format_inr(outstanding),
        "settled_amount": settled,
        "settled_amount_formatted": format_inr(settled),
        "statutory_overcharges_flagged": overcharge,
        "refunds_due": refunds_due,
        "recoverable_revenue": recoverable_revenue,
        "recoverable_revenue_formatted": format_inr(recoverable_revenue),
        "open_exceptions_count": exc_res.open_exceptions_count if exc_res else 0,
        "open_exceptions_amount": to_decimal(exc_res.open_exceptions_amount if exc_res else ZERO),
        "reconciliation_rate_percent": reconciliation_rate,
        "as_of": datetime.now(timezone.utc)
    }


@router.get("/exceptions/queue", response_model=List[ReconciliationExceptionResponse])
async def get_exception_queue(
    status_filter: Optional[str] = "OPEN",
    severity_filter: Optional[str] = None,
    limit: int = Query(50, le=100),
    db: AsyncSession = Depends(get_db)
):
    """
    Fetches the prioritized exception queue for billing auditors and finance teams.
    """
    query = select(ReconciliationException)
    if status_filter:
        query = query.where(ReconciliationException.status == status_filter.upper())
    if severity_filter:
        query = query.where(ReconciliationException.severity == severity_filter.upper())

    query = query.order_by(ReconciliationException.created_at.desc()).limit(limit)
    result = await db.execute(query)
    exceptions = result.scalars().all()
    return [ReconciliationExceptionResponse.model_validate(e) for e in exceptions]


@router.patch("/exceptions/{exception_id}/resolve")
async def resolve_exception(
    exception_id: str,
    resolution_status: str = Query("RESOLVED", description="RESOLVED | WAIVED"),
    notes: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Mark an exception as resolved or waived with operational audit notes.
    """
    query = await db.execute(select(ReconciliationException).where(ReconciliationException.id == exception_id))
    exc = query.scalars().first()
    if not exc:
        raise HTTPException(status_code=404, detail="Exception not found.")

    exc.status = resolution_status.upper()
    exc.resolved_at = datetime.now(timezone.utc)
    if notes:
        exc.cause = f"{exc.cause} | Resolution Note: {notes}"

    await db.commit()
    await db.refresh(exc)
    return {"status": "success", "exception_id": exc.id, "new_status": exc.status}


@router.get("/revenue-recovery/prioritized")
async def get_revenue_recovery_pipeline(
    db: AsyncSession = Depends(get_db)
) -> List[Dict[str, Any]]:
    """
    AI-Assisted Revenue Recovery prioritization engine.
    Analyzes outstanding balances, abandoned claims, and TPA discrepancies.
    Calculates probability of recovery and recommended ethical touchpoint.
    """
    query = select(Reconciliation).where(
        (Reconciliation.outstanding_patient_balance > ZERO) | (Reconciliation.tpa_deductions > ZERO)
    ).order_by(Reconciliation.outstanding_patient_balance.desc()).limit(25)

    result = await db.execute(query)
    reconciliations = result.scalars().all()

    pipeline = []
    for rec in reconciliations:
        out = to_decimal(rec.outstanding_patient_balance)
        tpa_gap = to_decimal(rec.tpa_deductions)
        recoverable = out + tpa_gap

        # Heuristic scoring
        if out > Decimal("50000.00"):
            prob = 0.85
            tier = "HIGH_VALUE"
            action = "Offer Flexible EMI or TPA Structured Settlement"
        elif tpa_gap > Decimal("10000.00"):
            prob = 0.75
            tier = "TPA_DISPUTE"
            action = "Dispatch Evidence Package to Insurer Grievance Desk"
        else:
            prob = 0.60
            tier = "STANDARD_COLLECTION"
            action = "Automated WhatsApp Digital Payment Link Dispatch"

        pipeline.append({
            "reconciliation_id": rec.id,
            "invoice_id": rec.invoice_id,
            "recoverable_amount": recoverable,
            "recoverable_amount_formatted": format_inr(recoverable),
            "outstanding_patient_balance": out,
            "tpa_deductions": tpa_gap,
            "recovery_probability": prob,
            "priority_tier": tier,
            "recommended_strategy": action,
            "created_at": rec.created_at
        })

    return pipeline
