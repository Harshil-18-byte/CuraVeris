from httpx import AsyncClient
import pytest


@pytest.mark.asyncio
async def test_request_correlation_id_is_returned(async_client: AsyncClient):
    response = await async_client.get("/", headers={"X-Request-ID": "phase1-test-123"})
    assert response.status_code == 200
    assert response.headers["X-Request-ID"] == "phase1-test-123"


@pytest.mark.asyncio
async def test_validation_errors_have_a_safe_standard_shape(async_client: AsyncClient):
    response = await async_client.post("/api/v1/auth/register", json={})
    assert response.status_code == 422
    body = response.json()
    assert body["error"]["code"] == "VALIDATION_ERROR"
    assert body["request_id"]
