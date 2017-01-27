from flask import Flask
from flask_bootstrap import Bootstrap

bootstrap = Bootstrap()

def create_app():
    app = Flask(__name__)

    UPLOADFOLDER = 'static/uploads/'
    app.config['SECRET_KEY'] = 'hard to guess string'
    bootstrap.init_app(app)
    app.config['UPLOAD_FOLDER'] = UPLOADFOLDER
    from .main import main as main_blueprint
    app.register_blueprint(main_blueprint)
    return app

