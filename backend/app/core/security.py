import hmac
import hashlib
import time
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Any, Union, Optional
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

# ---------------------------------------------------------------------------
# PII Encryption — Fernet (AES-128-CBC + HMAC-SHA256 in one package).
# Fernet keys must be 32 url-safe base64-encoded bytes.
# Raises hard ValueError at startup if the key is invalid, preventing silent
# fallback to a random key that would make all existing ciphertext unreadable.
# ---------------------------------------------------------------------------
try:
    fernet = Fernet(settings.ENCRYPTION_KEY.encode())
except (ValueError, Exception) as _fernet_err:
    raise RuntimeError(
        f"ENCRYPTION_KEY is invalid or malformed: {_fernet_err}. "
        "Generate a valid key with: python -c \"from cryptography.fernet import Fernet; "
        "print(Fernet.generate_key().decode())\""
    ) from _fernet_err


# ---------------------------------------------------------------------------
# Failed-login brute-force tracking (in-memory per-process).
# Production deployments should move this to Redis for cross-process consistency.
# ---------------------------------------------------------------------------
_FAILED_ATTEMPTS: dict = defaultdict(lambda: {"count": 0, "locked_until": 0.0})
_MAX_ATTEMPTS = 5          # lockout after 5 consecutive wrong passwords
_LOCKOUT_SECONDS = 300     # 5-minute lockout window


def record_failed_login(identifier: str) -> None:
    """Increment the failed-attempt counter for an email / IP identifier."""
    entry = _FAILED_ATTEMPTS[identifier]
    entry["count"] += 1
    if entry["count"] >= _MAX_ATTEMPTS:
        entry["locked_until"] = time.time() + _LOCKOUT_SECONDS
        logger.warning(
            f"Account locked for {_LOCKOUT_SECONDS}s after {_MAX_ATTEMPTS} "
            f"failed login attempts: {identifier}"
        )


def clear_failed_login(identifier: str) -> None:
    """Reset the counter after a successful authentication."""
    _FAILED_ATTEMPTS.pop(identifier, None)


def check_login_locked(identifier: str) -> None:
    """
    Raise HTTP 429 if the identifier is currently within a lockout window.
    Call this before password verification on every login attempt.
    """
    entry = _FAILED_ATTEMPTS.get(identifier)
    if entry and entry["locked_until"] > time.time():
        remaining = int(entry["locked_until"] - time.time())
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Account temporarily locked after repeated failed attempts. "
                   f"Try again in {remaining} seconds.",
            headers={"Retry-After": str(remaining)},
        )


# ---------------------------------------------------------------------------
# Password helpers
# ---------------------------------------------------------------------------

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify raw password against bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash password using bcrypt (cost factor 12)."""
    return pwd_context.hash(password)


# ---------------------------------------------------------------------------
# JWT — access and refresh tokens
# ---------------------------------------------------------------------------

def create_access_token(
    subject: Union[str, Any],
    role: str = "patient",
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Generate signed JWT access token. Subject must be the user UUID (not email)."""
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    payload = {
        "exp": expire,
        "sub": str(subject),  # always user UUID — never email
        "role": role,
        "iat": datetime.utcnow(),
        "type": "access",
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(subject: Union[str, Any]) -> str:
    """Generate a longer-lived refresh token for silent re-authentication."""
    expire = datetime.utcnow() + timedelta(
        minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES
    )
    payload = {
        "exp": expire,
        "sub": str(subject),
        "iat": datetime.utcnow(),
        "type": "refresh",
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def verify_token(token: str, expected_type: str = "access") -> dict:
    """
    Decode and validate a JWT token.
    Raises HTTP 401 on any decode failure, expiry, or type mismatch.
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        if payload.get("type") != expected_type:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token type: expected '{expected_type}'",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return payload
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


# ---------------------------------------------------------------------------
# PII helpers
# ---------------------------------------------------------------------------

def encrypt_pii(value: Optional[str]) -> Optional[str]:
    """Encrypt a PII field using Fernet (AES-128-CBC + HMAC-SHA256)."""
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
        logger.error("PII decryption failed — ciphertext is invalid or key has rotated.")
        return None
    except Exception as exc:
        logger.error(f"PII decryption error: {exc}")
        return None


# ---------------------------------------------------------------------------
# Razorpay webhook signature verification
# ---------------------------------------------------------------------------

def verify_razorpay_signature(body: bytes, signature: str, secret: str) -> bool:
    """
    Verify Razorpay webhook HMAC-SHA256 signature.
    Prevents unauthorized spoofed payment events.
    Uses constant-time comparison to prevent timing attacks.
    """
    if not signature or not secret:
        return False
    try:
        expected = hmac.new(
            secret.encode("utf-8"),
            body,
            hashlib.sha256,
        ).hexdigest()
        return hmac.compare_digest(expected, signature)
    except Exception as exc:
        logger.error(f"Razorpay signature verification error: {exc}")
        return False
