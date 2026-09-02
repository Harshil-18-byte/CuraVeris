import sys
import os

# Automatically resolve and inject backend root directory into sys.path
_backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if _backend_root not in sys.path:
    sys.path.insert(0, _backend_root)

# Set test environment flags
os.environ["ENV"] = "testing"
os.environ["APP_ENV"] = "testing"
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test_curaveris_suite.db"
os.environ["SYNC_DATABASE_URL"] = "sqlite:///./test_curaveris_suite.db"

import pytest
import pytest_asyncio
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import NullPool

from app.core.database import Base as CoreBase, get_db as core_get_db
from app.db.database import Base as DbBase, get_db as db_get_db
from app.core.config import settings

# Import models so all tables are defined on their respective Base
try:
    import app.models  # Core models
except Exception:
    pass

try:
    import app.db.models  # DB domain models
except Exception:
    pass

try:
    from httpx import AsyncClient, ASGITransport
    from app.main import app
except ImportError:
    AsyncClient = None
    ASGITransport = None
    app = None

TEST_DB_URL = "sqlite+aiosqlite:///./test_curaveris_suite.db"

test_engine = create_async_engine(
    TEST_DB_URL,
    echo=False,
    poolclass=NullPool,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


@pytest_asyncio.fixture(scope="session", autouse=True)
async def prepare_database():
    async with test_engine.begin() as conn:
        try:
            await conn.run_sync(CoreBase.metadata.create_all)
        except Exception:
            pass
        try:
            await conn.run_sync(DbBase.metadata.create_all)
        except Exception:
            pass
    yield
    async with test_engine.begin() as conn:
        try:
            await conn.run_sync(CoreBase.metadata.drop_all)
        except Exception:
            pass
        try:
            await conn.run_sync(DbBase.metadata.drop_all)
        except Exception:
            pass
    if os.path.exists("./test_curaveris_suite.db"):
        try:
            os.remove("./test_curaveris_suite.db")
        except Exception:
            pass


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with TestingSessionLocal() as session:
        yield session


@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator:
    if AsyncClient is None or app is None:
        yield None
        return

    async def override_get_db():
        yield db_session

    app.dependency_overrides[core_get_db] = override_get_db
    app.dependency_overrides[db_get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def async_client(client: AsyncGenerator) -> AsyncGenerator:
    yield client
