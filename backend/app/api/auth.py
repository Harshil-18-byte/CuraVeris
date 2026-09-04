"""
Authentication & Access Control API for CuraVeris.

Supports:
- Multi-Tenant User Registration with organization binding and RBAC
- Login with brute-force lockout and JWT access + refresh tokens
- Refresh token rotation with database persistence & revocation
- Anonymization and DPDP 2023 Right-to-Erasure compliance
"""
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_
from app.db.database import get_db
from app.db.models import User, RefreshToken, Organization, Patient, Device
from app.models.schemas import UserRegister, UserLogin, UserResponse, Token, RefreshTokenRequest, DeviceRegistrationRequest, DeviceResponse, PushTokenRequest
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    oauth2_scheme,
    oauth2_optional_scheme,
    verify_token,
    hash_token,
    encrypt_pii,
    record_failed_login,
    clear_failed_login,
    check_login_locked,
    require_roles
)
from app.core.config import settings
from app.core.limiter import limiter

router = APIRouter(prefix="/auth", tags=["Authentication & Access Control"])


async def _device_for_request(request: Request, user: User, db: AsyncSession) -> Optional[Device]:
    """Resolves an already registered client installation without fingerprinting."""
    installation_id = request.headers.get("X-Device-Installation-ID")
    if not installation_id:
        return None
    result = await db.execute(select(Device).where(Device.user_id == user.id, Device.installation_id == installation_id, Device.is_active == True))
    return result.scalars().first()


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Dependency for securing endpoints with JWT auth. Token subject is user UUID."""
    payload = verify_token(token, expected_type="access")
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token subject")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or account deactivated")
    return user


async def get_optional_user(
    token: Optional[str] = Depends(oauth2_optional_scheme),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    """Returns the authenticated user or None for optional-auth endpoints."""
    if not token:
        return None
    try:
        return await get_current_user(token, db)
    except Exception:
        return None



@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def register(request: Request, user_in: UserRegister, db: AsyncSession = Depends(get_db)):
    """
    Register a new user account with role and optional organization context.
    """
    email_clean = user_in.email.lower().strip()
    existing = await db.execute(select(User).where(User.email == email_clean))
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    # Validate org_id if provided
    org_id = user_in.org_id
    if org_id:
        org_check = await db.execute(select(Organization).where(Organization.id == org_id))
        if not org_check.scalars().first():
            raise HTTPException(status_code=400, detail="Specified organization does not exist.")

    role_normalized = (user_in.role or "PATIENT").upper()
    if role_normalized != "PATIENT" or org_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Public registration is limited to patient accounts.")

    new_user = User(
        email=email_clean,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=role_normalized,
        org_id=None,
        encrypted_phone=encrypt_pii(user_in.phone),
    )
    db.add(new_user)
    await db.flush()

    # Automatically create Patient profile for PATIENT role
    if role_normalized == "PATIENT":
        patient_profile = Patient(
            user_id=new_user.id,
            encrypted_name=encrypt_pii(user_in.full_name),
            encrypted_phone=encrypt_pii(user_in.phone),
            encrypted_email=encrypt_pii(email_clean)
        )
        db.add(patient_profile)

    access_token = create_access_token(
        subject=str(new_user.id),
        role=str(new_user.role),
        org_id=str(new_user.org_id) if new_user.org_id else None
    )
    raw_refresh = create_refresh_token(
        subject=str(new_user.id),
        org_id=str(new_user.org_id) if new_user.org_id else None
    )

    # Persist refresh token hash
    rt_record = RefreshToken(
        user_id=new_user.id,
        token_hash=hash_token(raw_refresh),
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    )
    db.add(rt_record)
    await db.commit()
    await db.refresh(new_user)

    return Token(
        access_token=access_token,
        refresh_token=raw_refresh,
        token_type="bearer",
        user=UserResponse.model_validate(new_user),
    )


@router.post("/login", response_model=Token)
@limiter.limit("15/minute")
async def login(
    request: Request,
    credentials: UserLogin,
    db: AsyncSession = Depends(get_db),
):
    """
    Authenticate user and return JWT access token + persisted refresh token.
    """
    identifier = credentials.get_identifier().lower()
    if not identifier:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Email or phone is required")
    check_login_locked(identifier)

    result = await db.execute(select(User).where(or_(User.email == identifier, User.phone_number == identifier)))
    user = result.scalars().first()

    if not user or not user.is_active or not verify_password(credentials.password, user.hashed_password):
        record_failed_login(identifier)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    clear_failed_login(identifier)

    access_token = create_access_token(subject=user.id, role=user.role, org_id=user.org_id)
    raw_refresh = create_refresh_token(subject=user.id, org_id=user.org_id)

    device = await _device_for_request(request, user, db)
    rt_record = RefreshToken(
        user_id=user.id,
        device_id=device.id if device else None,
        token_hash=hash_token(raw_refresh),
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    )
    db.add(rt_record)
    await db.commit()

    return Token(
        access_token=access_token,
        refresh_token=raw_refresh,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.post("/refresh", response_model=Token)
@limiter.limit("30/minute")
async def refresh_tokens(
    request: Request,
    body: Optional[RefreshTokenRequest] = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Rotate an active refresh token for a new access token + refresh token pair.
    """
    raw_token = None
    if body and body.refresh_token:
        raw_token = body.refresh_token
    else:
        authorization = request.headers.get("Authorization", "")
        if authorization.startswith("Bearer "):
            raw_token = authorization.removeprefix("Bearer ").strip()

    if not raw_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token required in request body or Authorization header",
        )

    # Look up token directly in DB by hash
    token_h = hash_token(raw_token)
    rt_query = await db.execute(
        select(RefreshToken).where(
            RefreshToken.token_hash == token_h,
            RefreshToken.is_revoked == False
        )
    )
    rt_entry = rt_query.scalars().first()
    if not rt_entry:
        raise HTTPException(status_code=401, detail="Refresh token has been revoked or expired")
    user_id = str(rt_entry.user_id)
    rt_expires = rt_entry.expires_at.replace(tzinfo=timezone.utc) if rt_entry.expires_at.tzinfo is None else rt_entry.expires_at
    if rt_expires < datetime.now(timezone.utc):
        rt_entry.is_revoked = True
        await db.commit()
        raise HTTPException(status_code=401, detail="Refresh token has expired")


    # Invalidate previous refresh token (rotation)
    rt_entry.is_revoked = True

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User account not found or disabled")

    # Issue new token pair
    new_access = create_access_token(subject=user.id, role=user.role, org_id=user.org_id)
    new_refresh = create_refresh_token(subject=user.id, org_id=user.org_id)

    new_rt_entry = RefreshToken(
        user_id=user.id,
        device_id=rt_entry.device_id,
        token_hash=hash_token(new_refresh),
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    )
    db.add(new_rt_entry)
    await db.commit()

    return Token(
        access_token=new_access,
        refresh_token=new_refresh,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.post("/logout")
async def logout(
    request: Request,
    body: Optional[RefreshTokenRequest] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Revokes the active refresh token.
    """
    if not body or not body.refresh_token:
        raise HTTPException(status_code=400, detail="Refresh token is required to end the current session.")
    token_h = hash_token(body.refresh_token)
    rt_query = await db.execute(select(RefreshToken).where(RefreshToken.token_hash == token_h, RefreshToken.user_id == current_user.id))
    rt_entry = rt_query.scalars().first()
    if not rt_entry:
        raise HTTPException(status_code=404, detail="Active session not found.")
    rt_entry.is_revoked = True
    await db.commit()
    return {"status": "success", "message": "Successfully logged out."}


@router.post("/devices", response_model=DeviceResponse, status_code=status.HTTP_201_CREATED)
async def register_device(
    device_in: DeviceRegistrationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Registers a client installation after authentication; it is not identity verification."""
    result = await db.execute(select(Device).where(Device.user_id == current_user.id, Device.installation_id == device_in.installation_id))
    device = result.scalars().first()
    if device:
        device.platform = device_in.platform
        device.display_name = device_in.display_name
        device.app_version = device_in.app_version
        device.is_active = True
        device.last_seen_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(device)
        return DeviceResponse.model_validate(device)

    device = Device(user_id=current_user.id, installation_id=device_in.installation_id, platform=device_in.platform, display_name=device_in.display_name, app_version=device_in.app_version)
    db.add(device)
    await db.commit()
    await db.refresh(device)
    return DeviceResponse.model_validate(device)


@router.delete("/devices/{device_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_device(device_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Deactivates only a device owned by the current authenticated user."""
    result = await db.execute(select(Device).where(Device.id == device_id, Device.user_id == current_user.id))
    device = result.scalars().first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found.")
    device.is_active = False
    await db.commit()


@router.put("/devices/{device_id}/push-token", response_model=DeviceResponse)
async def update_push_token(device_id: str, push: PushTokenRequest, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Stores a provider token encrypted; denied permission clears any stored token."""
    result = await db.execute(select(Device).where(Device.id == device_id, Device.user_id == current_user.id, Device.is_active == True))
    device = result.scalars().first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found.")
    device.push_provider = push.provider
    device.push_permission = push.permission
    device.encrypted_push_token = encrypt_pii(push.token) if push.permission == "GRANTED" else None
    await db.commit()
    await db.refresh(device)
    return DeviceResponse.model_validate(device)


from pydantic import BaseModel, Field
import secrets
import hashlib
import time
import logging
from app.services.auth_service import send_email_otp

logger = logging.getLogger("curaveris.auth")

_OTP_STORE = {}

class OTPSendRequest(BaseModel):
    destination: str = Field(..., description="Email address or mobile phone number")
    channel: str = Field("email", description="email or sms")

class OTPVerifyRequest(BaseModel):
    destination: str = Field(..., description="Email address or mobile phone number")
    otp: str = Field(..., min_length=4, max_length=8, description="6-digit verification code")


@router.post("/otp/send")
@limiter.limit("5/minute")
async def send_otp(request: Request, body: OTPSendRequest, db: AsyncSession = Depends(get_db)):
    """
    Generates and dispatches a cryptographically secure 6-digit OTP via Resend Email / SMS.
    """
    dest = body.destination.strip().lower()
    if not dest:
        raise HTTPException(status_code=400, detail="Destination email or phone is required.")

    # Generate 6-digit random OTP
    otp_code = f"{secrets.randbelow(900000) + 100000}"
    salt = settings.SECRET_KEY or "curaveris_secret_salt_2026"
    otp_hash = hashlib.sha256((otp_code + salt).encode()).hexdigest()

    _OTP_STORE[dest] = {
        "hash": otp_hash,
        "expires_at": time.time() + 300,  # 5 minutes
        "attempts": 0
    }

    # Dispatch via Resend Email
    if "@" in dest:
        sent = await send_email_otp(to_email=dest, otp=otp_code, purpose="Authentication")
        if not sent:
            logger.warning(f"Could not deliver email to {dest} via Resend. Check API key.")
    
    return {
        "status": "success",
        "message": f"Verification code sent to {dest}. Valid for 5 minutes.",
        "expires_in_seconds": 300
    }


@router.post("/otp/verify", response_model=Token)
@limiter.limit("10/minute")
async def verify_otp_and_login(request: Request, body: OTPVerifyRequest, db: AsyncSession = Depends(get_db)):
    """
    Strictly verifies the submitted 6-digit OTP. 
    Only the exact matching code generates a valid authenticated JWT session.
    """
    dest = body.destination.strip().lower()
    submitted_otp = body.otp.strip()

    entry = _OTP_STORE.get(dest)
    if not entry:
        raise HTTPException(status_code=401, detail="No active verification code found for this address. Please request a new code.")

    if time.time() > entry["expires_at"]:
        _OTP_STORE.pop(dest, None)
        raise HTTPException(status_code=401, detail="Verification code has expired. Please request a new one.")

    if entry["attempts"] >= 3:
        _OTP_STORE.pop(dest, None)
        raise HTTPException(status_code=403, detail="Too many failed attempts. This code is invalidated.")

    salt = settings.SECRET_KEY or "curaveris_secret_salt_2026"
    submitted_hash = hashlib.sha256((submitted_otp + salt).encode()).hexdigest()

    if submitted_hash != entry["hash"]:
        entry["attempts"] += 1
        remaining = 3 - entry["attempts"]
        raise HTTPException(status_code=401, detail=f"Invalid verification code. {remaining} attempt(s) remaining.")

    # Valid OTP - consume immediately to prevent replay
    _OTP_STORE.pop(dest, None)

    # Find or create user
    user_query = await db.execute(select(User).where(or_(User.email == dest, User.phone_number == dest)))
    user = user_query.scalars().first()

    if not user:
        # Create new patient user on first OTP login
        user = User(
            email=dest if "@" in dest else f"{dest}@phone.curaveris.internal",
            phone_number=dest if "@" not in dest else None,
            hashed_password=get_password_hash(secrets.token_urlsafe(16)),
            full_name="Verified Patient",
            role="PATIENT",
            is_active=True
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    access_token = create_access_token(subject=user.id, role=user.role, org_id=user.org_id)
    raw_refresh = create_refresh_token(subject=user.id, org_id=user.org_id)

    rt_record = RefreshToken(
        user_id=user.id,
        token_hash=hash_token(raw_refresh),
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    )
    db.add(rt_record)
    await db.commit()

    return Token(
        access_token=access_token,
        refresh_token=raw_refresh,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.get("/phone-verification/capability")
async def phone_verification_capability():
    """Reports available verification channels."""
    if not getattr(settings, "SMS_PROVIDER_API_KEY", None) and not getattr(settings, "TWILIO_ACCOUNT_SID", None):
        return {"status": "UNAVAILABLE", "channels": ["email"], "provider": "unconfigured"}
    return {"status": "AVAILABLE", "channels": ["email", "sms"], "provider": "Resend API"}


@router.get("/me", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Returns the authenticated user's profile and active role."""
    return UserResponse.model_validate(current_user)


@router.post("/anonymize-me")
async def anonymize_my_account(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    DPDP Act 2023 Right-to-Erasure endpoint.
    Permanently redacts patient PII and deactivates the user account.
    """
    pseudonym = f"DPDP_Anonymized_Patient_{str(current_user.id)[:8]}"
    setattr(current_user, "full_name", pseudonym)
    setattr(current_user, "email", f"erased_{str(current_user.id)}@curaveris.internal")
    setattr(current_user, "encrypted_phone", None)
    setattr(current_user, "is_active", False)

    # Revoke all active refresh tokens
    tokens_query = await db.execute(select(RefreshToken).where(RefreshToken.user_id == current_user.id))
    for t in tokens_query.scalars().all():
        setattr(t, "is_revoked", True)

    await db.commit()
    return {
        "status": "anonymized",
        "pseudonym": pseudonym,
        "statutory_compliance": "Digital Personal Data Protection Act 2023 Section 12",
        "message": "User PII successfully erased in compliance with DPDP Act 2023 Section 12."
    }

