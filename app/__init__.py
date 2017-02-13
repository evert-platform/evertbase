from flask import Flask
from flask_bootstrap import Bootstrap
from flask_plugins import PluginManager


bootstrap = Bootstrap()


def create_app(development=True):
    """
    Creates the basic app instance for the flask app
    :param development: If set to True the app will open on the Flask development
                        server. If False, the app will open on the Twisted web server.
    :return: Flask application instance
    """
    app = Flask(__name__)

    UPLOADFOLDER = 'static/uploads/'
    app.config['SECRET_KEY'] = 'hard to guess string'
    bootstrap.init_app(app)

    app.config['UPLOAD_FOLDER'] = UPLOADFOLDER

    # Configuration of flask_plugins extension
    pluginmanager = PluginManager(app)

    from .main import main as main_blueprint
    app.register_blueprint(main_blueprint)
    return app

