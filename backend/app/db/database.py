import os
import re
import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import create_engine, text
from app.core.config import settings

logger = logging.getLogger("curaveris.db")


def _normalize_async_url(url: str) -> str:
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgresql://") and not url.startswith("postgresql+asyncpg://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif url.startswith("sqlite://") and not url.startswith("sqlite+aiosqlite://"):
        url = url.replace("sqlite://", "sqlite+aiosqlite://", 1)

    if "sslmode=" in url:
        url = url.replace("sslmode=", "ssl=")
    if "channel_binding=" in url:
        url = re.sub(r"&?channel_binding=[^&]*", "", url)
        if url.endswith("?") or url.endswith("&"):
            url = url[:-1]
    return url


def _normalize_sync_url(url: str) -> str:
    if url.startswith("postgresql+asyncpg://"):
        url = url.replace("postgresql+asyncpg://", "postgresql://", 1)
    elif url.startswith("sqlite+aiosqlite://"):
        url = url.replace("sqlite+aiosqlite://", "sqlite://", 1)
    return url


def _get_active_urls():
    if os.environ.get("ENV") == "testing" or settings.ENV == "testing":
        test_url = os.environ.get("DATABASE_URL") or settings.FALLBACK_DATABASE_URL
        test_sync = os.environ.get("SYNC_DATABASE_URL") or settings.FALLBACK_SYNC_DATABASE_URL
        return _normalize_async_url(test_url), _normalize_sync_url(test_sync)
    db_url = os.environ.get("DATABASE_URL") or settings.DATABASE_URL
    sync_url = os.environ.get("SYNC_DATABASE_URL") or settings.SYNC_DATABASE_URL
    return _normalize_async_url(db_url), _normalize_sync_url(sync_url)


def _build_engines(url: str, sync_url: str):
    is_sqlite = "sqlite" in url
    a_connect_args: dict = {"check_same_thread": False} if is_sqlite else {}
    s_connect_args: dict = {"check_same_thread": False} if is_sqlite else {"connect_timeout": 10}

    if is_sqlite:
        a_eng = create_async_engine(url, echo=False, connect_args=a_connect_args)
    else:
        a_eng = create_async_engine(
            url,
            echo=False,
            pool_pre_ping=True,       # Verify connection before use — prevents 'connection is closed' on stale Neon connections
            pool_recycle=300,         # Recycle connections after 5 min — matches Neon's idle timeout
            pool_size=5,
            max_overflow=10,
            connect_args=a_connect_args,
        )
    s_eng = create_engine(
        sync_url,
        echo=False,
        pool_pre_ping=True,
        pool_recycle=300,
        connect_args=s_connect_args
    )
    a_session = async_sessionmaker(bind=a_eng, class_=AsyncSession, expire_on_commit=False)
    s_session = sessionmaker(autocommit=False, autoflush=False, bind=s_eng)
    return a_eng, s_eng, a_session, s_session


_primary_url, _primary_sync_url = _get_active_urls()
engine, sync_engine, AsyncSessionLocal, SyncSessionLocal = _build_engines(_primary_url, _primary_sync_url)
Base = declarative_base()
_db_initialized = False


async def get_db():
    """Dependency for obtaining async DB session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


def get_sync_db():
    """Helper for sync context."""
    db = SyncSessionLocal()
    try:
        yield db
    finally:
        db.close()


async def init_db(force: bool = False):
    """
    Initializes database tables.
    Attempts primary connection; falls back cleanly if unreachable.
    """
    global engine, sync_engine, AsyncSessionLocal, SyncSessionLocal, _db_initialized
    if _db_initialized and not force:
        return

    curr_url, curr_sync_url = _get_active_urls()

    if "sqlite" in curr_url:
        engine, sync_engine, AsyncSessionLocal, SyncSessionLocal = _build_engines(curr_url, curr_sync_url)
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        _db_initialized = True
        logger.info(f"SQLite database initialized: {curr_url}")
        return

    try:
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1;"))
            if settings.ENV in {"production", "staging"}:
                await conn.execute(text("SELECT version_num FROM alembic_version LIMIT 1;"))
            else:
                await conn.run_sync(Base.metadata.create_all)
        _db_initialized = True
        logger.info("Database connection and schema state validated on primary PostgreSQL engine.")
    except Exception as exc:
        if settings.ENV in {"production", "staging"}:
            logger.error("Production database initialization failed; refusing SQLite fallback.")
            raise
        logger.warning(f"Primary PostgreSQL connection failed ({exc}). Switching to fallback local database: {settings.FALLBACK_DATABASE_URL}")
        engine, sync_engine, AsyncSessionLocal, SyncSessionLocal = _build_engines(
            settings.FALLBACK_DATABASE_URL, settings.FALLBACK_SYNC_DATABASE_URL
        )
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        _db_initialized = True
        logger.info("Database initialized successfully on fallback local database.")
