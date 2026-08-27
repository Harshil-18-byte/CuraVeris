import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from starlette.middleware.base import BaseHTTPMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.config import settings, validate_secrets
from app.core.logging import setup_logging, logger
from app.core.limiter import limiter
from app.db.database import init_db
from app.db.reference_data import init_reference_db
from app.api import auth, bills, chat, insurance, razorpay, reports, dev, abha, integrations, finance


# Setup structured logging immediately
setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup & Shutdown lifecycle events."""
    # 1. Validate secrets — hard fail in production/staging with insecure defaults
    validate_secrets()

    logger.info("Initializing CuraVeris Backend...")

    # 2. Initialize PostgreSQL schema
    await init_db()

    # 3. Populate statutory reference rates (CGHS, NPPA, DPCO, IRDAI)
    init_reference_db()

    if settings.ENV != "testing":
        # 4. Initialize ChromaDB statutory vector collections
        try:
            from app.db.chroma_client import init_chroma_collections
            init_chroma_collections()
        except Exception as exc:
            logger.warning(f"ChromaDB startup init deferred: {exc}")

        # 5. Load or train ML risk classification model
        model_path = os.path.join(os.path.dirname(__file__), "ml", "weights", "risk_model.joblib")
        if not os.path.exists(model_path):
            logger.info("ML model weights not found. Training now (this takes ~30s)...")
            try:
                from app.ml.train_risk_model import train_and_evaluate
                train_and_evaluate(num_samples=1500)
                from app.engine.risk_engine import risk_engine
                risk_engine._load_model()
            except Exception as e:
                logger.warning(f"Initial model training deferred: {e}")
        else:
            logger.info(f"Loaded existing trained model from {model_path}")

    logger.info("CuraVeris Backend ready.")
    yield
    logger.info("Shutting down CuraVeris Backend.")


# ---------------------------------------------------------------------------
# Security Headers Middleware
# Implements the OWASP recommended baseline headers.
# ---------------------------------------------------------------------------
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        # Prevent MIME-type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        # Deny embedding in iframes (clickjacking defense)
        response.headers["X-Frame-Options"] = "DENY"
        # Limit referrer information leakage
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        # Legacy XSS filter (supported in older IE/Edge — harmless on modern browsers)
        response.headers["X-XSS-Protection"] = "1; mode=block"
        # HSTS: force HTTPS for 1 year; include subdomains
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains"
        )
        # CSP: restrictive default — tighten further once frontend origins are known
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data:; "
            "connect-src 'self'; "
            "frame-ancestors 'none'; "
            "base-uri 'self'; "
            "form-action 'self'"
        )
        # Disable access to sensitive browser APIs from this origin
        response.headers["Permissions-Policy"] = (
            "geolocation=(), microphone=(), camera=(), "
            "payment=(), usb=(), magnetometer=(), gyroscope=()"
        )
        return response


# ---------------------------------------------------------------------------
# OpenAPI Tags Metadata
# ---------------------------------------------------------------------------
tags_metadata = [
    {
        "name": "Authentication & Access Control",
        "description": "User registration, multi-tenant RBAC, JWT access/refresh token rotation, and DPDP Act 2023 Section 12 Right-to-Erasure compliance.",
    },
    {
        "name": "Bills & Audits",
        "description": "Multi-modal medical bill ingestion (PDF/Images/OCR), deterministic statutory audits (NPPA, DPCO, CGHS, IRDAI), and hybrid ML risk predictions.",
    },
    {
        "name": "Reports & Disputes",
        "description": "Generation of legally-binding dispute letters, Insurance Ombudsman petitions, and High Court anti-detention emergency notices.",
    },
    {
        "name": "Insurance & TPA Reconciliation",
        "description": "TPA claim reimbursement gap reconciliation, policy coverage analysis, and non-payable item dispute tracking.",
    },
    {
        "name": "Razorpay Payments & Webhooks",
        "description": "Payment gateway webhook signature verification, co-pay shortfall processing, and hospital balance reconciliation.",
    },
    {
        "name": "Hospital Finance & Revenue Recovery",
        "description": "Hospital ledger analytics, multi-currency conversions, financial hardship distress indices (DSTI), and revenue leakage audit.",
    },
    {
        "name": "ABHA & ABDM Digital Health Records",
        "description": "Ayushman Bharat Digital Mission (ABDM) integration, ABHA ID verification, and PM-JAY zero-cash package validation.",
    },
    {
        "name": "Third-Party Integrations",
        "description": "External hospital information system (HIS) hooks, electronic medical record (EMR) integrations, and partner endpoints.",
    },
    {
        "name": "AI Chat",
        "description": "Conversational AI patient advocacy assistant providing contextual statutory guidance and bill dispute explanations.",
    },
    {
        "name": "Developer ML Observability",
        "description": "Model telemetry, SHAP explainability inspectors, benchmark dataset generation, and continuous training observability.",
    },
]


# ---------------------------------------------------------------------------
# Application factory
# ---------------------------------------------------------------------------
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    openapi_tags=tags_metadata,
    contact={
        "name": "CuraVeris Engineering Team",
        "url": settings.REPOSITORY_URL,
        "email": "support@curaveris.internal",
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
    lifespan=lifespan,
    # Disable Swagger/ReDoc in production to reduce attack surface
    docs_url="/docs" if settings.ENV == "development" else None,
    redoc_url="/redoc" if settings.ENV == "development" else None,
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security headers (applied to every response)
app.add_middleware(SecurityHeadersMiddleware)

# CORS — use explicit origin list; never use wildcard with allow_credentials=True.
# A wildcard + credentials combination is rejected by all modern browsers per the CORS spec.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)

# Mount API routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(bills.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(insurance.router, prefix=settings.API_V1_STR)
app.include_router(razorpay.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(dev.router, prefix=settings.API_V1_STR)
app.include_router(abha.router, prefix=settings.API_V1_STR)
app.include_router(integrations.router, prefix=settings.API_V1_STR)
app.include_router(finance.router, prefix=settings.API_V1_STR)


@app.get("/dev", include_in_schema=False)
async def dev_portal():
    """Redirect to developer model observability dashboard."""
    return RedirectResponse(url="/api/v1/dev/dashboard")


@app.get("/")
async def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "active",
        "environment": settings.ENV,
    }


@app.get("/health")
async def health_check():
    """
    Liveness and readiness probe.
    Performs a real SELECT 1 against the database rather than returning a
    hardcoded True. Returns HTTP 503 if the database is unreachable.
    """
    from app.db.database import AsyncSessionLocal
    from sqlalchemy import text

    db_status = False
    db_error = None
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
        db_status = True
    except Exception as exc:
        db_error = str(exc)
        logger.error(f"Health check DB ping failed: {exc}")

    reference_db_exists = os.path.exists(settings.REFERENCE_DB_PATH)

    payload = {
        "status": "healthy" if db_status else "degraded",
        "environment": settings.ENV,
        "database": db_status,
        "reference_db": reference_db_exists,
    }
    if db_error:
        payload["database_error"] = db_error

    status_code = 200 if db_status else 503
    return JSONResponse(content=payload, status_code=status_code)
