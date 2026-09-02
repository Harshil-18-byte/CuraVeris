import asyncio
import logging
from sqlalchemy import text
from app.core.database import async_engine, Base

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("migration")

MIGRATION_SQL = """
ALTER TABLE users ADD COLUMN IF NOT EXISTS org_id VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS hashed_password VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'PATIENT';
ALTER TABLE users ADD COLUMN IF NOT EXISTS encrypted_phone VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_secret VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS dpdp_consent_given BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS dpdp_consent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
"""

async def run():
    logger.info("Connecting to database and applying missing columns & tables...")
    async with async_engine.begin() as conn:
        # Create all declared tables if not existing
        await conn.run_sync(Base.metadata.create_all)
        
        # Apply missing columns to existing tables safely
        for statement in MIGRATION_SQL.strip().split(";"):
            stmt = statement.strip()
            if stmt:
                try:
                    await conn.execute(text(stmt))
                    logger.info(f"Executed: {stmt[:50]}...")
                except Exception as e:
                    logger.warning(f"Error on '{stmt[:50]}': {e}")
                    
    logger.info("Database migration completed successfully!")

if __name__ == "__main__":
    asyncio.run(run())
