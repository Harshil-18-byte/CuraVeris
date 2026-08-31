import os
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from sqlalchemy import text
import re
from app.core.config import settings

# Construct async database engine
# Environment variable takes explicit precedence over defaults
db_url = os.environ.get("DATABASE_URL") or settings.DATABASE_URL
if db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
elif db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)


# Convert sslmode=... to ssl=... and strip channel_binding for asyncpg compatibility
if "sslmode=" in db_url:
    db_url = db_url.replace("sslmode=", "ssl=")
if "channel_binding=" in db_url:
    db_url = re.sub(r"&?channel_binding=[^&]*", "", db_url)
    if db_url.endswith("?") or db_url.endswith("&"):
        db_url = db_url[:-1]

engine_kwargs = {
    "echo": settings.APP_DEBUG,
    "future": True,
}
if "sqlite" not in db_url:
    engine_kwargs["pool_size"] = settings.DATABASE_POOL_SIZE
    engine_kwargs["max_overflow"] = settings.DATABASE_MAX_OVERFLOW

async_engine = create_async_engine(
    db_url,
    **engine_kwargs,
)

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

Base = declarative_base()


async def init_db():
    """Create tables if they do not exist."""
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency injection generator for FastAPI endpoints."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def check_db_health() -> bool:
    """Executes a lightweight query to verify database connectivity."""
    try:
        async with async_engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            return result.scalar() == 1
    except Exception:
        return False
