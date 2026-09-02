import json
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from app.core.database import get_db
from app.core.security import (
    password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    generate_otp,
    verify_otp,
    verify_access_token,
)
from app.core.redis import set_with_ttl, get_value, delete_key
from app.models.user import User, UserSession
from app.schemas.auth import (
    RegisterRequest,
    VerifyOtpRequest,
    LoginRequest,
    RefreshTokenRequest,
    TokenResponse,
    PasswordResetRequest,
    PasswordResetConfirm,
)
from app.services.auth_service import send_email_otp

router = APIRouter(prefix="/auth", tags=["Authentication"])


async def get_current_user(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Dependency that extracts and verifies current authenticated user from Bearer JWT."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = authorization.split(" ")[1]
    payload = verify_access_token(token)
    user_id_str = payload.get("sub")
    if not user_id_str:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token claims")

    user_uuid = UUID(user_id_str)
    stmt = select(User).where(and_(User.id == user_uuid, User.deleted_at.is_(None)))
    user = (await db.execute(stmt)).scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")
    return user


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Registers a new user with DPDP consent and sends email OTP."""
    # Case-insensitive email uniqueness
    stmt = select(User).where(func_lower := User.email.ilike(req.email))
    existing_email = (await db.execute(stmt)).scalar_one_or_none()
    if existing_email:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    if req.phone_number:
        phone_stmt = select(User).where(User.phone_number == req.phone_number)
        existing_phone = (await db.execute(phone_stmt)).scalar_one_or_none()
        if existing_phone:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Phone number already registered")

    hashed_pw = password_hash(req.password)
    now_utc = datetime.now(timezone.utc)

    user = User(
        email=req.email.lower().strip(),
        phone_number=req.phone_number,
        password_hash=hashed_pw,
        full_name=req.full_name.strip(),
        dpdp_consent_given=req.dpdp_consent,
        dpdp_consent_at=now_utc if req.dpdp_consent else None,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # Generate and store OTP in Redis (600s TTL)
    plain_otp, hashed_otp = generate_otp()
    redis_key = f"otp:verify_email:{user.email}"
    await set_with_ttl(redis_key, json.dumps({"hash": hashed_otp, "expires_at": (now_utc + timedelta(seconds=600)).isoformat()}), 600)

    # Dispatch OTP via Resend
    await send_email_otp(user.email, plain_otp, purpose="verification")

    return {
        "user_id": str(user.id),
        "email": user.email,
        "message": "Verification OTP sent to your email",
    }


@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp_endpoint(req: VerifyOtpRequest, db: AsyncSession = Depends(get_db)):
    """Verifies OTP and issues JWT access and refresh token pair."""
    email_clean = req.email.lower().strip()
    redis_key = f"otp:{req.purpose}:{email_clean}"
    cached_data_str = await get_value(redis_key)

    if not cached_data_str:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired OTP")

    try:
        cached_data = json.loads(cached_data_str)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Corrupted OTP payload")

    if not verify_otp(req.otp, cached_data.get("hash", "")):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect verification code")

    # Fetch user
    stmt = select(User).where(User.email == email_clean)
    user = (await db.execute(stmt)).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.email_verified = True
    if req.purpose == "verify_phone":
        user.phone_verified = True

    # Invalidate OTP
    await delete_key(redis_key)

    # Issue access and refresh tokens
    access_token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    raw_refresh, hashed_refresh = create_refresh_token()

    session = UserSession(
        user_id=user.id,
        refresh_token_hash=hashed_refresh,
        expires_at=datetime.now(timezone.utc) + timedelta(days=30),
    )
    db.add(session)
    await db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=raw_refresh,
        user_id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        role=user.role,
    )


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticates user with password and account lockout enforcement."""
    identifier = req.get_identifier()
    if not identifier:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Email or phone number is required")
    stmt = select(User).where(
        and_(
            or_(User.email == identifier.lower(), User.phone_number == identifier),
            User.deleted_at.is_(None),
        )
    )
    user = (await db.execute(stmt)).scalar_one_or_none()

    now_utc = datetime.now(timezone.utc)

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email/phone or password")

    # Check lockout
    if user.locked_until and user.locked_until > now_utc:
        remaining_seconds = int((user.locked_until - now_utc).total_seconds())
        raise HTTPException(
            status_code=status.HTTP_423_LOCKED,
            detail={"error": "ACCOUNT_LOCKED", "retry_after_seconds": remaining_seconds},
        )

    # Verify password
    if not verify_password(req.password, user.password_hash):
        user.failed_login_count += 1
        if user.failed_login_count >= 5:
            user.locked_until = now_utc + timedelta(minutes=15)
        await db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email/phone or password")

    # Reset failure count & update login timestamp
    user.failed_login_count = 0
    user.locked_until = None
    user.last_login_at = now_utc

    access_token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    raw_refresh, hashed_refresh = create_refresh_token()

    session = UserSession(
        user_id=user.id,
        refresh_token_hash=hashed_refresh,
        expires_at=now_utc + timedelta(days=30),
    )
    db.add(session)
    await db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=raw_refresh,
        user_id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        role=user.role,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_tokens(req: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    """Rotates refresh token and issues new access token."""
    raw_token = req.refresh_token.strip()
    now_utc = datetime.now(timezone.utc)

    stmt = select(UserSession).where(
        and_(
            UserSession.is_revoked.is_(False),
            UserSession.expires_at > now_utc,
        )
    )
    sessions = (await db.execute(stmt)).scalars().all()

    matched_session: Optional[UserSession] = None
    for s in sessions:
        if verify_password(raw_token, s.refresh_token_hash):
            matched_session = s
            break

    if not matched_session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

    # Revoke old session
    matched_session.is_revoked = True

    # Fetch user
    user = (await db.execute(select(User).where(User.id == matched_session.user_id))).scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account inactive")

    # Create new session
    new_raw_refresh, new_hashed_refresh = create_refresh_token()
    new_session = UserSession(
        user_id=user.id,
        refresh_token_hash=new_hashed_refresh,
        expires_at=now_utc + timedelta(days=30),
    )
    db.add(new_session)

    new_access_token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    await db.commit()

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_raw_refresh,
        user_id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        role=user.role,
    )


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Revokes active user sessions."""
    stmt = select(UserSession).where(
        and_(UserSession.user_id == current_user.id, UserSession.is_revoked.is_(False))
    )
    sessions = (await db.execute(stmt)).scalars().all()
    for s in sessions:
        s.is_revoked = True
    await db.commit()
    return {"message": "Logged out successfully"}


@router.post("/request-password-reset")
async def request_password_reset(req: PasswordResetRequest, db: AsyncSession = Depends(get_db)):
    """Sends password reset OTP without revealing account existence."""
    email_clean = req.email.lower().strip()
    stmt = select(User).where(and_(User.email == email_clean, User.deleted_at.is_(None)))
    user = (await db.execute(stmt)).scalar_one_or_none()

    if user:
        plain_otp, hashed_otp = generate_otp()
        redis_key = f"otp:password_reset:{email_clean}"
        now_utc = datetime.now(timezone.utc)
        await set_with_ttl(redis_key, json.dumps({"hash": hashed_otp, "expires_at": (now_utc + timedelta(seconds=600)).isoformat()}), 600)
        await send_email_otp(email_clean, plain_otp, purpose="password_reset")

    return {"message": "If the email is registered, a password reset code has been sent."}


@router.post("/reset-password")
async def reset_password(req: PasswordResetConfirm, db: AsyncSession = Depends(get_db)):
    """Verifies reset OTP and updates user password."""
    email_clean = req.email.lower().strip()
    redis_key = f"otp:password_reset:{email_clean}"
    cached_str = await get_value(redis_key)

    if not cached_str:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset code")

    cached_data = json.loads(cached_str)
    if not verify_otp(req.otp, cached_data.get("hash", "")):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect reset code")

    stmt = select(User).where(and_(User.email == email_clean, User.deleted_at.is_(None)))
    user = (await db.execute(stmt)).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.password_hash = password_hash(req.new_password)
    user.locked_until = None
    user.failed_login_count = 0

    # Revoke all existing sessions
    sess_stmt = select(UserSession).where(UserSession.user_id == user.id)
    sessions = (await db.execute(sess_stmt)).scalars().all()
    for s in sessions:
        s.is_revoked = True

    await delete_key(redis_key)
    await db.commit()

    return {"message": "Password updated successfully. Please log in with your new credentials."}
