import logging
from app.workers.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(
    name="app.workers.notification_task.dispatch_push_notification",
    queue="notifications",
    max_retries=3,
)
def dispatch_push_notification(user_id: str, title: str, body: str, payload: dict = None):
    """Worker background job for push notifications dispatch."""
    logger.info(f"Dispatched web push notification to user {user_id}: {title} - {body}")
    return True
