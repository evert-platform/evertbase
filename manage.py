from evert.app import create_app
from flask import current_app
from flask_plugins import Plugin
from flask_uploads import UploadSet, DATA, configure_uploads
import os


class AppPlugin(Plugin):
    def register_blueprint(self, blueprint, **kwargs):
        """Registers a blueprint."""
        current_app.register_blueprint(blueprint, **kwargs)

# Creating app
app = create_app()

# Basic directory paths
app.config['BASE_DIR'] = os.path.dirname(__file__)
app.config['PLUGIN_DIR'] = os.path.join(app.config['BASE_DIR'], 'app/plugins')
app.config['STATIC_DIR'] = os.path.join(app.config['BASE_DIR'], 'app/static')

# Configuration of flask_uploads extension
data = UploadSet('file', DATA)
app.config['UPLOADED_FILE_DEST'] = os.path.join(app.config['STATIC_DIR'], 'uploads')
configure_uploads(app, data)


if __name__ == '__main__':
    app.run(debug=True)
