from evert.app import create_app
from flask import current_app
from flask_plugins import Plugin
from flask_uploads import UploadSet, DATA, configure_uploads, ALL


class AppPlugin(Plugin):
    def register_blueprint(self, blueprint, **kwargs):
        """Registers a blueprint."""
        current_app.register_blueprint(blueprint, **kwargs)

# Creating app
app = create_app()
app.config.from_pyfile('config.py')

# File upload configuration for data files
data = UploadSet('file', DATA)
configure_uploads(app, data)

# File upload configuration for ZIP files
plugin_upload = UploadSet('plugin', ALL)
configure_uploads(app, plugin_upload)

if __name__ == '__main__':
    app.run()
