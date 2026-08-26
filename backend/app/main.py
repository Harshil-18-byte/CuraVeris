import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.logging import setup_logging, logger
from app.db.database import init_db
from app.db.reference_data import init_reference_db
from app.api import auth, bills, chat, insurance, razorpay, reports, dev, abha, integrations
from fastapi.responses import RedirectResponse

# Setup structured logging
setup_logging()

# Rate limiting
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup & Shutdown lifecycle events."""
    logger.info("Initializing CuraVeris (MedBill AI) Backend...")
    # 1. Initialize SQLite Database
    await init_db()
    # 2. Populate Reference Regulations (CGHS, NPPA, DPCO, IRDAI)
    init_reference_db()
    # 3. Verify / train ML risk classification model
    model_path = os.path.join(os.path.dirname(__file__), "ml", "weights", "risk_model.joblib")
    if not os.path.exists(model_path):
        logger.info("ML risk classification weights not found. Training model now...")
        try:
            from app.ml.train_risk_model import train_and_evaluate
            train_and_evaluate(num_samples=1500)
            from app.engine.risk_engine import risk_engine
            risk_engine._load_model()
        except Exception as e:
            logger.warning(f"Initial model training deferred: {e}")
    else:
        logger.info(f"Loaded existing trained model from {model_path}")
        
    logger.info("CuraVeris Backend ready to audit bills and protect patients.")
    yield
    logger.info("Shutting down CuraVeris Backend.")


# Security Headers Middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        return response


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Hospital Bill Analyzer and Statutory Regulatory Enforcement Engine for India.",
    lifespan=lifespan
)

# Rate limiting state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Middlewares
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for hackathon flexibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(bills.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(insurance.router, prefix=settings.API_V1_STR)
app.include_router(razorpay.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(dev.router, prefix=settings.API_V1_STR)
app.include_router(abha.router, prefix=settings.API_V1_STR)
app.include_router(integrations.router, prefix=settings.API_V1_STR)


@app.get("/dev")
async def dev_portal():
    """Direct route to developer model observability dashboard."""
    return RedirectResponse(url="/api/v1/dev/dashboard")


@app.get("/")
async def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "active",
        "description": "India's payment-aware, regulation-enforcing, AI-powered hospital bill audit platform."
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "environment": settings.ENV,
        "reference_db": os.path.exists(settings.REFERENCE_DB_PATH),
        "database": True
    }
