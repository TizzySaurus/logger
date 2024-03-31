import logging


class DebugOrInfoFilter(logging.Filter):
    def filter(self, record):
        return record.levelname in ("DEBUG", "INFO")


class WarningFilter(logging.Filter):
    def filter(self, record):
        return record.levelname == "WARNING"


class ErrorFilter(logging.Filter):
    def filter(self, record):
        return record.levelname in ("ERROR", "CRITICAL")
