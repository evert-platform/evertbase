from flask import Blueprint
from .tsfresh_mini import extract_features
from evertcore.plugins import connect_listener, AppPlugin
import pandas as pd
from evertcore.websockets import socketio
from evertcore.plugins import register_plugin_settings, get_plugin_settings

__plugin__ = "FeatureExtraction"

features = Blueprint('features', __name__)


def run_plugin(data_before):
    print('event_emitted')
    settings = get_plugin_settings(__plugin__)

    if not isinstance(data_before, pd.DataFrame):
        raise TypeError('Expected input of type: pandas.DataFrame for argument: data_before, instead got: {}'.
                        format(type(data_before)))

    data_after = extract_features(data_before, settings)
    socketio.emit('connected', {'msg': data_after}, namespace='/test')
    return data_after


class FeatureExtraction(AppPlugin):

    def setup(self):
        self.register_blueprint(features)
        register_plugin_settings(__plugin__, 'features/config.ini')
        connect_listener("zoom_event", run_plugin)
