"""Structured application logging configuration.

Design decisions:
- Use Python's standard `logging` module configured at startup.
- Log format includes timestamp, level, logger name, and message.
- Request-level logging (method, path, status, duration) is handled by middleware.
- NEVER log passcodes, tokens, or credentials.
"""

import logging
import sys

from app.core.config import get_settings


def configure_logging() -> None:
    """Configure application-wide logging.

    Should be called once during application startup (lifespan).
    """
    settings = get_settings()
    log_level = getattr(logging, settings.log_level, logging.INFO)

    # Root logger configuration
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%S",
        stream=sys.stdout,
        force=True,
    )

    # Quieten noisy third-party loggers in non-debug mode
    if not settings.debug:
        logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
        logging.getLogger("uvicorn.access").setLevel(logging.WARNING)

    logger = logging.getLogger(__name__)
    logger.info(
        "Logging configured | level=%s | env=%s",
        settings.log_level,
        settings.environment,
    )


def get_logger(name: str) -> logging.Logger:
    """Return a named logger for a module.

    Usage::

        logger = get_logger(__name__)
        logger.info("Meeting created: meeting_id=%s", meeting_id)
    """
    return logging.getLogger(name)
