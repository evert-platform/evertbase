from flask import Flask
from flask_bootstrap import Bootstrap
from flask_plugins import PluginManager
from .main.functions import find_plugins
from config import config
import os


def create_app(config_name):
    """
    Creates the basic app instance for the flask app
    :return: Flask application instance
    """
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    bootstrap = Bootstrap()
    bootstrap.init_app(app)

    if not os.path.isdir(os.path.join(app.config['STATIC_DIR'], 'uploads')):
        os.mkdir(os.path.join(app.config['STATIC_DIR'], 'uploads'))

    if not app.config['TESTING']:
        find_plugins(app)

    # Configuration of flask_plugins extension
    PluginManager(app)

    from .main import main as main_blueprint
    app.register_blueprint(main_blueprint)
    return app



