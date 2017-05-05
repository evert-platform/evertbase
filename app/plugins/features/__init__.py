from flask import Blueprint
from .tsfresh_mini import extract_features
from evertcore.plugins import connect_listener, AppPlugin
import time
import pandas as pd
import configparser

__plugin__ = "FeatureExtraction"

features = Blueprint('features', __name__)


def get_config():
    config = configparser.ConfigParser()
    config.read('config.ini')
    settings = [float(value) for key, value in config['DEFAULT'].items()]
    return settings


def run_plugin(data_before, **kwargs):
    # q = kwargs['q']
    # data_after = extract_features(data_before, settings)
    # q.put(data_after)
    settings = get_config()
    if isinstance(data_before, pd.DataFrame) and isinstance(settings, list):
        data_after = extract_features(data_before, settings)
    else:
        raise ValueError("Incorrect input types for Savgol Filter")
    return data_after


class FeatureExtraction(AppPlugin):

    def setup(self):
        self.register_blueprint(features)
        connect_listener("data_upload", run_plugin)
