from typing import List, Union
from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True,
    )

    APP_ENV: str = "development"
    APP_SECRET_KEY: str = "default_dev_secret_key_change_in_production_32b"
    APP_DEBUG: bool = False
    APP_ALLOWED_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://your-vercel-app.vercel.app",
    ]

    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/curaveris"
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20

    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"

    JWT_SECRET_KEY: str = "default_jwt_secret_key_change_in_production_32b"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    STORAGE_BACKEND: str = "s3"
    AWS_ACCESS_KEY_ID: str = "dev_r2_access_key"
    AWS_SECRET_ACCESS_KEY: str = "dev_r2_secret_key"
    AWS_S3_BUCKET_NAME: str = "curaveris-bills"
    AWS_S3_REGION: str = "auto"
    AWS_S3_ENDPOINT_URL: str = "https://example.r2.cloudflarestorage.com"

    RESEND_API_KEY: str = "re_dev_placeholder"
    EMAIL_FROM_ADDRESS: str = "noreply@curaveris.in"

    EVIDENCE_HMAC_SECRET: str = "default_hmac_secret_key_change_in_production_32b"
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
        if self.APP_ENV == "production":
            if self.APP_DEBUG:
                raise ValueError("APP_DEBUG must be False in production environment.")
            if "localhost" in self.DATABASE_URL or "127.0.0.1" in self.DATABASE_URL:
                raise ValueError("DATABASE_URL cannot point to localhost in production environment.")
        return self


settings = Settings()
