from datetime import date
from typing import Optional, Dict, Any
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.notification import Notification
from app.core.redis import delete_key

NOTIFICATION_CATALOGUE = {
    "BILL_UPLOADED": {
        "title": "Bill Received",
        "body": "We've received your bill and will begin processing shortly.",
        "priority": "NORMAL",
        "send_push": False,
    },
    "AUDIT_COMPLETED": {
        "title": "Audit Complete",
        "body": "Your bill audit is ready. Tap to view your report.",
        "priority": "HIGH",
        "send_push": True,
    },
    "BILL_PROCESSING_FAILED": {
        "title": "Processing Failed",
        "body": "Your bill could not be processed. Please try again.",
        "priority": "HIGH",
        "send_push": True,
    },
    "STATUTORY_VIOLATION": {
        "title": "Billing Issue Found",
        "body": "Our audit identified potential billing irregularities.",
        "priority": "HIGH",
        "send_push": True,
    },
    "EXTRACTION_FAILED": {
        "title": "Upload Issue",
        "body": "We couldn't read your bill. Please upload a clearer image.",
        "priority": "HIGH",
        "send_push": True,
    },
}


async def create_notification(
    db: AsyncSession,
    user_id: UUID,
    event_type: str,
    title: Optional[str] = None,
    body: Optional[str] = None,
    priority: str = "NORMAL",
    entity_type: Optional[str] = None,
    entity_id: Optional[UUID] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> Notification:
    """Idempotently creates a user notification and invalidates Redis count cache."""
    idempotency_key = f"{event_type}:{entity_id}:{date.today()}" if entity_id else None

    if idempotency_key:
        stmt = select(Notification).where(Notification.idempotency_key == idempotency_key)
        res = await db.execute(stmt)
        existing = res.scalar_one_or_none()
        if existing:
            return existing

    template = NOTIFICATION_CATALOGUE.get(event_type, {})
    final_title = title or template.get("title", "Notification")
    final_body = body or template.get("body", "")
    final_priority = priority or template.get("priority", "NORMAL")

    notif = Notification(
        user_id=user_id,
        event_type=event_type,
        title=final_title,
        body=final_body,
        priority=final_priority,
        entity_type=entity_type,
        entity_id=entity_id,
        meta_payload=metadata,
        idempotency_key=idempotency_key,
    )
    db.add(notif)
    await db.flush()

    # Invalidate Redis unread count cache
    await delete_key(f"notif_count:{user_id}")
    return notif
