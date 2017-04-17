from flask import Blueprint
from ....manage import AppPlugin

__plugin__ = "FeatureExtraction"

features = Blueprint('features', __name__)


class FeatureExtraction(AppPlugin):

    def setup(self):
        self.register_blueprint(features)
        #There should be a connect event here, I'm unsure how Neill wants this.
