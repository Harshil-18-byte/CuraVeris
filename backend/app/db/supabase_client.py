"""Supabase Client Factory for CuraVeris / MedBill backend."""

from typing import Optional
from app.core.config import settings
from app.core.logging import logger

_supabase_client = None
_supabase_admin = None


def get_supabase_client():
    """Get Supabase client with public anon key."""
    global _supabase_client
    if _supabase_client is None:
        try:
            from supabase import create_client
            _supabase_client = create_client(
                getattr(settings, "SUPABASE_URL", "https://localhost.supabase.co"),
                getattr(settings, "SUPABASE_ANON_KEY", "anon-key")
            )
        except Exception as exc:
            logger.debug(f"Supabase client deferred: {exc}")
    return _supabase_client


def get_supabase_admin():
    """Get Supabase client with service_role key."""
    global _supabase_admin
    if _supabase_admin is None:
        try:
            from supabase import create_client
            _supabase_admin = create_client(
                getattr(settings, "SUPABASE_URL", "https://localhost.supabase.co"),
                getattr(settings, "SUPABASE_SERVICE_ROLE_KEY", "service-role-key")
            )
        except Exception as exc:
            logger.debug(f"Supabase admin deferred: {exc}")
    return _supabase_admin
