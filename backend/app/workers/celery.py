"""Celery worker alias entrypoint."""
from app.workers.celery_app import celery_app, celery, app

__all__ = ["celery_app", "celery", "app"]
