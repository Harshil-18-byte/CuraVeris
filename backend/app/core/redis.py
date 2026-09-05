from typing import Optional
import redis.asyncio as aioredis
from app.core.config import settings

# Initialize Redis client with SSL awareness and socket timeout
redis_client = aioredis.from_url(
    settings.REDIS_URL,
    encoding="utf-8",
    decode_responses=True,
    socket_connect_timeout=1.0,
    socket_timeout=1.0,
    ssl_cert_reqs=None if settings.REDIS_URL.startswith("rediss://") else None,
)


async def get_redis() -> aioredis.Redis:
    """Dependency / accessor for async Redis client."""
    return redis_client


async def check_redis_health() -> bool:
    """Pings Redis to ensure cache and queue connectivity."""
    try:
        res = await redis_client.ping()
        return res is True or res == "PONG"
    except Exception:
        return False


async def set_with_ttl(key: str, value: str, ttl_seconds: int) -> bool:
    """Store key with expiry."""
    try:
        return await redis_client.set(key, value, ex=ttl_seconds)
    except Exception:
        return False


async def get_value(key: str) -> Optional[str]:
    """Retrieve string value for a key."""
    try:
        return await redis_client.get(key)
    except Exception:
        return None


async def delete_key(key: str) -> bool:
    """Delete a key."""
    try:
        return bool(await redis_client.delete(key))
    except Exception:
        return False


async def publish(channel: str, message: str) -> int:
    """Publish a message to a Redis Pub/Sub channel."""
    try:
        return await redis_client.publish(channel, message)
    except Exception:
        return 0
