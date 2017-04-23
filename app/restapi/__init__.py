from flask import Blueprint

# main application blueprint
restapi = Blueprint('restapi', __name__)

from . import endpoints