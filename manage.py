from app import create_app
from flask import current_app
from flask_plugins import Plugin
from flask_uploads import UploadSet, configure_uploads, ALL
import os



# class for registering plugins
class AppPlugin(Plugin):
    def register_blueprint(self, blueprint, **kwargs):
        """Registers a blueprint."""
        current_app.register_blueprint(blueprint, **kwargs)

# Creating app
app = create_app(os.getenv('FLASK_CONFIG') or 'default')


# File upload configuration for ZIP files using flask-uploads
plugin_upload = UploadSet('plugin', ALL)
configure_uploads(app, plugin_upload)

if __name__ == '__main__':
    app.run()
