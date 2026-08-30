from typing import List, Optional, Tuple
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.models.bill import Bill, BillLineItem
from app.models.audit import Audit
from app.core.storage import storage_adapter


async def get_user_bills(
    db: AsyncSession,
    user_id: UUID,
    page: int = 1,
    per_page: int = 20,
    status_filter: Optional[str] = None,
) -> Tuple[List[Bill], int]:
    """Retrieves paginated list of active bills for a given user."""
    query = select(Bill).where(and_(Bill.user_id == user_id, Bill.deleted_at.is_(None)))
    count_query = select(func.count(Bill.id)).where(and_(Bill.user_id == user_id, Bill.deleted_at.is_(None)))

    if status_filter and status_filter.upper() != "ALL":
        query = query.where(Bill.processing_status == status_filter.upper())
        count_query = count_query.where(Bill.processing_status == status_filter.upper())

    total = (await db.execute(count_query)).scalar() or 0
    query = query.order_by(Bill.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    results = (await db.execute(query)).scalars().all()
    return list(results), total


async def get_bill_detail(db: AsyncSession, bill_id: UUID, user_id: UUID) -> Optional[Bill]:
    """Fetches bill and generates presigned URL."""
    stmt = select(Bill).where(and_(Bill.id == bill_id, Bill.user_id == user_id, Bill.deleted_at.is_(None)))
    bill = (await db.execute(stmt)).scalar_one_or_none()
    return bill
