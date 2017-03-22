from flask import Blueprint

# main application blueprint
main = Blueprint('main', __name__, static_folder='static', template_folder='templates')

# imported at bottom to prevent circular importing
from . import views, views_async, models
