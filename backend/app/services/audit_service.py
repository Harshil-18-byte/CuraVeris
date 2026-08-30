from typing import Optional, List, Tuple
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.models.audit import Audit, AuditFinding


async def get_audit_by_bill_id(db: AsyncSession, bill_id: UUID) -> Optional[Audit]:
    """Fetches completed audit for a bill."""
    stmt = select(Audit).where(Audit.bill_id == bill_id)
    return (await db.execute(stmt)).scalar_one_or_none()


async def get_audit_findings_paginated(
    db: AsyncSession,
    audit_id: UUID,
    page: int = 1,
    per_page: int = 20,
    source_filter: Optional[str] = None,
    severity_filter: Optional[str] = None,
) -> Tuple[List[AuditFinding], int]:
    """Retrieves paginated audit findings ordered by overcharge amount."""
    query = select(AuditFinding).where(AuditFinding.audit_id == audit_id)
    count_query = select(func.count(AuditFinding.id)).where(AuditFinding.audit_id == audit_id)

    if source_filter:
        query = query.where(AuditFinding.finding_source == source_filter.upper())
        count_query = count_query.where(AuditFinding.finding_source == source_filter.upper())
    if severity_filter:
        query = query.where(AuditFinding.severity == severity_filter.upper())
        count_query = count_query.where(AuditFinding.severity == severity_filter.upper())

    total = (await db.execute(count_query)).scalar() or 0
    query = query.order_by(AuditFinding.overcharge_amount.desc()).offset((page - 1) * per_page).limit(per_page)
    results = (await db.execute(query)).scalars().all()
    return list(results), total
