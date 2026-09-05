import logging
from datetime import date
from typing import Optional, Dict, Any
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.models.notification import Notification
from app.core.redis import delete_key

logger = logging.getLogger("curaveris.notifications")

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


async def send_sms_notification(
    phone_number: str,
    message: str,
) -> bool:
    """Dispatches SMS alert via MSG91 flow API or Twilio REST client."""
    provider = getattr(settings, "OTP_PROVIDER", "msg91")

    if not phone_number or not message:
        return False

    clean_phone = phone_number.replace("+91", "").replace("-", "").strip()

    try:
        if provider == "msg91" and getattr(settings, "MSG91_AUTH_KEY", None):
            import httpx
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    "https://api.msg91.com/api/v5/flow/",
                    headers={
                        "authkey": settings.MSG91_AUTH_KEY,
                        "Content-Type": "application/JSON",
                    },
                    json={
                        "template_id": settings.MSG91_ALERT_TEMPLATE_ID or "curaveris_alert",
                        "short_url": "0",
                        "recipients": [
                            {
                                "mobiles": f"91{clean_phone}",
                                "message": message,
                            }
                        ],
                    },
                )
                return response.status_code in [200, 202]

        elif provider == "twilio" and getattr(settings, "TWILIO_ACCOUNT_SID", None):
            from twilio.rest import Client
            client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            client.messages.create(
                body=message,
                from_=settings.TWILIO_FROM_NUMBER,
                to=f"+91{clean_phone}",
            )
            return True

    except Exception as e:
        logger.warning(f"SMS dispatch skipped or provider unavailable: {e}")
        return False

    return False
