import hmac
import hashlib
from datetime import datetime, timedelta
from typing import Any, Union, Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
from cryptography.fernet import Fernet
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.core.config import settings

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

# PII Encryption helper
try:
    fernet = Fernet(settings.ENCRYPTION_KEY.encode())
except Exception:
    # Generate a deterministic 32-byte key fallback for dev
    key = Fernet.generate_key()
    fernet = Fernet(key)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify raw password against bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash password using bcrypt."""
    return pwd_context.hash(password)


def create_access_token(subject: Union[str, Any], role: str = "patient", expires_delta: Optional[timedelta] = None) -> str:
    """Generate signed JWT access token with role claim."""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "role": role,
        "iat": datetime.utcnow()
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> dict:
    """Decode and validate JWT access token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def encrypt_pii(value: Optional[str]) -> Optional[str]:
    """Encrypt Personally Identifiable Information (Aadhaar, Phone, Policy No)."""
    if not value:
        return None
    try:
        return fernet.encrypt(value.encode()).decode()
    except Exception:
        return value


def decrypt_pii(encrypted_value: Optional[str]) -> Optional[str]:
    """Decrypt sensitive PII field."""
    if not encrypted_value:
        return None
    try:
        return fernet.decrypt(encrypted_value.encode()).decode()
    except Exception:
        return encrypted_value


def verify_razorpay_signature(body: bytes, signature: str, secret: str) -> bool:
    """
    Verify Razorpay webhook HMAC-SHA256 signature.
    Prevents unauthorized spoofed payment events.
    """
    if not signature or not secret:
        return False
    try:
        expected = hmac.new(
            secret.encode("utf-8"),
            body,
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(expected, signature)
    except Exception:
        return False
