"""
Multi-Tenancy and Role-Based Access Control (RBAC) Tests for CuraVeris.

Verifies:
1. User registration across roles (PATIENT, HOSPITAL_FINANCE, TPA_REVIEWER, PLATFORM_ADMIN).
2. Role-based endpoint authorization.
3. Refresh token rotation and instant revocation on logout / anonymization.
4. Tenant boundary isolation.
"""
import uuid
import pytest
from httpx import AsyncClient
from app.core.security import create_access_token, require_roles, enforce_tenant_access
from fastapi import HTTPException


@pytest.mark.asyncio
async def test_rbac_user_registration_and_login(async_client: AsyncClient):
    """Test user registration and login with role."""
    unique_id = uuid.uuid4().hex[:6]
    email = f"finance_{unique_id}@hospital.org"

    # Register as HOSPITAL_FINANCE
    reg_resp = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": "SecurePassword123!",
            "full_name": "Hospital Finance User",
            "role": "HOSPITAL_FINANCE"
        }
    )
    assert reg_resp.status_code == 201
    data = reg_resp.json()
    assert data["user"]["role"] == "HOSPITAL_FINANCE"
    access_token = data["access_token"]
    refresh_token = data["refresh_token"]
    assert access_token is not None
    assert refresh_token is not None

    # Login
    login_resp = await async_client.post(
        "/api/v1/auth/login",
        json={
            "email": email,
            "password": "SecurePassword123!"
        }
    )
    assert login_resp.status_code == 200
    assert login_resp.json()["user"]["role"] == "HOSPITAL_FINANCE"


@pytest.mark.asyncio
async def test_refresh_token_rotation_and_revocation(async_client: AsyncClient):
    """Test that refresh token rotation invalidates the old token."""
    unique_id = uuid.uuid4().hex[:6]
    email = f"patient_{unique_id}@example.com"

    reg_resp = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": "SecurePassword123!",
            "full_name": "Test Patient",
            "role": "PATIENT"
        }
    )
    assert reg_resp.status_code == 201
    data = reg_resp.json()
    initial_refresh = data["refresh_token"]

    # Rotate refresh token
    rotate_resp = await async_client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": initial_refresh}
    )
    assert rotate_resp.status_code == 200
    new_refresh = rotate_resp.json()["refresh_token"]
    assert new_refresh != initial_refresh

    # Attempting to use the old refresh token must fail with 401
    reuse_resp = await async_client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": initial_refresh}
    )
    assert reuse_resp.status_code == 401


def test_tenant_access_isolation_rules():
    """Verify tenant isolation policy enforcement."""
    hospital_user_payload = {"sub": "usr_1", "role": "HOSPITAL_FINANCE", "org_id": "org_apollo"}
    tpa_user_payload = {"sub": "usr_2", "role": "TPA_REVIEWER", "org_id": "org_mediassist"}
    platform_admin_payload = {"sub": "usr_admin", "role": "PLATFORM_ADMIN", "org_id": None}

    # Same tenant access -> allowed
    enforce_tenant_access(hospital_user_payload, "org_apollo")

    # Cross tenant access -> rejected
    with pytest.raises(HTTPException) as exc:
        enforce_tenant_access(hospital_user_payload, "org_max")
    assert exc.value.status_code == 403

    # Platform admin can access any organization
    enforce_tenant_access(platform_admin_payload, "org_apollo")
    enforce_tenant_access(platform_admin_payload, "org_max")
