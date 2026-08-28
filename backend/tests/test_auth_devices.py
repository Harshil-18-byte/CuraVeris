import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_public_registration_cannot_self_assign_privileged_role(async_client: AsyncClient):
    response = await async_client.post("/api/v1/auth/register", json={
        "email": "privileged@example.test", "password": "SecurePassword123", "full_name": "Test User", "role": "PLATFORM_ADMIN"
    })
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_authenticated_user_can_register_and_revoke_own_device(async_client: AsyncClient):
    register = await async_client.post("/api/v1/auth/register", json={
        "email": "device-owner@example.test", "password": "SecurePassword123", "full_name": "Device Owner"
    })
    token = register.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    device = await async_client.post("/api/v1/auth/devices", headers=headers, json={"installation_id": "install-phase4-0001", "platform": "WEB"})
    assert device.status_code == 201
    revoked = await async_client.delete(f"/api/v1/auth/devices/{device.json()['id']}", headers=headers)
    assert revoked.status_code == 204


@pytest.mark.asyncio
async def test_phone_verification_never_claims_unconfigured_delivery(async_client: AsyncClient):
    response = await async_client.get("/api/v1/auth/phone-verification/capability")
    assert response.status_code == 200
    assert response.json()["status"] == "UNAVAILABLE"
