import base64
import json
from typing import Optional
from app.core.config import settings
from app.core.credentials import credentials
from app.core.logging import logger

_supabase_client = None
_supabase_admin = None


def _get_resolved_supabase_url() -> str:
    """Resolve Supabase URL from config or JWT ref if url is non-standard."""
    url = settings.SUPABASE_URL or credentials.storage.supabase_url or ""
    if url.startswith("http://") or url.startswith("https://"):
        return url

    # Try extracting project ref from JWT service role key
    key = settings.SUPABASE_SERVICE_ROLE_KEY or credentials.storage.supabase_service_role_key or ""
    if key and "." in key:
        try:
            parts = key.split(".")
            if len(parts) >= 2:
                payload = parts[1]
                payload += "=" * ((4 - len(payload) % 4) % 4)
                decoded = json.loads(base64.b64decode(payload).decode("utf-8"))
                if "ref" in decoded:
                    return f"https://{decoded['ref']}.supabase.co"
        except Exception:
            pass

    return url or "https://localhost.supabase.co"


def get_supabase_client():
    """Get Supabase client with public anon key."""
    global _supabase_client
    if _supabase_client is None:
        try:
            from supabase import create_client
            url = _get_resolved_supabase_url()
            anon_key = settings.SUPABASE_ANON_KEY or credentials.storage.supabase_anon_key or "anon-key"
            if url and anon_key and anon_key != "anon-key":
                _supabase_client = create_client(url, anon_key)
                logger.info(f"Supabase client initialized for {url}")
        except Exception as exc:
            logger.debug(f"Supabase client deferred: {exc}")
    return _supabase_client


def get_supabase_admin():
    """Get Supabase client with service_role key."""
    global _supabase_admin
    if _supabase_admin is None:
        try:
            from supabase import create_client
            url = _get_resolved_supabase_url()
            service_key = settings.SUPABASE_SERVICE_ROLE_KEY or credentials.storage.supabase_service_role_key or "service-role-key"
            if url and service_key and service_key != "service-role-key":
                _supabase_admin = create_client(url, service_key)
                logger.info(f"Supabase admin initialized for {url}")
        except Exception as exc:
            logger.debug(f"Supabase admin deferred: {exc}")
    return _supabase_admin

