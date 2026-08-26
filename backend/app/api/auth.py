from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.database import get_db
from app.db.models import User
from app.models.schemas import UserRegister, UserLogin, UserResponse, Token
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    oauth2_scheme,
    verify_token,
    encrypt_pii,
    record_failed_login,
    clear_failed_login,
    check_login_locked,
)
from app.core.config import settings
from app.core.limiter import limiter

router = APIRouter(prefix="/auth", tags=["Authentication"])



async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Dependency for securing endpoints with JWT auth. Token subject must be user UUID."""
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
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Returns the authenticated user or None — for optional-auth endpoints."""
    try:
        return await get_current_user(token, db)
    except Exception:
        return None


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(request: Request, user_in: UserRegister, db: AsyncSession = Depends(get_db)):
    """
    Register a new patient or hospital admin account.
    Rate limited to 5 registrations per minute per IP to prevent mass account creation.
    """
    existing = await db.execute(select(User).where(User.email == user_in.email.lower()))
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    new_user = User(
        email=user_in.email.lower(),
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role or "patient",
        encrypted_phone=encrypt_pii(user_in.phone),
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # Subject is always the user UUID — never the email
    access_token = create_access_token(subject=new_user.id, role=new_user.role)
    refresh_token = create_refresh_token(subject=new_user.id)
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user),
    )


@router.post("/login", response_model=Token)
@limiter.limit("10/minute")
async def login(
    request: Request,
    credentials: UserLogin,
    db: AsyncSession = Depends(get_db),
):
    """
    Authenticate and return a JWT access token + refresh token.
    Rate limited to 10 attempts per minute per IP.
    After 5 consecutive wrong passwords the account is locked for 5 minutes.
    """
    identifier = credentials.email.lower()

    # Check brute-force lockout before doing any DB work
    check_login_locked(identifier)

    result = await db.execute(select(User).where(User.email == identifier))
    user = result.scalars().first()

    if not user or not verify_password(credentials.password, user.hashed_password):
        record_failed_login(identifier)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    # Successful login — clear the failure counter
    clear_failed_login(identifier)

    access_token = create_access_token(subject=user.id, role=user.role)
    refresh_token = create_refresh_token(subject=user.id)
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.post("/refresh", response_model=Token)
@limiter.limit("20/minute")
async def refresh_tokens(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Exchange a valid refresh token for a new access token + refresh token pair.
    Provide the refresh token in the Authorization: Bearer header.
    """
    authorization = request.headers.get("Authorization", "")
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token required in Authorization header",
        )
    raw_token = authorization.removeprefix("Bearer ").strip()

    payload = verify_token(raw_token, expected_type="refresh")
    user_id = payload.get("sub")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or account deactivated",
        )

    access_token = create_access_token(subject=user.id, role=user.role)
    refresh_token = create_refresh_token(subject=user.id)
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Return the authenticated user's profile."""
    return UserResponse.model_validate(current_user)


@router.post("/anonymize-me")
async def anonymize_current_user(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Digital Personal Data Protection (DPDP) Act 2023 Section 12 — Right to Erasure.
    Permanently replaces personal identifiers with a cryptographic pseudonym.
    Bill and audit log records are retained (they contain no personal data after this point).
    """
    import hashlib
    # Hash the user UUID (not the email) so the pseudonym is stable even if run twice
    pseudo_hash = hashlib.sha256(current_user.id.encode()).hexdigest()[:16]
    current_user.full_name = f"DPDP_Anonymized_Patient_{pseudo_hash}"
    current_user.email = f"anonymized_{pseudo_hash}@curaveris.vault"
    current_user.encrypted_phone = None
    current_user.is_active = False  # Prevent future logins with old credentials

    await db.commit()
    await db.refresh(current_user)

    return {
        "status": "ANONYMIZED",
        "pseudonym": current_user.full_name,
        "statutory_compliance": "Digital Personal Data Protection Act 2023 Section 12 (Right to Erasure)",
        "message": "Personal identifiers permanently replaced with a cryptographic pseudonym. Account deactivated.",
    }
