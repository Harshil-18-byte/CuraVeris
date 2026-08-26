import logging
import sys

def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )
    # Silence noisy loggers if needed
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)

logger = logging.getLogger("curaveris")
