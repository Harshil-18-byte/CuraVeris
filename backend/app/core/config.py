import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field

from app.core.credentials import credentials

# Sentinel values that signal the key was never set in the environment.
# Any value equal to these will trigger a startup failure in non-dev envs.
_UNSET_SECRET = ""
_DEV_SECRET_KEY = "curaveris-dev-only-secret-key-replace-before-any-deployment-2026"
_DEV_ENCRYPTION_KEY = "QMtBT1JbfKzD_rGs4_GWvCF16hCvXADnr1I4yhiYZrw="  # 32-byte url-safe base64 Fernet key



class Settings(BaseSettings):
    PROJECT_NAME: str = "CuraVeris - MedBill AI"
    VERSION: str = "1.2.0"
    API_V1_STR: str = "/api/v1"
    DESCRIPTION: str = (
        "Automated medical billing audit and patient financial advocacy engine for the Indian healthcare system. "
        "Consolidates raw invoice OCR parsing, deterministic statutory compliance checks (NPPA, DPCO, CGHS, IRDAI), "
        "hybrid machine learning risk ensembles (XGBoost + PyTorch MLP), and cryptographic Merkle audit ledgers "
        "for Section 65B court admissibility."
    )
    REPOSITORY_URL: str = "https://github.com/Harshil-18-byte/CuraVeris"
    APP_TAGS: List[str] = [
        "medical-billing",
        "healthcare-audit",
        "fintech",
        "nppa",
        "cghs",
        "dpco",
        "irdai",
        "dpdp-act",
        "fastapi",
        "xgboost",
        "pytorch",
        "merkle-tree"
    ]

    # Environment
    ENV: str = Field(default="development", env="ENV")
    DEBUG: bool = Field(default=True, env="DEBUG")

    # Database (PostgreSQL primary; SQLite fallback for dev-only)
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/curaveris",
        env="DATABASE_URL"
    )
    SYNC_DATABASE_URL: str = Field(
        default="postgresql://postgres:postgres@localhost:5432/curaveris",
        env="SYNC_DATABASE_URL"
    )
    FALLBACK_DATABASE_URL: str = "sqlite+aiosqlite:///./curaveris.db"
    FALLBACK_SYNC_DATABASE_URL: str = "sqlite:///./curaveris.db"
    REFERENCE_DB_PATH: str = Field(
        default="./reference_data/medical_rates.db",
        env="REFERENCE_DB_PATH"
    )
    CHROMA_PERSIST_DIRECTORY: str = Field(
        default="data/chroma_db",
        env="CHROMA_PERSIST_DIRECTORY"
    )

    # Security & Auth
    # In production / staging: must be set via environment variable to a strong random value.
    # Startup validation in validate_secrets() below will reject dev defaults outside of dev.
    SECRET_KEY: str = Field(default=_DEV_SECRET_KEY, env="SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # PII Encryption Key: valid Fernet key (32 url-safe base64-encoded bytes).
    # Generate with: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
    ENCRYPTION_KEY: str = Field(default=_DEV_ENCRYPTION_KEY, env="ENCRYPTION_KEY")

    # File Upload Limits
    MAX_UPLOAD_SIZE_MB: int = Field(default=20, env="MAX_UPLOAD_SIZE_MB")

    # Razorpay Integration
    RAZORPAY_KEY_ID: str = Field(default="rzp_test_mock_curaveris", env="RAZORPAY_KEY_ID")
    RAZORPAY_KEY_SECRET: str = Field(default="mock_secret_curaveris_2026", env="RAZORPAY_KEY_SECRET")
    RAZORPAY_WEBHOOK_SECRET: str = Field(default="webhook_secret_curaveris_2026", env="RAZORPAY_WEBHOOK_SECRET")

    # Hugging Face Model Hub & Embeddings
    HF_TOKEN: str = Field(default="", env="HF_TOKEN")
    HUGGINGFACE_API_KEY: str = Field(default="", env="HUGGINGFACE_API_KEY")
    HUGGINGFACE_HUB_TOKEN: str = Field(default="", env="HUGGINGFACE_HUB_TOKEN")

    # Optional Cloud LLMs
    ANTHROPIC_API_KEY: str = Field(default="", env="ANTHROPIC_API_KEY")
    GEMINI_API_KEY: str = Field(default="", env="GEMINI_API_KEY")
    OPENAI_API_KEY: str = Field(default="", env="OPENAI_API_KEY")

    # Supabase / Cloud Object Storage
    SUPABASE_URL: str = Field(default="", env="SUPABASE_URL")
    SUPABASE_ANON_KEY: str = Field(default="", env="SUPABASE_ANON_KEY")
    SUPABASE_SERVICE_ROLE_KEY: str = Field(default="", env="SUPABASE_SERVICE_ROLE_KEY")

    # AWS S3 Storage
    AWS_ACCESS_KEY_ID: str = Field(default="", env="AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY: str = Field(default="", env="AWS_SECRET_ACCESS_KEY")
    AWS_REGION: str = Field(default="ap-south-1", env="AWS_REGION")
    AWS_S3_BUCKET: str = Field(default="curaveris-bills", env="AWS_S3_BUCKET")

    # CORS: explicit list — wildcard is never appropriate with credentialed requests.
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    # Model Weights Path
    MODEL_WEIGHTS_DIR: str = "./app/ml/weights"

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"


settings = Settings()

# Automatically propagate Hugging Face tokens to environment for huggingface_hub/transformers
_hf_token = settings.HF_TOKEN or settings.HUGGINGFACE_API_KEY or settings.HUGGINGFACE_HUB_TOKEN
if _hf_token:
    os.environ.setdefault("HF_TOKEN", _hf_token)
    os.environ.setdefault("HUGGING_FACE_HUB_TOKEN", _hf_token)
    os.environ.setdefault("HUGGINGFACE_API_KEY", _hf_token)



def validate_secrets() -> None:
    """
    Fail hard at startup if running outside development with insecure defaults.
    Call this from main.py lifespan before accepting any traffic.
    """
    if settings.ENV in ("production", "staging"):
        errors = []
        if settings.SECRET_KEY in (_DEV_SECRET_KEY, _UNSET_SECRET):
            errors.append(
                "SECRET_KEY is set to the development default. "
                "Set a strong random value via the SECRET_KEY environment variable."
            )
        if settings.ENCRYPTION_KEY in (_DEV_ENCRYPTION_KEY, _UNSET_SECRET):
            errors.append(
                "ENCRYPTION_KEY is set to the development default. "
                "Generate a real Fernet key and set it via the ENCRYPTION_KEY environment variable."
            )
        if settings.RAZORPAY_KEY_SECRET.startswith("mock_") or settings.RAZORPAY_WEBHOOK_SECRET == "webhook_secret_curaveris_2026":
            errors.append("Razorpay credentials are development placeholders. Configure real environment-specific credentials.")
        if errors:
            raise RuntimeError(
                "Startup blocked: insecure configuration detected.\n"
                + "\n".join(f"  - {e}" for e in errors)
            )


# Ensure required directories exist
os.makedirs(settings.MODEL_WEIGHTS_DIR, exist_ok=True)
os.makedirs(os.path.dirname(settings.REFERENCE_DB_PATH) or ".", exist_ok=True)
