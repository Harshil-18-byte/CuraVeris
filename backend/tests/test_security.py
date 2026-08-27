import hmac
import hashlib
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    verify_token,
    encrypt_pii,
    decrypt_pii,
    verify_razorpay_signature
)


def test_password_hashing():
    pw = "superSecret123!"
    hashed = get_password_hash(pw)
    assert hashed != pw
    assert verify_password(pw, hashed) is True
    assert verify_password("wrongPass", hashed) is False


def test_jwt_token():
    token = create_access_token(subject="user_123", role="patient")
    assert isinstance(token, str)
    payload = verify_token(token)
    assert payload["sub"] == "user_123"
    assert payload["role"].lower() == "patient"


def test_pii_encryption():
    aadhaar = "9876-5432-1098"
    encrypted = encrypt_pii(aadhaar)
    assert encrypted != aadhaar
    decrypted = decrypt_pii(encrypted)
    assert decrypted == aadhaar


def test_razorpay_hmac_verification():
    secret = "test_webhook_secret_123"
    body = b'{"event": "payment.captured", "amount": 50000}'
    
    # Compute valid signature
    valid_sig = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    
    assert verify_razorpay_signature(body, valid_sig, secret) is True
    assert verify_razorpay_signature(body, "invalid_sig_abc", secret) is False
