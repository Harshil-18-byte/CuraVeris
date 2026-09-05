import time
import uuid
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.database import check_db_health
from app.core.redis import check_redis_health
from app.api.v1.router import api_router

logging.basicConfig(level=logging.INFO if not settings.APP_DEBUG else logging.DEBUG)
logger = logging.getLogger("curaveris")

# Optional Sentry initialization
if settings.SENTRY_DSN and (settings.SENTRY_DSN.startswith("http://") or settings.SENTRY_DSN.startswith("https://")):
    try:
        import sentry_sdk
        from sentry_sdk.integrations.fastapi import FastApiIntegration
        sentry_sdk.init(
            dsn=settings.SENTRY_DSN,
            integrations=[FastApiIntegration()],
            traces_sample_rate=0.2,
        )
    except Exception as e:
        logger.warning(f"Sentry init failed: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup verification
    logger.info("Initializing CuraVeris Production API v1.0.0...")
    db_ok = await check_db_health()
    redis_ok = await check_redis_health()
    logger.info(f"Database Connected: {db_ok} | Redis Connected: {redis_ok}")
    yield
    logger.info("Shutting down CuraVeris API...")


app = FastAPI(
    title="CuraVeris API",
    description="Automated Indian Medical Billing Audit & Section 65B Cryptographic Evidence Engine",
    version="1.0.0",
    docs_url="/docs" if settings.APP_ENV != "production" else None,
    redoc_url="/redoc" if settings.APP_ENV != "production" else None,
    lifespan=lifespan,
)

# CORS MUST BE FIRST — before every other middleware
origins_list = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "https://*.vercel.app",
    "https://curaveris.vercel.app",
]
if isinstance(settings.APP_ALLOWED_ORIGINS, list):
    origins_list.extend(settings.APP_ALLOWED_ORIGINS)
elif isinstance(settings.APP_ALLOWED_ORIGINS, str) and settings.APP_ALLOWED_ORIGINS:
    origins_list.append(settings.APP_ALLOWED_ORIGINS)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=[
        "Accept",
        "Accept-Language",
        "Content-Language",
        "Content-Type",
        "Authorization",
        "X-Request-ID",
        "X-Requested-With",
    ],
    expose_headers=["X-Request-ID"],
    max_age=600,
)

# Prometheus metrics instrumentator
try:
    from prometheus_fastapi_instrumentator import Instrumentator
    Instrumentator().instrument(app).expose(app)
except Exception:
    pass


# Middleware 1: Request ID & Timing & Security Headers
@app.middleware("http")
async def request_pipeline_middleware(request: Request, call_next):
    req_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    request.state.request_id = req_id
    start_time = time.perf_counter()

    try:
        response: Response = await call_next(request)
    except Exception as exc:
        duration_ms = (time.perf_counter() - start_time) * 1000
        logger.error(f"[{req_id}] Unhandled Exception ({duration_ms:.2f}ms): {exc}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": {
                    "code": "INTERNAL_ERROR",
                    "message": "An unexpected error occurred.",
                    "request_id": req_id,
                }
            },
            headers={"X-Request-ID": req_id},
        )

    duration_ms = (time.perf_counter() - start_time) * 1000
    response.headers["X-Request-ID"] = req_id
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["X-Response-Time"] = f"{duration_ms:.2f}ms"

    return response


from fastapi.exceptions import RequestValidationError


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    req_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Validation failed for request parameters.",
                "details": exc.errors(),
            },
            "request_id": req_id,
        },
        headers={"X-Request-ID": req_id},
    )


# Mount API routers
app.include_router(api_router, prefix="/api/v1")


@app.get("/", tags=["System"])
async def root_endpoint(request: Request):
    """Root entrypoint returning basic service descriptor."""
    return {
        "message": "CuraVeris Production API",
        "status": "ok",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health", tags=["System"])
async def health_check():
    """System health check endpoint."""
    db_ok = await check_db_health()
    return {
        "status": "ok",
        "environment": settings.APP_ENV,
        "database": db_ok,
        "reference_db": True,
        "version": "1.0.0",
    }


@app.get("/health/live", tags=["System"])
@app.get("/live", tags=["System"])
async def liveness_probe():
    """Liveness probe returning alive status."""
    return {"status": "alive", "version": "1.0.0"}


@app.get("/readiness", tags=["System"])
@app.get("/health/ready", tags=["System"])
@app.get("/ready", tags=["System"])
async def readiness_probe():
    """Readiness probe checking database and redis connectivity."""
    db_healthy = await check_db_health()
    redis_healthy = await check_redis_health()
    return {
        "status": "ready" if (db_healthy or settings.APP_ENV in ("development", "testing")) else "degraded",
        "database": db_healthy,
        "redis": redis_healthy,
        "version": "1.0.0",
    }


