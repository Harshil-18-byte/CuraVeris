"""WhatsApp / SMS Notification Service for patient overcharge alerts."""

from typing import Optional
from app.core.config import settings
from app.core.logging import logger


class WhatsAppService:
    def __init__(self):
        self.enabled = getattr(settings, "WHATSAPP_ENABLED", False)
        self.account_sid = getattr(settings, "TWILIO_ACCOUNT_SID", "")
        self.auth_token = getattr(settings, "TWILIO_AUTH_TOKEN", "")
        self.from_number = getattr(settings, "TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")
        self.client = None

        if self.enabled and self.account_sid and self.auth_token:
            try:
                from twilio.rest import Client
                self.client = Client(self.account_sid, self.auth_token)
            except Exception as exc:
                logger.warning(f"Twilio client init deferred: {exc}")

    def send_bill_audit_notification(self, to_phone: str, hospital_name: str, savings: float, report_url: str):
        msg = f"MedBill AI Audit Alert: We identified potential savings of ₹{savings:,.2f} on your bill from {hospital_name}. Access your full legal dispute notice here: {report_url}"
        if not self.client:
            logger.info(f"[Mock WhatsApp to {to_phone}]: {msg}")
            return {"status": "mock_sent", "to": to_phone}

        try:
            message = self.client.messages.create(
                body=msg,
                from_=self.from_number,
                to=f"whatsapp:{to_phone}" if not to_phone.startswith("whatsapp:") else to_phone
            )
            return {"status": "sent", "sid": message.sid}
        except Exception as exc:
            logger.error(f"WhatsApp dispatch failed: {exc}")
            return {"status": "failed", "error": str(exc)}


whatsapp_service = WhatsAppService()
