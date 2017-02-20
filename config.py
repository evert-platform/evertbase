import os


class BaseConfig:
    DEBUG = False
    TESTING = False
    FIND_PLUGINS = True
    SECRET_KEY = 'hard to guess string'
    BASE_DIR = os.path.dirname(__file__)
    STATIC_DIR = os.path.join(BASE_DIR, 'app/static')
    HDF5_STORE = os.path.join(STATIC_DIR, 'uploads/EvertStore.h5')
    UPLOADED_PLUGIN_DEST = os.path.join(BASE_DIR, 'app/plugins')
    USER_DOCUMENTS = os.path.expanduser('~/Documents')



class DevelopmentConfig(BaseConfig):
    DEBUG = True
    TESTING = False


class TestingConfig(BaseConfig):
    DEBUG = False
    TESTING = True


config = {
    "development": "config.DevelopmentConfig",
    "testing": "config.TestingConfig",
    "default": "config.BaseConfig"
}
