from flask import Blueprint
from .tsfresh_mini import extract_features
from evertcore.plugins import connect_listener, AppPlugin
import time
import pandas as pd
import configparser
from evertcore.websockets import socketio
import os

__plugin__ = "FeatureExtraction"

features = Blueprint('features', __name__)


def get_config():
    config = configparser.ConfigParser()
    config.read('config.ini')
    settings = [float(value) for key, value in config['DEFAULT'].items()]
    socketio.emit('connected', {'msg': settings}, namespace='/test')
    return settings


def run_plugin(data_before, **kwargs):
    print('event_emitted')
    a = os.path.curdir
    settings = [0.3, 3, 50]
    socketio.emit('connected', {'msg': a}, namespace='/test')
    if isinstance(data_before, pd.DataFrame) and isinstance(settings, list):
        data_after = extract_features(data_before, settings)
    else:
        raise ValueError("Incorrect input types for Savgol Filter")

    socketio.emit('connected', {'msg': data_after}, namespace='/test')
    return data_after


class FeatureExtraction(AppPlugin):

    def setup(self):
        self.register_blueprint(features)
        connect_listener("zoom_event", run_plugin)
