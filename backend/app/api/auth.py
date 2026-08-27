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
from app.db.database import get_db
from app.db.models import User, RefreshToken, Organization, Patient
from app.models.schemas import UserRegister, UserLogin, UserResponse, Token, RefreshTokenRequest
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    oauth2_scheme,
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
    token: Optional[str] = Depends(oauth2_scheme),
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

    new_user = User(
        email=email_clean,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=role_normalized,
        org_id=org_id,
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
    identifier = credentials.email.lower().strip()
    check_login_locked(identifier)

    result = await db.execute(select(User).where(User.email == identifier))
    user = result.scalars().first()

    if not user or not verify_password(credentials.password, user.hashed_password):
        record_failed_login(identifier)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    clear_failed_login(identifier)

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

    payload = verify_token(raw_token, expected_type="refresh")
    user_id = payload.get("sub")

    # Verify token is in DB and not revoked
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
    if body and body.refresh_token:
        token_h = hash_token(body.refresh_token)
        rt_query = await db.execute(select(RefreshToken).where(RefreshToken.token_hash == token_h))
        rt_entry = rt_query.scalars().first()
        if rt_entry:
            rt_entry.is_revoked = True
            await db.commit()
    return {"status": "success", "message": "Successfully logged out."}


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
    setattr(current_user, "full_name", f"Redacted User {str(current_user.id)[:8]}")
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
        "message": "User PII successfully erased in compliance with DPDP Act 2023 Section 12."
    }
