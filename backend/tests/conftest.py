import os
import sys
import pytest
import pytest_asyncio

# Ensure tests use isolated local test database and testing environment
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test_curaveris.db"
os.environ["SYNC_DATABASE_URL"] = "sqlite:///./test_curaveris.db"
os.environ["ENV"] = "testing"

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db.database import init_db
from app.db.reference_data import init_reference_db


@pytest.fixture(scope="session", autouse=True)
def setup_test_environment():
    """Session-level setup of statutory reference rates."""
    init_reference_db()
    yield


@pytest_asyncio.fixture(scope="session", autouse=True)
async def auto_init_db():
    """Ensure database schema is created once per test session."""
    await init_db(force=True)
    yield


@pytest_asyncio.fixture
async def async_client():
    """Async test client for FastAPI."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client
