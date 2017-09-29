from flask import Blueprint
from evertcore.plugins import connect_listener, AppPlugin
import pandas as pd
from evertcore.plugins import register_plugin_settings, get_plugin_settings
from evertcore.plugins import emit_addon_script, register_plugin
from .pca import apply_pca

__plugin__ = "PCA"
__plugin_type__ = 'add_on'

pca = Blueprint('pca', __name__)


def run_plugin(data, name):
    print('event_emitted')
    if name == 'pca':
        if not isinstance(data, pd.DataFrame):
            raise TypeError('Expected input of type: pandas.DataFrame for argument: data_before, instead got: {}'.
                            format(type(data)))

        script = apply_pca(data)
        emit_addon_script(script)

        return
    else:
        return


class PCA(AppPlugin):

    def setup(self):
        self.register_blueprint(pca)
        register_plugin(__plugin__, __plugin_type__)
        connect_listener("add_on_event", run_plugin)