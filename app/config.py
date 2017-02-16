import os

DEBUG = True
SECRET_KEY = 'hard to guess string'
BASE_DIR = os.path.dirname(__file__)
STATIC_DIR = os.path.join(BASE_DIR, 'static')
UPLOADED_FILE_DEST = os.path.join(STATIC_DIR, 'uploads')
UPLOADED_PLUGIN_DEST = os.path.join(BASE_DIR, 'plugins')
USER_DOCUMENTS = os.path.expanduser('~/Documents')
