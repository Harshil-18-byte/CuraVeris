"""
Centralized Credentials, API Keys, and Secrets Manager for CuraVeris.

Organizes all external service keys, cryptographic secrets, database URLs,
and integration tokens into structured, validated domains.
"""
import os
from typing import Optional, List
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings


# ---------------------------------------------------------------------------
# Domain-Specific Credential Schemas
# ---------------------------------------------------------------------------

class SecurityCredentials(BaseModel):
    """Cryptographic keys, JWT signing parameters, and token lifetimes."""
    secret_key: str = Field(
        default="curaveris-dev-only-secret-key-replace-before-any-deployment-2026",
        description="HMAC-SHA256 signing secret for stateless JWT tokens."
    )
    encryption_key: str = Field(
        default="QMtBT1JbfKzD_rGs4_GWvCF16hCvXADnr1I4yhiYZrw=",
        description="Fernet (AES-128-CBC + HMAC-SHA256) 32 url-safe base64 bytes for PII fields."
    )
    algorithm: str = Field(default="HS256", description="JWT signing algorithm.")
    access_token_expire_minutes: int = Field(default=60 * 24, description="Access token lifetime in minutes (24h).")
    refresh_token_expire_minutes: int = Field(default=60 * 24 * 7, description="Refresh token lifetime in minutes (7d).")


class DatabaseCredentials(BaseModel):
    """PostgreSQL production connection strings and SQLite fallback configurations."""
    database_url: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/curaveris",
        description="Async PostgreSQL connection URI."
    )
    sync_database_url: str = Field(
        default="postgresql://postgres:postgres@localhost:5432/curaveris",
        description="Synchronous PostgreSQL connection URI."
    )
    fallback_database_url: str = Field(
        default="sqlite+aiosqlite:///./curaveris.db",
        description="Async SQLite fallback connection URI for local development."
    )
    fallback_sync_database_url: str = Field(
        default="sqlite:///./curaveris.db",
        description="Sync SQLite fallback connection URI."
    )
    reference_db_path: str = Field(
        default="./reference_data/medical_rates.db",
        description="Path to read-only SQLite database containing CGHS, NPPA, and DPCO statutory rates."
    )


class PaymentCredentials(BaseModel):
    """Razorpay payment gateway API keys and webhook signing secret."""
    key_id: str = Field(
        default="rzp_test_mock_curaveris",
        description="Razorpay public Key ID."
    )
    key_secret: str = Field(
        default="mock_secret_curaveris_2026",
        description="Razorpay private Key Secret."
    )
    webhook_secret: str = Field(
        default="webhook_secret_curaveris_2026",
        description="Razorpay HMAC-SHA256 webhook verification secret."
    )


class LLMCredentials(BaseModel):
    """Optional cloud LLM provider API keys for natural-language narrative generation."""
    gemini_api_key: str = Field(default="", description="Google Gemini API key.")
    openai_api_key: str = Field(default="", description="OpenAI GPT-4o API key.")
    anthropic_api_key: str = Field(default="", description="Anthropic Claude 3.5 Sonnet API key.")

    @property
    def has_any_llm(self) -> bool:
        """Return True if at least one cloud LLM API key is configured."""
        return bool(self.gemini_api_key or self.openai_api_key or self.anthropic_api_key)


class ABDMCredentials(BaseModel):
    """Ayushman Bharat Digital Mission (ABDM) & ABHA Health ID gateway credentials."""
    client_id: str = Field(default="", description="ABDM Sandbox Client ID.")
    client_secret: str = Field(default="", description="ABDM Sandbox Client Secret.")
    gateway_url: str = Field(
        default="https://dev.abdm.gov.in/gateway",
        description="National Health Authority ABDM gateway base URL."
    )


class IntegrationCredentials(BaseModel):
    """Third-party communication webhook verification tokens."""
    whatsapp_verify_token: str = Field(
        default="curaveris_whatsapp_verify_token_2026",
        description="Meta WhatsApp Cloud API Webhook handshake token."
    )
    whatsapp_api_token: str = Field(
        default="",
        description="Meta WhatsApp Graph API bearer token."
    )
    whatsapp_phone_number_id: str = Field(
        default="",
        description="Meta WhatsApp Business phone number ID."
    )


# ---------------------------------------------------------------------------
# Root App Credentials Settings Loader
# ---------------------------------------------------------------------------

class AppCredentials(BaseSettings):
    """
    Unified Application Credentials loaded from environment variables or .env file.
    """
    # Environment
    ENV: str = Field(default="development", env="ENV")
    DEBUG: bool = Field(default=True, env="DEBUG")

    # Security
    SECRET_KEY: str = Field(
        default="curaveris-dev-only-secret-key-replace-before-any-deployment-2026",
        env="SECRET_KEY"
    )
    ENCRYPTION_KEY: str = Field(
        default="Y3VyYXZlcmlzLWRldi1vbmx5LWtleS0zMmJ5dGVzLXBhZA==",
        env="ENCRYPTION_KEY"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    # Database
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

    # Razorpay
    RAZORPAY_KEY_ID: str = Field(default="rzp_test_mock_curaveris", env="RAZORPAY_KEY_ID")
    RAZORPAY_KEY_SECRET: str = Field(default="mock_secret_curaveris_2026", env="RAZORPAY_KEY_SECRET")
    RAZORPAY_WEBHOOK_SECRET: str = Field(default="webhook_secret_curaveris_2026", env="RAZORPAY_WEBHOOK_SECRET")

    # LLM Providers
    GEMINI_API_KEY: str = Field(default="", env="GEMINI_API_KEY")
    OPENAI_API_KEY: str = Field(default="", env="OPENAI_API_KEY")
    ANTHROPIC_API_KEY: str = Field(default="", env="ANTHROPIC_API_KEY")

    # ABDM
    ABDM_CLIENT_ID: str = Field(default="", env="ABDM_CLIENT_ID")
    ABDM_CLIENT_SECRET: str = Field(default="", env="ABDM_CLIENT_SECRET")
    ABDM_GATEWAY_URL: str = Field(default="https://dev.abdm.gov.in/gateway", env="ABDM_GATEWAY_URL")

    # WhatsApp Integration
    WHATSAPP_VERIFY_TOKEN: str = Field(default="curaveris_whatsapp_verify_token_2026", env="WHATSAPP_VERIFY_TOKEN")
    WHATSAPP_API_TOKEN: str = Field(default="", env="WHATSAPP_API_TOKEN")
    WHATSAPP_PHONE_NUMBER_ID: str = Field(default="", env="WHATSAPP_PHONE_NUMBER_ID")

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"

    @property
    def security(self) -> SecurityCredentials:
        return SecurityCredentials(
            secret_key=self.SECRET_KEY,
            encryption_key=self.ENCRYPTION_KEY,
            algorithm=self.ALGORITHM,
            access_token_expire_minutes=self.ACCESS_TOKEN_EXPIRE_MINUTES,
            refresh_token_expire_minutes=self.REFRESH_TOKEN_EXPIRE_MINUTES,
        )

    @property
    def database(self) -> DatabaseCredentials:
        return DatabaseCredentials(
            database_url=self.DATABASE_URL,
            sync_database_url=self.SYNC_DATABASE_URL,
            fallback_database_url=self.FALLBACK_DATABASE_URL,
            fallback_sync_database_url=self.FALLBACK_SYNC_DATABASE_URL,
            reference_db_path=self.REFERENCE_DB_PATH,
        )

    @property
    def payments(self) -> PaymentCredentials:
        return PaymentCredentials(
            key_id=self.RAZORPAY_KEY_ID,
            key_secret=self.RAZORPAY_KEY_SECRET,
            webhook_secret=self.RAZORPAY_WEBHOOK_SECRET,
        )

    @property
    def llm(self) -> LLMCredentials:
        return LLMCredentials(
            gemini_api_key=self.GEMINI_API_KEY,
            openai_api_key=self.OPENAI_API_KEY,
            anthropic_api_key=self.ANTHROPIC_API_KEY,
        )

    @property
    def abdm(self) -> ABDMCredentials:
        return ABDMCredentials(
            client_id=self.ABDM_CLIENT_ID,
            client_secret=self.ABDM_CLIENT_SECRET,
            gateway_url=self.ABDM_GATEWAY_URL,
        )

    @property
    def integrations(self) -> IntegrationCredentials:
        return IntegrationCredentials(
            whatsapp_verify_token=self.WHATSAPP_VERIFY_TOKEN,
            whatsapp_api_token=self.WHATSAPP_API_TOKEN,
            whatsapp_phone_number_id=self.WHATSAPP_PHONE_NUMBER_ID,
        )


# Global singleton instance
credentials = AppCredentials()
