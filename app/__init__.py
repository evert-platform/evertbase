import os
import shutil

from flask import Flask
from flask_bootstrap import Bootstrap

from evertcore.config import config
from evertcore.custom import sync_plugin_folder
from evertcore.data import db
from evertcore.plugins import plugin_manager
from evertcore.websockets import socketio


def create_app(config_name):
    """
    Creates the basic app instance for the flask app
    :return: Flask application instance
    """
    app = Flask(__name__)

    # loading configuration based on given config name
    app.config.from_object(config[config_name])

    # checking if evert config folder exists
    if not os.path.isdir(app.config['CONFIG_INI_FOLDER']):
        os.mkdir(app.config['CONFIG_INI_FOLDER'])
        shutil.copyfile('config.ini', os.path.join(app.config['CONFIG_INI_FILE']))

    # initiating Flask bootstrap styling
    bootstrap = Bootstrap()
    bootstrap.init_app(app)

    # Checking if there is an uploads folder under the static directory
    if not os.path.isdir(os.path.join(app.config['STATIC_DIR'], 'uploads')):
        os.mkdir(os.path.join(app.config['STATIC_DIR'], 'uploads'))

    # Checking if the user has a folder in their documents for Evert Plugins
    if not os.path.isdir(app.config['USER_PLUGINS']):
        os.mkdir(app.config['USER_PLUGINS'])

    # creating database
    db.init_app(app)
    with app.app_context():
        db.create_all()
        db.session.commit()

    # Configuration of flask_plugins extension
    plugin_manager.init_app(app)

    # finding user plugins
    sync_plugin_folder(app)

    # registering main blueprint
    from .main import main as main_blueprint
    app.register_blueprint(main_blueprint)

    # registering restapi blueprint
    from .restapi import restapi
    app.register_blueprint(restapi)

    # creating socket
    socketio.init_app(app, message_queue='amqp://guest:guest@localhost:5672//')

    return app
