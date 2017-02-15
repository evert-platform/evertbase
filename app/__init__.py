from flask import Flask
from flask_bootstrap import Bootstrap
from flask_plugins import PluginManager
import os
import glob
import shutil


def create_app(development=True):
    """
    Creates the basic app instance for the flask app
    :param development: If set to True the app will open on the Flask development
                        server. If False, the app will open on the Twisted web server.
    :return: Flask application instance
    """
    app = Flask(__name__)
    bootstrap = Bootstrap()

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
    """
    Synchronises the plugins in the base code with the plugins in the documents folder. This ensures the newest version
    of the plugins are always available when the server resets.
    :param app: flask application instance
    """
    docdir = app.config['USER_DOCUMENTS']
    docplugins = os.path.join(docdir, 'Evert Plugins')
    pluginfolder = os.path.isdir(docplugins)
    baseplugindir = app.config['UPLOADED_PLUGIN_DEST']
    basecopy = []

    # updating documents folder
    if pluginfolder:
        uploadedplugins = os.listdir(baseplugindir)
        for uploaded in uploadedplugins:
            if uploaded != '__pycache__':
                filepath = os.path.join(baseplugindir, uploaded)
                try:
                    shutil.copytree(filepath, os.path.join(docplugins, uploaded))
                    basecopy.append(uploaded)

                except FileExistsError:
                    srctime = os.path.getmtime(filepath)
                    dsttime = os.path.getmtime(os.path.join(docplugins, uploaded))
                    if srctime > dsttime:
                        shutil.rmtree(os.path.join(docplugins, uploaded))
                        shutil.copytree(filepath, os.path.join(docplugins, uploaded))
                        basecopy.append(uploaded)
                    else:
                        pass
                except NotADirectoryError:
                    pass

        # updating base folder
        plugins = glob.glob(docplugins+'/*')
        if plugins:
            for plugin in plugins:
                if os.path.basename(plugin) not in basecopy:
                    try:
                        shutil.copytree(plugin, os.path.join(baseplugindir, os.path.basename(plugin)))
                    except FileExistsError:
                        shutil.rmtree(os.path.join(baseplugindir, os.path.basename(plugin)))
                        shutil.copytree(plugin,
                                        os.path.join(baseplugindir, os.path.basename(plugin)))
                    except NotADirectoryError:
                        pass

    elif not pluginfolder:
        os.mkdir(os.path.join(docdir, 'Evert Plugins'))
