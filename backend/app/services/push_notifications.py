"""Provider-neutral push delivery boundary; no simulated provider success."""
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Device, Notification, NotificationDelivery, NotificationPreference


@dataclass(frozen=True)
class ProviderResult:
    status: str
    provider_message_id: Optional[str] = None
    failure_code: Optional[str] = None


class PushProvider:
    async def deliver(self, device: Device, notification: Notification) -> ProviderResult:
        return ProviderResult(status="REQUIRES_EXTERNAL_VERIFICATION", failure_code="PROVIDER_NOT_CONFIGURED")


class NotificationService:
    async def publish(self, db: AsyncSession, *, user_id: str, event_id: str, event_type: str, title: str, body: str, priority: str = "NORMAL", deep_link: Optional[str] = None, entity_type: Optional[str] = None, entity_id: Optional[str] = None) -> Notification:
        existing = await db.execute(select(Notification).where(Notification.user_id == user_id, Notification.event_id == event_id))
        notification = existing.scalars().first()
        if notification:
            return notification
        notification = Notification(user_id=user_id, event_id=event_id, event_type=event_type, priority=priority, title=title, body=body, deep_link=deep_link, entity_type=entity_type, entity_id=entity_id)
        db.add(notification)
        await db.flush()
        preference = await db.get(NotificationPreference, user_id)
        if preference is None:
            preference = NotificationPreference(user_id=user_id)
            db.add(preference)
        if preference.push_enabled:
            devices = await db.execute(select(Device).where(Device.user_id == user_id, Device.is_active == True, Device.push_permission == "GRANTED", Device.encrypted_push_token.is_not(None)))
            for device in devices.scalars():
                db.add(NotificationDelivery(notification_id=notification.id, device_id=device.id, provider=device.push_provider or "UNKNOWN"))
        return notification

    async def deliver_pending(self, db: AsyncSession, provider: Optional[PushProvider] = None) -> int:
        provider = provider or PushProvider()
        pending = await db.execute(select(NotificationDelivery).where(NotificationDelivery.status == "PENDING"))
        count = 0
        for delivery in pending.scalars():
            device = await db.get(Device, delivery.device_id)
            notification = await db.get(Notification, delivery.notification_id)
            if not device or not device.is_active:
                delivery.status, delivery.failure_code = "CANCELLED", "DEVICE_REVOKED"
                continue
            result = await provider.deliver(device, notification)
            delivery.status, delivery.provider_message_id, delivery.failure_code = result.status, result.provider_message_id, result.failure_code
            delivery.attempt_count += 1
            if result.status == "FAILED" and delivery.attempt_count < 3:
                delivery.status = "PENDING"
                delivery.next_attempt_at = datetime.now(timezone.utc) + timedelta(minutes=2 ** delivery.attempt_count)
            count += 1
        return count


notification_service = NotificationService()
