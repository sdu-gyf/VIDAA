import os
import logging
from logging.handlers import RotatingFileHandler
from typing import Optional


def setup_logger(
    logger_name: str,
    log_file: str,
    level: int = logging.INFO,
    max_bytes: int = 10 * 1024 * 1024,  # 10MB
    backup_count: int = 5,
    log_format: Optional[str] = None,
) -> logging.Logger:
    """
    setup and return a custom logger

    Args:
        logger_name: logger's name
        log_file: log file's path
        level: log level, default is INFO
        max_bytes: max size of a single log file, default is 10MB
        backup_count: number of log files to keep, default is 5
        log_format: log format, if None, use default format

    Returns:
        logging.Logger: configured logger instance
    """
    logger = logging.getLogger(logger_name)
    logger.setLevel(level)

    os.makedirs(os.path.dirname(log_file), exist_ok=True)

    if log_format is None:
        log_format = "[%(asctime)s] %(levelname)s [%(name)s:%(lineno)s] %(message)s"
    formatter = logging.Formatter(log_format)

    file_handler = RotatingFileHandler(
        log_file, maxBytes=max_bytes, backupCount=backup_count, encoding="utf-8"
    )
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    return logger


gen_video_logger = setup_logger(
    logger_name="gen_video", log_file="logs/gen_video.log", level=logging.INFO
)

uploaders_logger = setup_logger(
    logger_name="uploaders", log_file="logs/uploaders.log", level=logging.INFO
)
