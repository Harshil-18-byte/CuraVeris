from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.models.user import User
from app.models.bill import Bill
from app.models.audit import Audit
from app.api.v1.auth import get_current_user

router = APIRouter(prefix="/admin", tags=["Admin Operations"])


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Administrator role required")
    return current_user


@router.get("/metrics")
async def get_system_metrics(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """System-wide telemetry and billing statistics."""
    total_users = (await db.execute(select(func.count(User.id)))).scalar() or 0
    total_bills = (await db.execute(select(func.count(Bill.id)))).scalar() or 0
    audited_bills = (await db.execute(select(func.count(Bill.id)).where(Bill.processing_status == "COMPLETED"))).scalar() or 0
    total_overcharge = (await db.execute(select(func.sum(Audit.total_overcharge_deterministic)))).scalar() or 0

    return {
        "total_users": total_users,
        "total_bills": total_bills,
        "audited_bills": audited_bills,
        "total_overcharge_flagged_inr": float(total_overcharge),
        "engine_version": "1.0.0",
    }


@router.get("/users")
async def list_all_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Lists all registered users for administrators."""
    total = (await db.execute(select(func.count(User.id)))).scalar() or 0
    query = select(User).order_by(User.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    users = (await db.execute(query)).scalars().all()

    return {
        "items": [{
            "id": str(u.id),
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at,
        } for u in users],
        "total": total,
        "page": page,
        "per_page": per_page,
    }
