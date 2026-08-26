import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field
from cryptography.fernet import Fernet


class Settings(BaseSettings):
    PROJECT_NAME: str = "CuraVeris - MedBill AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment
    ENV: str = Field(default="development", env="ENV")
    DEBUG: bool = Field(default=True, env="DEBUG")
    
    # Database (PostgreSQL default with seamless fallback)
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
    
    # Security & Auth
    SECRET_KEY: str = Field(
        default="curaveris-hackathon-super-secret-jwt-key-change-in-prod-2026",
        env="SECRET_KEY"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # PII Encryption Key (32 url-safe base64-encoded bytes)
    ENCRYPTION_KEY: str = Field(
        default="4Z1f8PqR6v9K2s7X5m3W0y8T1n4L6q2V9x8Z1f8PqR4=",
        env="ENCRYPTION_KEY"
    )
    
    # Razorpay Integration
    RAZORPAY_KEY_ID: str = Field(default="rzp_test_mock_curaveris", env="RAZORPAY_KEY_ID")
    RAZORPAY_KEY_SECRET: str = Field(default="mock_secret_curaveris_2026", env="RAZORPAY_KEY_SECRET")
    RAZORPAY_WEBHOOK_SECRET: str = Field(default="webhook_secret_curaveris_2026", env="RAZORPAY_WEBHOOK_SECRET")
    
    # Optional Cloud LLMs
    ANTHROPIC_API_KEY: str = Field(default="", env="ANTHROPIC_API_KEY")
    GEMINI_API_KEY: str = Field(default="", env="GEMINI_API_KEY")
    OPENAI_API_KEY: str = Field(default="", env="OPENAI_API_KEY")
    
    # CORS
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

# Ensure model weights dir exists
os.makedirs(settings.MODEL_WEIGHTS_DIR, exist_ok=True)
os.makedirs(os.path.dirname(settings.REFERENCE_DB_PATH) or ".", exist_ok=True)
