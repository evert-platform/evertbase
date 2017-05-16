from flask import Blueprint
from .savgol import sg_filter
from evertcore.plugins import connect_listener, AppPlugin
from evertcore.plugins import register_plugin_settings, get_plugin_settings

__plugin__ = "SavgolFilter"

savgol = Blueprint('savgol', __name__)


def run_plugin(data_before):
    settings = get_plugin_settings(__plugin__)
    data_after = sg_filter(data_before, settings)
    return data_after


class SavgolFilter(AppPlugin):

    def setup(self):
        self.register_blueprint(savgol)
        register_plugin_settings(__plugin__, 'Savgol/config.ini')
        connect_listener('zoom_event', run_plugin)
