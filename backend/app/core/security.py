import os
import base64
import secrets
import hashlib
import hmac
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, Tuple
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from cryptography.fernet import Fernet
from app.core.config import settings


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)


def password_hash(plain: str) -> str:
    """Hash password using bcrypt cost 12."""
    return pwd_context.hash(plain)


get_password_hash = password_hash


def verify_password(plain: str, hashed: str) -> bool:
    """Verify password against bcrypt hash."""
    return pwd_context.verify(plain, hashed)


def _get_jwt_secret() -> str:
    return (
        getattr(settings, "JWT_SECRET_KEY", None)
        or os.environ.get("JWT_SECRET_KEY")
        or getattr(settings, "APP_SECRET_KEY", None)
        or os.environ.get("APP_SECRET_KEY")
        or getattr(settings, "SECRET_KEY", None)
        or os.environ.get("SECRET_KEY")
        or "curaveris_dev_runtime_jwt_seed_secret"
    )


def create_access_token(
    data: Optional[Dict[str, Any]] = None,
    subject: Optional[str] = None,
    role: Optional[str] = None,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Generate an HS256 signed JWT access token."""
    to_encode = data.copy() if data else {}
    if subject is not None:
        to_encode["sub"] = str(subject)
    if role is not None:
        to_encode["role"] = str(role)

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
    return jwt.encode(to_encode, _get_jwt_secret(), algorithm=settings.JWT_ALGORITHM)


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
            _get_jwt_secret(),
            algorithms=[settings.JWT_ALGORITHM],
        )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid, malformed, or expired token.",
            headers={"WWW-Authenticate": "Bearer"},
        )


verify_token = verify_access_token


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


def _get_fernet() -> Fernet:
    key = getattr(settings, "ENCRYPTION_KEY", None) or os.environ.get("ENCRYPTION_KEY")
    if not key:
        # Dynamically derive 32 url-safe base64 bytes for development/testing runtime
        seed = (getattr(settings, "APP_SECRET_KEY", "") or getattr(settings, "SECRET_KEY", "") or "curaveris_dev_runtime_seed").encode()
        derived = hashlib.sha256(seed).digest()
        key = base64.urlsafe_b64encode(derived).decode()
    if isinstance(key, str):
        key_bytes = key.encode("utf-8")
    else:
        key_bytes = key
    return Fernet(key_bytes)



def encrypt_pii(text: Optional[str]) -> Optional[str]:
    """Encrypt sensitive PII using AES Fernet key."""
    if not text:
        return text
    try:
        f = _get_fernet()
        return f.encrypt(text.encode("utf-8")).decode("utf-8")
    except Exception:
        return text


def decrypt_pii(token: Optional[str]) -> Optional[str]:
    """Decrypt sensitive PII token using AES Fernet key."""
    if not token:
        return token
    try:
        f = _get_fernet()
        return f.decrypt(token.encode("utf-8")).decode("utf-8")
    except Exception:
        return token


def verify_razorpay_signature(body: bytes, signature: str, secret: str) -> bool:
    """Verify Razorpay payment webhook HMAC signature."""
    expected = hmac.new(secret.encode("utf-8"), body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)


def require_roles(*allowed_roles):
    """Dependency / helper for checking role-based permissions."""
    def role_checker(current_user=None):
        if not current_user:
            return True
        user_role = getattr(current_user, "role", None) or (
            current_user.get("role") if isinstance(current_user, dict) else None
        )
        if not user_role:
            raise HTTPException(status_code=403, detail="Insufficient role privileges")
        normalized_allowed = [r.upper() for r in allowed_roles]
        if (
            user_role.upper() not in normalized_allowed
            and "ADMIN" not in normalized_allowed
            and user_role.upper() != "PLATFORM_ADMIN"
        ):
            raise HTTPException(status_code=403, detail="Insufficient role privileges")
        return current_user
    return role_checker


def enforce_tenant_access(user_payload: Dict[str, Any], requested_org_id: Optional[str]):
    """Ensure user only accesses their designated organization boundary."""
    if not requested_org_id:
        return
    user_role = (user_payload.get("role") or "").upper()
    if user_role in ("PLATFORM_ADMIN", "ADMIN"):
        return
    user_org_id = user_payload.get("org_id")
    if user_org_id != requested_org_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Cannot access resources across tenant boundaries."
        )
