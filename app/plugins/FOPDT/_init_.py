from flask import Blueprint
from evertcore.plugins import connect_listener, AppPlugin
from evertcore.plugins import emit_addon_plot_data, register_plugin, register_plugin_settings
from evertcore.plugins import get_plugin_settings
from .FOPDT import apply_fopdt
import pandas as pd

__plugin__ = "FOPDT Fit"
__plugin_type__ = 'timeseries'

fopdt = Blueprint('FOPDT Fit', __name__)

def run_plugin(data, name):
    print('event_emitted')
    if name == 'FOPDT':
        settings = get_plugin_settings(__plugin__)
        if not isinstance(data, pd.DataFrame):
            raise TypeError('Expected input of type: pandas.DataFrame for argument: data_before, instead got: {}'.
                            format(type(data)))
        if not isinstance(settings, dict):
            raise TypeError('Expected input of type: dict for argument: config, instead got: {}'.format(type(settings)))

        data_after = apply_fopdt(data, settings)
        return data_after

class fopdt_fit(AppPlugin):

    def setup(self):
        self.register_blueprint(fopdt)
        register_plugin(__plugin__, __plugin_type__)
        register_plugin_settings(__plugin__, 'FOPDT/config.ini')
        connect_listener('add_on_event', run_plugin)