from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.database import get_db
from app.db.models import User
from app.models.schemas import UserRegister, UserLogin, UserResponse, Token
from app.core.security import get_password_hash, verify_password, create_access_token, oauth2_scheme, verify_token, encrypt_pii
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> User:
    """Dependency for securing endpoints with JWT auth."""
    payload = verify_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token subject")
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def get_optional_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> User:
    try:
        return await get_current_user(token, db)
    except Exception:
        return None


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserRegister, db: AsyncSession = Depends(get_db)):
    """Register a new patient or hospital admin account."""
    # Check duplicate email
    existing = await db.execute(select(User).where(User.email == user_in.email.lower()))
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    new_user = User(
        email=user_in.email.lower(),
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role or "patient",
        encrypted_phone=encrypt_pii(user_in.phone)
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    token = create_access_token(subject=new_user.id, role=new_user.role)
    return Token(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user)
    )


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    """Login and obtain a JWT bearer token."""
    result = await db.execute(select(User).where(User.email == credentials.email.lower()))
    user = result.scalars().first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = create_access_token(subject=user.id, role=user.role)
    return Token(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get authenticated user profile."""
    return UserResponse.model_validate(current_user)


@router.post("/anonymize-me")
async def anonymize_current_user(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Digital Personal Data Protection (DPDP) Act 2023 Section 12:
    Right to Erasure & Patient Data Anonymization.
    Permanently scrubs user identity, email, and phone from active databases
    while retaining an irreversible cryptographic pseudonym hash.
    """
    import hashlib
    pseudo_hash = hashlib.sha256(current_user.id.encode()).hexdigest()[:12]
    current_user.full_name = f"DPDP_Anonymized_Patient_{pseudo_hash}"
    current_user.email = f"anonymized_{pseudo_hash}@curaveris.vault"
    current_user.encrypted_phone = None

    await db.commit()
    await db.refresh(current_user)

    return {
        "status": "ANONYMIZED",
        "user_id": current_user.id,
        "pseudonym": current_user.full_name,
        "statutory_compliance": "Digital Personal Data Protection Act 2023 Section 12 (Right to Erasure)",
        "message": "Personal identifiers permanently purged and replaced with a cryptographic pseudonym."
    }

