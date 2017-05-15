from flask import Blueprint
from .savgol import sg_filter
from evertcore.plugins import connect_listener, AppPlugin
import pandas as pd
import configparser
from evertcore.plugins import register_plugin_settings


__plugin__ = "SavgolFilter"

savgol = Blueprint('savgol', __name__)


def get_config():
    config = configparser.ConfigParser()
    config.read('config.ini')
    settings = [float(value) for key, value in config['DEFAULT'].items()]
    return settings


def run_plugin(data_before):
    settings = get_config()
    if isinstance(data_before, pd.DataFrame) and isinstance(settings, list):
        data_after = sg_filter(data_before, settings)
    else:
        raise ValueError("Incorrect input types for Savgol Filter")
    return data_after


class SavgolFilter(AppPlugin):

    def setup(self):
        self.register_blueprint(savgol)
        register_plugin_settings(__plugin__, 'Savgol/config.ini')
        connect_listener('data_upload', run_plugin)
