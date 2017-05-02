from flask import Blueprint
from manage import AppPlugin
from .savgol import sg_filter

__plugin__ = "SavgolFilter"

savgol = Blueprint('savgol', __name__)


def run_plugin(data_before, settings):
    data_after = sg_filter(data_before, settings)
    return data_after


class SavgolFilter(AppPlugin):

    def setup(self):
        self.register_blueprint(savgol)
        # There should be a connect event here, I'm unsure how Neill wants this.
