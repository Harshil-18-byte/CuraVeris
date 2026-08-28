import logging
import sys
import json

from app.core.request_context import get_request_id


class StructuredFormatter(logging.Formatter):
    """JSON logs with correlation metadata and no implicit request payloads."""
    def format(self, record: logging.LogRecord) -> str:
        return json.dumps({
            "timestamp": self.formatTime(record),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "request_id": get_request_id(),
        })

def setup_logging():
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(StructuredFormatter())
    logging.basicConfig(
        level=logging.INFO,
        handlers=[handler],
        force=True,
    )
    # Silence noisy loggers if needed
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)

logger = logging.getLogger("curaveris")
