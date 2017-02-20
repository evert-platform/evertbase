from app import create_app, find_plugins
from flask import current_app
from flask_plugins import Plugin
from flask_uploads import UploadSet, configure_uploads, ALL


class AppPlugin(Plugin):
    def register_blueprint(self, blueprint, **kwargs):
        """Registers a blueprint."""
        current_app.register_blueprint(blueprint, **kwargs)

# Creating app
app = create_app('development')

# File upload configuration for ZIP files
plugin_upload = UploadSet('plugin', ALL)
configure_uploads(app, plugin_upload)

if __name__ == '__main__':
    app.run()
