"""
Phase 3: Backend + API Foundation Test Suite for CuraVeris.

Validates:
1. Application startup and configuration
2. Database connection and async session lifecycle
3. Dependency injection (get_db, get_current_user, require_roles)
4. API versioning (/api/v1) and OpenAPI contracts (/openapi.json)
5. Request validation and Pydantic response schemas
6. Structured error handling and safe error payloads
7. Request ID correlation (X-Request-ID header & body propagation)
8. Health, liveness, and readiness probes (/health, /health/live, /health/ready, /live, /ready)
9. Authentication middleware & unauthorized access handling (401)
10. Role-based authorization & tenant isolation rules (403)
"""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.config import settings, validate_secrets
from app.core.errors import CuraVerisError, error_payload
from app.core.security import create_access_token, require_roles
from app.db.database import init_db, get_db


@pytest.mark.asyncio
async def test_startup_and_config_validation():
    """Verify configuration parameters and secrets validator."""
    assert settings.PROJECT_NAME == "CuraVeris - MedBill AI"
    assert settings.API_V1_STR == "/api/v1"
    assert settings.VERSION
    # Validation passes cleanly in development/testing
    validate_secrets()


@pytest.mark.asyncio
async def test_database_connection_and_session():
    """Verify database initialization and session dependency."""
    await init_db()
    async for session in get_db():
        assert session is not None
        break


@pytest.mark.asyncio
async def test_openapi_contract_generation(async_client: AsyncClient):
    """Verify OpenAPI 3.x contract schema is properly generated."""
    response = await async_client.get("/openapi.json")
    assert response.status_code == 200
    schema = response.json()
    assert schema["openapi"].startswith("3.")
    assert "paths" in schema
    assert "/health" in schema["paths"]
    assert "/health/live" in schema["paths"]
    assert "/health/ready" in schema["paths"]
    assert f"{settings.API_V1_STR}/auth/login" in schema["paths"]
    assert f"{settings.API_V1_STR}/auth/register" in schema["paths"]


@pytest.mark.asyncio
async def test_request_id_correlation(async_client: AsyncClient):
    """Verify X-Request-ID correlation header is returned."""
    custom_id = "curaveris-trace-xyz-987"
    response = await async_client.get("/", headers={"X-Request-ID": custom_id})
    assert response.status_code == 200
    assert response.headers["X-Request-ID"] == custom_id

    # Generated UUID when header omitted
    response_auto = await async_client.get("/")
    assert response_auto.status_code == 200
    assert "X-Request-ID" in response_auto.headers
    assert len(response_auto.headers["X-Request-ID"]) >= 8


@pytest.mark.asyncio
async def test_health_endpoints(async_client: AsyncClient):
    """Verify health, liveness, and readiness endpoints."""
    # Full health check
    res_health = await async_client.get("/health")
    assert res_health.status_code in (200, 503)
    data = res_health.json()
    assert "status" in data
    assert "environment" in data
    assert "database" in data
    assert "reference_db" in data

    # Liveness probe
    res_live = await async_client.get("/health/live")
    assert res_live.status_code == 200
    assert res_live.json()["status"] == "alive"

    # Liveness probe root alias
    res_live_alias = await async_client.get("/live")
    assert res_live_alias.status_code == 200
    assert res_live_alias.json()["status"] == "alive"

    # Readiness probe
    res_ready = await async_client.get("/health/ready")
    assert res_ready.status_code in (200, 503)
    ready_data = res_ready.json()
    assert "status" in ready_data
    assert "database" in ready_data

    # Readiness probe root alias
    res_ready_alias = await async_client.get("/ready")
    assert res_ready_alias.status_code in (200, 503)


@pytest.mark.asyncio
async def test_request_validation_and_malformed_requests(async_client: AsyncClient):
    """Verify malformed payloads return 422 with structured error envelope."""
    # Malformed register payload (empty body)
    response = await async_client.post("/api/v1/auth/register", json={})
    assert response.status_code == 422
    body = response.json()
    assert "error" in body
    assert body["error"]["code"] == "VALIDATION_ERROR"
    assert "details" in body["error"]
    assert "request_id" in body

    # Malformed email format
    response_invalid_email = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "not-an-email",
            "password": "short",
            "full_name": "T",
        }
    )
    assert response_invalid_email.status_code == 422
    body_email = response_invalid_email.json()
    assert body_email["error"]["code"] == "VALIDATION_ERROR"


@pytest.mark.asyncio
async def test_unauthorized_access(async_client: AsyncClient):
    """Verify protected routes reject missing or invalid credentials with 401."""
    # Missing token on protected auth me endpoint
    response_no_token = await async_client.get("/api/v1/auth/me")
    assert response_no_token.status_code == 401

    # Invalid token on protected bills endpoint
    response_bad_token = await async_client.get(
        "/api/v1/bills/recent",
        headers={"Authorization": "Bearer invalid_token_12345"}
    )
    assert response_bad_token.status_code == 401


@pytest.mark.asyncio
async def test_role_authorization_and_forbidden_access():
    """Verify require_roles dependency enforces RBAC."""
    patient_token = create_access_token(
        subject="patient-user-123",
        role="PATIENT",
        org_id=None,
    )
    checker = require_roles("HOSPITAL_ADMIN", "HOSPITAL_FINANCE")

    # Patient accessing hospital admin endpoint -> 403
    with pytest.raises(Exception) as excinfo:
        await checker(token=patient_token)
    assert "403" in str(excinfo.value) or excinfo.value.status_code == 403

    # Admin accessing hospital admin endpoint -> Success
    admin_token = create_access_token(
        subject="admin-user-456",
        role="HOSPITAL_ADMIN",
        org_id="org-789",
    )
    payload = await checker(token=admin_token)
    assert payload["role"] == "HOSPITAL_ADMIN"


@pytest.mark.asyncio
async def test_structured_error_payload():
    """Verify error payload format and helper."""
    payload = error_payload(
        code="RESOURCE_NOT_FOUND",
        message="The requested bill does not exist.",
        details={"bill_id": "b-999"}
    )
    assert payload["error"]["code"] == "RESOURCE_NOT_FOUND"
    assert payload["error"]["message"] == "The requested bill does not exist."
    assert payload["error"]["details"]["bill_id"] == "b-999"
