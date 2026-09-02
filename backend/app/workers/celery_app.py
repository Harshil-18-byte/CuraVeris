from celery import Celery
from kombu import Queue
from app.core.config import settings

celery_app = Celery(
    "curaveris_worker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)
celery = celery_app
app = celery_app


celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    worker_prefetch_multiplier=1,
    task_track_started=True,
    task_soft_time_limit=300,
    task_time_limit=360,
    task_queues=[
        Queue("bill_processing", routing_key="bill.#"),
        Queue("frm_analysis", routing_key="frm.#"),
        Queue("notifications", routing_key="notify.#"),
        Queue("default", routing_key="default"),
    ],
    task_default_queue="default",
)

# Autodiscover worker tasks
celery_app.autodiscover_tasks([
    "app.workers.ocr_task",
    "app.workers.audit_task",
    "app.workers.ml_task",
    "app.workers.evidence_task",
    "app.workers.notification_task",
    "app.workers.frm_task",
])
