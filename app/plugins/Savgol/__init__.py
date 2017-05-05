from flask import Blueprint
from .savgol import sg_filter
from evertcore.plugins import connect_listener, AppPlugin
import pandas as pd
__plugin__ = "SavgolFilter"

savgol = Blueprint('savgol', __name__)


def run_plugin(data_before, settings):
    if isinstance(data_before, pd.DataFrame) and isinstance(settings, list):
        data_after = sg_filter(data_before, settings)
    else:
        raise ValueError("Incorrect input types for Savgol Filter")
    return data_after


class SavgolFilter(AppPlugin):

    def setup(self):
        self.register_blueprint(savgol)
        # There should be a connect event here, I'm unsure how Neill wants this.
        # connect_listener('data_upload', run_plugin)
