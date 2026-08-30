import httpx
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User, UserSession
from app.core.config import settings
from app.core.security import verify_password, create_access_token, create_refresh_token, verify_otp, password_hash
from app.core.redis import set_with_ttl, get_value, delete_key


async def send_email_otp(to_email: str, otp: str, purpose: str = "verification") -> bool:
    """Sends OTP via Resend email API."""
    if not settings.RESEND_API_KEY or settings.RESEND_API_KEY.startswith("re_dev"):
        # Local development / fallback log
        return True

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
                json={
                    "from": settings.EMAIL_FROM_ADDRESS,
                    "to": [to_email],
                    "subject": f"Your CuraVeris {purpose.replace('_', ' ').title()} Code: {otp}",
                    "html": f"<p>Your one-time verification code is: <strong>{otp}</strong></p><p>This code expires in 10 minutes.</p>",
                },
                timeout=10.0,
            )
            return resp.status_code == 200
    except Exception:
        return False
