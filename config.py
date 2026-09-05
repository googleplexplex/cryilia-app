import os
from datetime import timedelta
from pathlib import Path

try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).resolve().parent / '.env')
except ImportError:
    pass

BASE_DIR = Path(__file__).resolve().parent


class Config:
    """Базовый класс конфигурации"""

    # Секретный ключ для Flask
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'

    # Конфигурация кэширования
    CACHE_TYPE = 'SimpleCache'
    CACHE_DEFAULT_TIMEOUT = 300
    CACHE_THRESHOLD = 1000

    # Загрузка файлов
    UPLOAD_FOLDER = 'static/images'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    GALLERY_UPLOAD_DIR = os.environ.get('GALLERY_UPLOAD_DIR') or str(BASE_DIR / 'data' / 'uploads')

    # Логирование
    LOG_LEVEL = 'INFO'
    LOG_DIR = 'logs'
    LOG_FILE = 'app.log'
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'

    # Хост и порт для запуска
    HOST = '0.0.0.0'
    PORT = 5000

    # Статьи (SQLite). На сервере лучше задать путь вне копируемых папок.
    ARTICLES_DB_PATH = os.environ.get('ARTICLES_DB_PATH') or str(BASE_DIR / 'data' / 'articles.db')
    ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD') or ''
    SITE_URL = os.environ.get('SITE_URL', 'https://cryiliya.ru').rstrip('/')

    PERMANENT_SESSION_LIFETIME = timedelta(hours=12)
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'


class DevelopmentConfig(Config):
    """Конфигурация для разработки"""
    DEBUG = True
    TESTING = False

    # В разработке используем более быстрое логирование
    CACHE_DEFAULT_TIMEOUT = 60  # 1 минута для удобства разработки


class ProductionConfig(Config):
    """Конфигурация для продакшене"""
    DEBUG = False
    TESTING = False

    # В продакшене можно использовать Redis для кэширования
    # CACHE_TYPE = 'RedisCache'
    # CACHE_REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')

    # Важно: Установите переменную окружения SECRET_KEY для продакшена
    # Пример: export SECRET_KEY='your-secure-random-key-here'

    # Более длительное кэширование в продакшене
    CACHE_DEFAULT_TIMEOUT = 600  # 10 минут
    SESSION_COOKIE_SECURE = True


class TestingConfig(Config):
    """Конфигурация для тестирования"""
    TESTING = True
    DEBUG = True

    # Отключаем кэширование при тестировании
    CACHE_TYPE = 'NullCache'


# Словарь конфигураций для удобства
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}


def get_config(env_name=None):
    """
    Получить конфигурацию на основе окружения

    Args:
        env_name: Имя окружения ('development', 'production', 'testing')
                 Если не указано, используется переменная окружения FLASK_ENV
                 или значение по умолчанию 'development'

    Returns:
        Класс конфигурации
    """
    if env_name is None:
        env_name = os.environ.get('FLASK_ENV', 'development')

    return config.get(env_name, DevelopmentConfig)
