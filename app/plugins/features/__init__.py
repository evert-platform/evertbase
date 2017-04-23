from flask import Blueprint
from manage import AppPlugin
from .tsfresh_mini import extract_features

__plugin__ = "FeatureExtraction"

features = Blueprint('features', __name__)


def run_plugin(data_before, settings):
    data_after = extract_features(data_before, settings)
    return data_after


class FeatureExtraction(AppPlugin):

    def setup(self):
        self.register_blueprint(features)
        # There should be a connect event here, I'm unsure how Neill wants this.
        # connect_event("features", run_plugin)

        # with open("config.txt") as file:
        #     for line in file:
        #         pass  # I'd like to read the config here, and parse it to EvertStore.db.plugin_settings, so that
        #         # it can be parsed back when the plugin is called. Alternatively, the plugin_settings table needs
        #         # to be deleted and the files read each time the plugin is called (I think the latter
        #         # method will be much slower)
        #         # Also, this won't run as is. Flask won't allow it (working dir isn't app/plugins/features/)
