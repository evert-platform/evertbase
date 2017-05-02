from flask import Blueprint
from ....manage import AppPlugin

__plugin__ = "SavgolFilter"

savgol = Blueprint('savgol', __name__)


class SavgolFilter(AppPlugin):

    def setup(self):
        self.register_blueprint(savgol)
        #There should be a connect event here, I'm unsure how Neill wants this.
