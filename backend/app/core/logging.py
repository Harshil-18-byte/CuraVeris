import logging
import sys
import json
import re

from app.core.request_context import get_request_id

# Regex patterns for sensitive data redaction
_SENSITIVE_PATTERNS = [
    (re.compile(r"Bearer\s+[A-Za-z0-9\-_=]+(?:\.[A-Za-z0-9\-_=]+)+", re.IGNORECASE), "Bearer [REDACTED_TOKEN]"),
    (re.compile(r'(["\']?(?:password|passwd|secret|api_key|token|access_token|refresh_token|encryption_key)["\']?\s*[:=]\s*["\']?)([^"\'\s,}{]+)(["\']?)', re.IGNORECASE), r'\1[REDACTED]\3'),
    (re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"), "[REDACTED_EMAIL]"),
    (re.compile(r"(?:\+91[\-\s]?)?[6789]\d{9}"), "[REDACTED_PHONE]"),
    (re.compile(r"\b\d{4}\s\d{4}\s\d{4}\b"), "[REDACTED_AADHAAR]"),
    (re.compile(r"\b\d{2}-\d{4}-\d{4}-\d{4}\b"), "[REDACTED_ABHA]"),
]


def redact_sensitive_data(message: str) -> str:
    """Scrub sensitive credentials, tokens, PII, and identifiers from log strings."""
    if not isinstance(message, str):
        message = str(message)
    for pattern, replacement in _SENSITIVE_PATTERNS:
        message = pattern.sub(replacement, message)
    return message


class StructuredFormatter(logging.Formatter):
    """JSON logs with correlation metadata and automated PII/secret scrubbing."""
    def format(self, record: logging.LogRecord) -> str:
        clean_message = redact_sensitive_data(record.getMessage())
        return json.dumps({
            "timestamp": self.formatTime(record),
            "level": record.levelname,
            "logger": record.name,
            "message": clean_message,
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

