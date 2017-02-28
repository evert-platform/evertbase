from flask import Flask
from flask_bootstrap import Bootstrap
from flask_plugins import PluginManager
from .main.functions import find_plugins, DataBase
from config import config
import os

sqldb = DataBase('test.db')


def create_app(config_name):
    """
    Creates the basic app instance for the flask app
    :return: Flask application instance
    """
    app = Flask(__name__)

    # loading configuration based on given config name
    app.config.from_object(config[config_name])

    # initiating Flask bootstrap styling
    bootstrap = Bootstrap()
    bootstrap.init_app(app)

    # Checking if there is an uploads folder under the static directory
    if not os.path.isdir(os.path.join(app.config['STATIC_DIR'], 'uploads')):
        os.mkdir(os.path.join(app.config['STATIC_DIR'], 'uploads'))

    # Checking if the user has a folder in their documents for Evert Plugins
    if not os.path.isdir(app.config['USER_PLUGINS']):
        os.mkdir(app.config['USER_PLUGINS'])

    # Configuration of flask_plugins extension
    PluginManager(app)

    # finding user plugins
    find_plugins(app)

    # registering main blueprint
    from .main import main as main_blueprint
    app.register_blueprint(main_blueprint)
    return app



