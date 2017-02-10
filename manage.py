from evert.app import create_app
from flask import current_app
from flask_plugins import Plugin


class AppPlugin(Plugin):
    def register_blueprint(self, blueprint, **kwargs):
        """Registers a blueprint."""
        current_app.register_blueprint(blueprint, **kwargs)

# Creating app
app = create_app()
app.config.from_pyfile('config.py')

if __name__ == '__main__':
    app.run()
