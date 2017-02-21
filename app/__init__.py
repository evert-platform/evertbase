from flask import Flask
from flask_bootstrap import Bootstrap
from flask_plugins import PluginManager
import os
import glob
import shutil
from config import config


def create_app(config_name):
    """
    Creates the basic app instance for the flask app
    :return: Flask application instance
    """
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    bootstrap = Bootstrap()
    bootstrap.init_app(app)

    if not app.config['TESTING']:
        find_plugins(app)

    # Configuration of flask_plugins extension
    PluginManager(app)

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
        uploadedplugins = [fld for fld in os.listdir(baseplugindir) if not fld.startswith('__pyc')]
        for uploaded in uploadedplugins:
            filepath = os.path.join(baseplugindir, uploaded)
            try:
                shutil.copytree(filepath, os.path.join(docplugins, uploaded),
                                ignore=shutil.ignore_patterns('__pycache*'))
                basecopy.append(uploaded)

            except FileExistsError:
                srctime = os.path.getmtime(filepath)
                dsttime = os.path.getmtime(os.path.join(docplugins, uploaded))
                if srctime > dsttime:
                    shutil.rmtree(os.path.join(docplugins, uploaded))
                    shutil.copytree(filepath, os.path.join(docplugins, uploaded),
                                    ignore=shutil.ignore_patterns('__pycache*'))
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
        try:
            os.mkdir(os.path.join(docdir, 'Evert Plugins'))

        except FileNotFoundError:
            pass
