import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from app.main import app

FORBIDDEN_INTERNAL_FIELDS = [
    "internal_id",
    "internal_curator_notes",
    "raw_db_row_id",
    "master_curation_metadata",
    "pii_cleartext",
    "curator_email",
    "curator_id",
    "secret_debug_flags",
    "admin_secret_key",
    "raw_sql_query",
]

def scan_for_forbidden_fields(obj, path=""):
    leaks = []
    if isinstance(obj, dict):
        for k, v in obj.items():
            current_path = f"{path}.{k}" if path else k
            if k.lower() in [f.lower() for f in FORBIDDEN_INTERNAL_FIELDS]:
                leaks.append(f"Forbidden field '{k}' found at '{current_path}'")
            leaks.extend(scan_for_forbidden_fields(v, current_path))
    elif isinstance(obj, list):
        for idx, item in enumerate(obj):
            leaks.extend(scan_for_forbidden_fields(item, f"{path}[{idx}]"))
    return leaks

@pytest.mark.asyncio
async def test_public_benchmark_endpoint_never_leaks_curation_fields():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/bills/benchmark-check", json={"item_name": "Paracetamol"})
        assert response.status_code == 200
        data = response.json()

        leaks = scan_for_forbidden_fields(data)
        assert len(leaks) == 0, f"Internal curation fields leaked in benchmark-check: {leaks}"

@pytest.mark.asyncio
async def test_health_endpoints_never_leak_internal_credentials_or_curation_metadata():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        for ep in ["/health", "/health/live", "/health/ready"]:
            response = await ac.get(ep)
            assert response.status_code == 200
            data = response.json()
            leaks = scan_for_forbidden_fields(data)
            assert len(leaks) == 0, f"Internal curation fields leaked in {ep}: {leaks}"

@pytest.mark.asyncio
async def test_bills_recent_never_leaks_internal_curator_fields():
    unique_email = f"curation_tester_{uuid.uuid4().hex[:6]}@curaveris.health"
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        reg_res = await ac.post(
            "/api/v1/auth/register",
            json={
                "email": unique_email,
                "password": "SecurePassword123!",
                "full_name": "Curation Tester",
                "role": "PATIENT",
            },
        )
        assert reg_res.status_code in [200, 201]

        token = reg_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        response = await ac.get("/api/v1/bills/recent", headers=headers)
        assert response.status_code == 200
        data = response.json()
        leaks = scan_for_forbidden_fields(data)
        assert len(leaks) == 0, f"Internal curation fields leaked in /api/v1/bills/recent: {leaks}"
