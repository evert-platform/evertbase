from flask import Flask
from flask_bootstrap import Bootstrap
from .main.functions import find_plugins
from evertcore.data import db
from evertcore.plugins import plugin_manager
from config import config
import os


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
    plugin_manager.init_app(app)

    # finding user plugins
    # find_plugins(app)

    # registering main blueprint
    from .main import main as main_blueprint
    app.register_blueprint(main_blueprint)

    # registering restapi blueprint
    from .restapi import restapi
    app.register_blueprint(restapi)

    # creating database
    db.init_app(app)
    with app.app_context():
        db.create_all()
        db.session.commit()

    return app
