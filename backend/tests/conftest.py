import pytest
import os
import sys

# Ensure tests use isolated local test database and don't block on network
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test_curaveris.db"
os.environ["SYNC_DATABASE_URL"] = "sqlite:///./test_curaveris.db"
os.environ["ENV"] = "testing"

from httpx import AsyncClient, ASGITransport

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.db.database import init_db
from app.db.reference_data import init_reference_db

import pytest_asyncio

@pytest.fixture(scope="session", autouse=True)
def setup_test_environment():
    # Initialize references
    init_reference_db()
    yield


@pytest_asyncio.fixture(autouse=True)
async def auto_init_db():
    """Ensure database tables exist before any test runs."""
    await init_db()
    yield


@pytest_asyncio.fixture
async def async_client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

