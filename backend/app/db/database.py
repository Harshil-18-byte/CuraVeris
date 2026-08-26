import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import create_engine, text
from app.core.config import settings

logger = logging.getLogger("curaveris.db")

# Primary and Fallback engines
_primary_url = settings.DATABASE_URL
_primary_sync_url = settings.SYNC_DATABASE_URL
_fallback_url = settings.FALLBACK_DATABASE_URL
_fallback_sync_url = settings.FALLBACK_SYNC_DATABASE_URL

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

engine, sync_engine, AsyncSessionLocal, SyncSessionLocal = _build_engines(_primary_url, _primary_sync_url)
Base = declarative_base()


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


async def init_db():
    """
    Initializes database tables.
    Attempts primary PostgreSQL database connection first.
    If PostgreSQL is unreachable or authentication fails, seamlessly uses fallback engine.
    """
    global engine, sync_engine, AsyncSessionLocal, SyncSessionLocal

    try:
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1;"))
            await conn.run_sync(Base.metadata.create_all)
        logger.info(f"Database initialized successfully on primary engine: {_primary_url.split('@')[-1] if '@' in _primary_url else _primary_url}")
    except Exception as exc:
        logger.warning(f"Primary database connection failed ({exc}). Switching to fallback local database: {_fallback_url}")
        engine, sync_engine, AsyncSessionLocal, SyncSessionLocal = _build_engines(_fallback_url, _fallback_sync_url)
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database initialized successfully on fallback local database.")

