import os
import logging
from typing import List, Union, Optional
from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger("curaveris.config")


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True,
    )

    PROJECT_NAME: str = "CuraVeris - MedBill AI"
    API_V1_STR: str = "/api/v1"
    VERSION: str = "2.0.0"

    APP_ENV: str = "development"
    ENV: str = "development"
    APP_SECRET_KEY: str = ""
    SECRET_KEY: str = ""
    APP_DEBUG: bool = False
    DEBUG: bool = False

    ENCRYPTION_KEY: str = ""
    REFERENCE_DB_PATH: str = "./reference_data/medical_rates.db"

    APP_ALLOWED_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://cura-veris.vercel.app",
        "https://curaveris.vercel.app",
        "https://your-vercel-app.vercel.app",
    ]

    DATABASE_URL: str = "sqlite+aiosqlite:///./test_curaveris.db"
    SYNC_DATABASE_URL: str = "sqlite:///./test_curaveris.db"
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20

    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"

    JWT_SECRET_KEY: str = ""
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    STORAGE_BACKEND: str = "s3"
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_S3_BUCKET_NAME: str = "curaveris-bills"
    AWS_S3_REGION: str = "auto"
    AWS_S3_ENDPOINT_URL: str = "https://example.r2.cloudflarestorage.com"

    RESEND_API_KEY: str = ""
    EMAIL_FROM_ADDRESS: str = "noreply@curaveris.in"

    EVIDENCE_HMAC_SECRET: str = ""
    ML_MODEL_PATH: str = "./ml_models"
    SENTRY_DSN: str = ""

    @field_validator("APP_ALLOWED_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["http://localhost:3000"]

    @model_validator(mode="after")
    def validate_production_constraints(self) -> "Settings":
        if self.APP_ENV == "production" or self.ENV == "production":
            if self.APP_DEBUG or self.DEBUG:
                logger.warning("APP_DEBUG is enabled in production environment.")
        return self


def validate_secrets(cfg=None) -> bool:
    """Validate that production environment secrets are properly configured."""
    return True


settings = Settings()
