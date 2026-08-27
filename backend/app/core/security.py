"""
Security, Cryptographic Key Management, RBAC, and Token Engine for CuraVeris.

Enforces:
1. Multi-Tenant Role-Based Access Control (RBAC) with least privilege.
2. Constant-time signature verifications for Webhooks and JWT.
3. AES-128-CBC + HMAC-SHA256 (Fernet) field-level encryption for sensitive PII (ABHA, Name, Phone).
4. Bcrypt password hashing with brute-force rate-limiting lockout.
"""
import uuid
import hmac
import hashlib
import time
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Any, Union, Optional, List, Callable
from jose import jwt, JWTError
from passlib.context import CryptContext
from cryptography.fernet import Fernet, InvalidToken
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from app.core.config import settings
from app.core.logging import logger

# Password hashing — bcrypt cost factor 12
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

# PII Encryption — Fernet (AES-128-CBC + HMAC-SHA256)
try:
    fernet = Fernet(settings.ENCRYPTION_KEY.encode())
except (ValueError, Exception) as _fernet_err:
    raise RuntimeError(
        f"ENCRYPTION_KEY is invalid or malformed: {_fernet_err}. "
        "Generate a valid key with: python -c \"from cryptography.fernet import Fernet; "
        "print(Fernet.generate_key().decode())\""
    ) from _fernet_err


# ---------------------------------------------------------------------------
# Failed-login brute-force tracking (in-memory with 5-minute lockout)
# ---------------------------------------------------------------------------
_FAILED_ATTEMPTS: dict = defaultdict(lambda: {"count": 0, "locked_until": 0.0})
_MAX_ATTEMPTS = 5
_LOCKOUT_SECONDS = 300


def record_failed_login(identifier: str) -> None:
    """Increment the failed-attempt counter for an identifier."""
    entry = _FAILED_ATTEMPTS[identifier]
    entry["count"] += 1
    if entry["count"] >= _MAX_ATTEMPTS:
        entry["locked_until"] = time.time() + _LOCKOUT_SECONDS
        logger.warning(f"Account locked for {_LOCKOUT_SECONDS}s after {_MAX_ATTEMPTS} failed logins: {identifier}")


def clear_failed_login(identifier: str) -> None:
    """Reset the counter after a successful authentication."""
    _FAILED_ATTEMPTS.pop(identifier, None)


def check_login_locked(identifier: str) -> None:
    """Raise HTTP 429 if the identifier is within a lockout window."""
    entry = _FAILED_ATTEMPTS.get(identifier)
    if entry and entry["locked_until"] > time.time():
        remaining = int(entry["locked_until"] - time.time())
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Account temporarily locked after repeated failed attempts. Try again in {remaining} seconds.",
            headers={"Retry-After": str(remaining)},
        )


# ---------------------------------------------------------------------------
# Password helpers
# ---------------------------------------------------------------------------

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify raw password against bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash password using bcrypt."""
    return pwd_context.hash(password)


def hash_token(token: str) -> str:
    """Compute SHA-256 digest of a token for secure database indexing/storage."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


# ---------------------------------------------------------------------------
# JWT — Access and Refresh Tokens
# ---------------------------------------------------------------------------

def create_access_token(
    subject: Union[str, Any],
    role: str = "PATIENT",
    org_id: Optional[str] = None,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Generate signed JWT access token. Subject is always the user UUID."""
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    payload = {
        "exp": expire,
        "sub": str(subject),
        "role": role.upper(),
        "org_id": org_id,
        "iat": now,
        "jti": str(uuid.uuid4()),
        "type": "access",
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(
    subject: Union[str, Any],
    org_id: Optional[str] = None,
    expires_delta: Optional[timedelta] = None
) -> str:
    """Generate a longer-lived refresh token for silent re-authentication."""
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES))
    payload = {
        "exp": expire,
        "sub": str(subject),
        "org_id": org_id,
        "iat": now,
        "jti": str(uuid.uuid4()),
        "type": "refresh",
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def verify_token(token: str, expected_type: str = "access") -> dict:
    """Decode and validate a JWT token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != expected_type:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token type: expected '{expected_type}'",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return dict(payload)
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


# ---------------------------------------------------------------------------
# RBAC & Multi-Tenancy Authorization
# ---------------------------------------------------------------------------

ALL_ROLES = [
    "PATIENT",
    "HOSPITAL_ADMIN",
    "HOSPITAL_FINANCE",
    "HOSPITAL_BILLING",
    "HOSPITAL_AUDITOR",
    "TPA_REVIEWER",
    "TPA_ADMIN",
    "INSURER_REVIEWER",
    "INSURER_ADMIN",
    "PLATFORM_ADMIN"
]


def require_roles(*allowed_roles: str) -> Callable:
    """
    Dependency factory to enforce Role-Based Access Control on endpoints.
    Example: Depends(require_roles("HOSPITAL_ADMIN", "HOSPITAL_FINANCE", "PLATFORM_ADMIN"))
    """
    normalized_allowed = {r.upper() for r in allowed_roles}

    async def role_checker(token: str = Depends(oauth2_scheme)) -> dict:
        payload = verify_token(token, expected_type="access")
        user_role = (payload.get("role") or "").upper()
        if "PLATFORM_ADMIN" not in normalized_allowed and user_role == "PLATFORM_ADMIN":
            # Platform Admin always has superuser override
            return payload
        if user_role not in normalized_allowed:
            logger.warning(f"Forbidden access: user with role '{user_role}' attempted accessing {normalized_allowed}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires one of {list(normalized_allowed)}"
            )
        return payload

    return role_checker


def enforce_tenant_access(user_payload: dict, target_org_id: Optional[str]) -> None:
    """
    Enforces tenant isolation.
    PLATFORM_ADMIN can view all organizations.
    Other roles can only query resources with matching org_id.
    """
    user_role = (user_payload.get("role") or "").upper()
    if user_role == "PLATFORM_ADMIN":
        return
    user_org_id = user_payload.get("org_id")
    if target_org_id and user_org_id != target_org_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cross-tenant access forbidden. You cannot access resources from another organization."
        )


# ---------------------------------------------------------------------------
# PII helpers
# ---------------------------------------------------------------------------

def encrypt_pii(value: Optional[str]) -> Optional[str]:
    """Encrypt a PII field using Fernet."""
    if not value:
        return None
    try:
        return fernet.encrypt(value.encode()).decode()
    except Exception as exc:
        logger.error(f"PII encryption failed: {exc}")
        raise RuntimeError("PII encryption failed — refusing to store plaintext.") from exc


def decrypt_pii(encrypted_value: Optional[str]) -> Optional[str]:
    """Decrypt a Fernet-encrypted PII field. Returns None if decryption fails."""
    if not encrypted_value:
        return None
    try:
        return fernet.decrypt(encrypted_value.encode()).decode()
    except InvalidToken:
        logger.error("PII decryption failed — invalid token.")
        return None
    except Exception as exc:
        logger.error(f"PII decryption error: {exc}")
        return None


# ---------------------------------------------------------------------------
# Razorpay Webhook Verification
# ---------------------------------------------------------------------------

def verify_razorpay_signature(body: bytes, signature: str, secret: str) -> bool:
    """Verify Razorpay webhook HMAC-SHA256 signature."""
    if not signature or not secret:
        return False
    try:
        expected = hmac.new(secret.encode("utf-8"), body, hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected, signature)
    except Exception as exc:
        logger.error(f"Razorpay HMAC verification failed: {exc}")
        return False
