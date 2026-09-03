import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

@pytest.mark.asyncio
async def test_register_missing_consent(client: AsyncClient):
    response = await client.post("/api/v1/auth/register", json={
        "email": "test_consent@example.com",
        "phone_number": "9876543210",
        "password": "TestPass@123",
        "full_name": "Test User",
        "dpdp_consent": False,
    })
    assert response.status_code in [400, 422]

@pytest.mark.asyncio
async def test_register_invalid_email(client: AsyncClient):
    response = await client.post("/api/v1/auth/register", json={
        "email": "not-an-email",
        "phone_number": "9876543210",
        "password": "TestPass@123",
        "full_name": "Test User",
        "dpdp_consent": True,
    })
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_login_wrong_credentials(client: AsyncClient):
    response = await client.post("/api/v1/auth/login", json={
        "email_or_phone": "nobody@example.com",
        "password": "wrongpassword",
    })
    assert response.status_code == 401
