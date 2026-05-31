"""Singleton Pattern - Database config and Logger service."""
import logging
import threading
from decouple import config


class DatabaseConfig:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._init = False
        return cls._instance

    def __init__(self):
        if getattr(self, '_init', False):
            return
        self._init = True
        self.name = config('DB_NAME', default='campus_eat')
        self.user = config('DB_USER', default='campus_eat')
        self.password = config('DB_PASSWORD', default='campus_eat_secret')
        self.host = config('DB_HOST', default='postgres')
        self.port = config('DB_PORT', default='5432')

    def get_config(self):
        return {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': self.name,
            'USER': self.user,
            'PASSWORD': self.password,
            'HOST': self.host,
            'PORT': self.port,
        }


class LoggerService:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._setup()
        return cls._instance

    def _setup(self):
        self.logger = logging.getLogger('campus_eat')
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            handler.setFormatter(logging.Formatter('[%(levelname)s] %(message)s'))
            self.logger.addHandler(handler)
            self.logger.setLevel(logging.INFO)

    def info(self, message):
        self.logger.info(message)

    def error(self, message):
        self.logger.error(message)
