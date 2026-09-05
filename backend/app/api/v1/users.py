from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from app.core.database import get_db
from app.models.user import User
from app.models.bill import Bill
from app.models.audit import Audit
from app.models.legal_doc import LegalDocument
from app.api.v1.auth import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2)
    phone_number: Optional[str] = None


@router.get("/me")
async def get_me(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Returns the authenticated user profile along with onboarding checklist status."""
    bills_count_stmt = select(func.count(Bill.id)).where(
        Bill.user_id == current_user.id,
        Bill.deleted_at.is_(None) if hasattr(Bill, "deleted_at") else True,
    )
    total_bills = (await db.execute(bills_count_stmt)).scalar() or 0

    audits_count_stmt = select(func.count(Bill.id)).where(
        Bill.user_id == current_user.id,
        Bill.processing_status == "COMPLETED",
        Bill.deleted_at.is_(None) if hasattr(Bill, "deleted_at") else True,
    )
    audits_complete = (await db.execute(audits_count_stmt)).scalar() or 0

    onboarding = {
        "bill_uploaded": total_bills > 0,
        "audit_complete": audits_complete > 0,
        "notification_enabled": bool(current_user.phone_verified),
        "profile_complete": bool(current_user.phone_number and current_user.full_name),
        "checklist_dismissed": False,
    }

    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "phone_number": current_user.phone_number,
        "phone_verified": current_user.phone_verified,
        "email_verified": current_user.email_verified,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "dpdp_consent_given": current_user.dpdp_consent_given,
        "created_at": current_user.created_at,
        "onboarding": onboarding,
    }


@router.patch("/me")
async def update_me(
    req: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Updates user profile information."""
    if req.full_name:
        current_user.full_name = req.full_name.strip()
    if req.phone_number:
        current_user.phone_number = req.phone_number.strip()

    await db.commit()
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "phone_number": current_user.phone_number,
        "full_name": current_user.full_name,
        "role": current_user.role,
    }


@router.get("/me/stats")
async def get_my_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns analytics summary stats and 6-month overcharge trends."""
    # Total bills
    bills_result = await db.execute(
        select(func.count(Bill.id)).where(
            Bill.user_id == current_user.id,
            Bill.deleted_at.is_(None) if hasattr(Bill, "deleted_at") else True,
        )
    )
    total_bills = bills_result.scalar() or 0

    # Completed audits
    completed_result = await db.execute(
        select(func.count(Bill.id)).where(
            Bill.user_id == current_user.id,
            Bill.processing_status == "COMPLETED",
            Bill.deleted_at.is_(None) if hasattr(Bill, "deleted_at") else True,
        )
    )
    audits_complete = completed_result.scalar() or 0

    # Total overcharge found
    overcharge_result = await db.execute(
        select(func.sum(Audit.total_overcharge_deterministic))
        .join(Bill, Bill.id == Audit.bill_id)
        .where(
            Bill.user_id == current_user.id,
            Bill.deleted_at.is_(None) if hasattr(Bill, "deleted_at") else True,
        )
    )
    total_overcharge = float(overcharge_result.scalar() or 0)

    # Documents generated count
    docs_count = 0
    try:
        docs_result = await db.execute(
            select(func.count(LegalDocument.id))
            .join(Bill, Bill.id == LegalDocument.bill_id)
            .where(Bill.user_id == current_user.id)
        )
        docs_count = docs_result.scalar() or 0
    except Exception:
        pass

    # Monthly trend — last 6 months
    six_months_ago = datetime.utcnow() - timedelta(days=180)
    
    # Query user bills for trend
    bills_stmt = (
        select(Bill, Audit)
        .outerjoin(Audit, Audit.bill_id == Bill.id)
        .where(
            Bill.user_id == current_user.id,
            Bill.created_at >= six_months_ago,
            Bill.deleted_at.is_(None) if hasattr(Bill, "deleted_at") else True,
        )
        .order_by(Bill.created_at.asc())
    )
    bill_audit_rows = (await db.execute(bills_stmt)).all()

    # Aggregate in Python for database-agnostic resilience
    monthly_map: Dict[str, Dict[str, Any]] = {}
    
    # Pre-populate last 6 calendar months
    now = datetime.utcnow()
    for i in range(5, -1, -1):
        month_dt = now - timedelta(days=i * 30)
        m_key = month_dt.strftime("%b %Y")
        if m_key not in monthly_map:
            monthly_map[m_key] = {"month": m_key, "bills": 0, "overcharge": 0.0}

    for b, a in bill_audit_rows:
        if b and b.created_at:
            m_key = b.created_at.strftime("%b %Y")
            if m_key not in monthly_map:
                monthly_map[m_key] = {"month": m_key, "bills": 0, "overcharge": 0.0}
            monthly_map[m_key]["bills"] += 1
            if a and a.total_overcharge_deterministic:
                monthly_map[m_key]["overcharge"] += float(a.total_overcharge_deterministic)

    return {
        "bills_total": total_bills,
        "audits_complete": audits_complete,
        "total_overcharge_found": total_overcharge,
        "documents_generated": docs_count,
        "monthly_trend": list(monthly_map.values()),
    }
