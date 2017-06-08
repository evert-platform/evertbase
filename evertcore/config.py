import os


class BaseConfig:
    DEBUG = False
    TESTING = False
    SECRET_KEY = 'hard to guess string'
    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    STATIC_DIR = os.path.join(BASE_DIR, 'app/static')
    DB_PATH = os.path.join(STATIC_DIR, 'uploads/EvertStore.db')
    SQLALCHEMY_DATABASE_URI = 'sqlite:///{}'.format(DB_PATH)
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    UPLOADED_PLUGIN_DEST = os.path.join(BASE_DIR, 'app/plugins')
    USER_PLUGINS = os.path.join(os.path.expanduser('~/Documents'), 'Evert Plugins')
    CONFIG_INI_FOLDER = os.path.expanduser('~/.evert')
    CONFIG_INI_FILE = os.path.join(CONFIG_INI_FOLDER, 'config.ini')
    MESSAGE_QUEUE = 'amqp://guest:guest@localhost:5672//'


# configuration for developing
class DevelopmentConfig(BaseConfig):
    DEBUG = True
    TESTING = False


# configuration for testing
class TestingConfig(BaseConfig):
    DEBUG = False
    TESTING = True
    MESSAGE_QUEUE = None


config = {
    "development": "evertcore.config.DevelopmentConfig",
    "testing": "evertcore.config.TestingConfig",
    "default": "evertcore.config.BaseConfig"
}
