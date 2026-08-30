import secrets
import hashlib
import hmac
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, Tuple
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import HTTPException, status
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)


def password_hash(plain: str) -> str:
    """Hash password using bcrypt cost 12."""
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """Verify password against bcrypt hash."""
    return pwd_context.verify(plain, hashed)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Generate an HS256 signed JWT access token."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "exp": int(expire.timestamp()),
        "iat": int(now.timestamp()),
        "jti": str(uuid.uuid4()),
    })
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token() -> Tuple[str, str]:
    """Generate 64 random hex bytes raw refresh token and its bcrypt hash."""
    raw_token = secrets.token_hex(64)
    hashed_token = pwd_context.hash(raw_token)
    return raw_token, hashed_token


def verify_access_token(token: str) -> Dict[str, Any]:
    """Decode and validate access token signature and expiration."""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials or token expired",
            headers={"WWW-Authenticate": "Bearer"},
        )


def generate_otp() -> Tuple[str, str]:
    """Generate 6-digit numeric OTP and its bcrypt hash."""
    otp = f"{secrets.randbelow(900000) + 100000}"
    hashed_otp = pwd_context.hash(otp)
    return otp, hashed_otp


def verify_otp(plain: str, hashed: str) -> bool:
    """Verify 6-digit OTP against bcrypt hash."""
    return pwd_context.verify(plain, hashed)


def compute_sha256(data: bytes) -> str:
    """Compute SHA-256 hex digest of byte data."""
    return hashlib.sha256(data).hexdigest()


def compute_hmac(data: str, secret: str) -> str:
    """Compute HMAC-SHA256 hex digest."""
    return hmac.new(
        secret.encode("utf-8"),
        data.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
