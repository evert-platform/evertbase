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

    # updating documents folder
    if pluginfolder:
        uploadedplugins = [fld for fld in os.listdir(baseplugindir) if not fld.startswith('__pyc')]
        for uploaded in uploadedplugins:
            src = os.path.join(baseplugindir, uploaded)
            dst = os.path.join(docplugins, uploaded)
            copy_files(src, dst, True)

        # updating base folder
        src_folder = glob.glob(docplugins+'/*')
        if src_folder:
            for plugin in src_folder:
                dst = os.path.join(baseplugindir, os.path.basename(plugin))
                copy_files(plugin, dst)

    elif not pluginfolder:
        try:
            os.mkdir(os.path.join(docdir, 'Evert Plugins'))

        except FileNotFoundError:
            pass


def copy_files(src, dst, check_mod_time=False):
    try:
        shutil.copytree(src, dst)
    except FileExistsError:
        if not check_mod_time:
            shutil.rmtree(dst)
            shutil.copytree(src, dst, ignore=shutil.ignore_patterns('__pycache*'))

        if check_mod_time:
            srctime = os.path.getmtime(src)
            dsttime = os.path.getmtime(dst)
            if srctime > dsttime:
                shutil.rmtree(dst)
                shutil.copytree(src, dst, ignore=shutil.ignore_patterns('__pycache*'))
            else:
                pass
    except NotADirectoryError:
        pass
