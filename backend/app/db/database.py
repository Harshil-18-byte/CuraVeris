import os
import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import create_engine, text
from app.core.config import settings

logger = logging.getLogger("curaveris.db")


def _get_active_urls():
    db_url = os.environ.get("DATABASE_URL") or settings.DATABASE_URL
    sync_url = os.environ.get("SYNC_DATABASE_URL") or settings.SYNC_DATABASE_URL
    return db_url, sync_url


def _build_engines(url: str, sync_url: str):
    is_sqlite = "sqlite" in url
    a_connect_args = {"check_same_thread": False} if is_sqlite else {"timeout": 2}
    s_connect_args = {"check_same_thread": False} if is_sqlite else {"connect_timeout": 2}
    a_eng = create_async_engine(
        url,
        echo=False,
        connect_args=a_connect_args
    )
    s_eng = create_engine(
        sync_url,
        echo=False,
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
            await conn.run_sync(Base.metadata.create_all)
        _db_initialized = True
        logger.info("Database initialized on primary PostgreSQL engine.")
    except Exception as exc:
        logger.warning(f"Primary PostgreSQL connection failed ({exc}). Switching to fallback local database: {settings.FALLBACK_DATABASE_URL}")
        engine, sync_engine, AsyncSessionLocal, SyncSessionLocal = _build_engines(
            settings.FALLBACK_DATABASE_URL, settings.FALLBACK_SYNC_DATABASE_URL
        )
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        _db_initialized = True
        logger.info("Database initialized successfully on fallback local database.")
