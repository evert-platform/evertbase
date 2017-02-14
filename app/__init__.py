from flask import Flask
from flask_bootstrap import Bootstrap
from flask_plugins import PluginManager
import os
import glob
import shutil, errno

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


def find_plugins(app):
    docdir = app.config['USER_DOCUMENTS']
    docplugins = os.path.join(docdir, 'Evert Plugins')
    pluginfolder = os.path.isdir(docplugins)

    if pluginfolder:
        plugins = glob.glob(docplugins+'/*')
        if plugins:
            for plugin in plugins:
                try:
                    try:
                        shutil.copytree(plugin, os.path.join(app.config['UPLOADED_PLUGIN_DEST'], os.path.basename(plugin)))
                    except FileExistsError:
                        shutil.rmtree(os.path.join(app.config['UPLOADED_PLUGIN_DEST'], os.path.basename(plugin)))
                        shutil.copytree(plugin,
                                        os.path.join(app.config['UPLOADED_PLUGIN_DEST'], os.path.basename(plugin)))

                except OSError as exc:  # python >2.5
                    if exc.errno == errno.ENOTDIR:
                        try:
                            shutil.copy(plugin, os.path.join(app.config['UPLOADED_PLUGIN_DEST'], os.path.basename(plugin)))
                        except FileExistsError:
                            shutil.rmtree(os.path.join(app.config['UPLOADED_PLUGIN_DEST'], os.path.basename(plugin)))
                            shutil.copy(plugin, os.path.join(app.config['UPLOADED_PLUGIN_DEST'], os.path.basename(plugin)))
                    else:
                        raise

    elif not pluginfolder:
        os.mkdir(os.path.join(docdir, 'Evert Plugins'))

