from flask_plugins import connect_event as _connect_event, iter_listeners as _iter_listeners, Plugin, PluginManager
from multiprocessing import Process
from flask import current_app
import configparser
import os
_plugin_events = ['data_upload', 'zoom_event']
plugin_manager = PluginManager()


class EvertPluginException(Exception):
    pass


class AppPlugin(Plugin):
    def register_blueprint(self, blueprint, **kwargs):
        """Registers a blueprint."""
        current_app.register_blueprint(blueprint, **kwargs)


def connect_listener(event_name, callback):
    """
    Connects plugins to event listeners.

    Parameters
    ----------
    event_name: str
                Name of the event to bind to
    callback: callable
            Function to be used when this event is triggered

    """

    # check if event name is valid
    if event_name not in _plugin_events:
        raise EvertPluginException('Invalid event name: {}'.format(event_name))

    # check if callback is a callable function
    if not callable(callback):
        raise EvertPluginException('Callback argument not a function')

    _connect_event(event_name, callback)
    return


def emit_event(event_name, *args, **kwargs):
    """
    Emits an event and executes all the plugins subscribed to the event. The input data given is transmitted to
    all plugins.
    Parameters
    ----------
    event_name: str
                Name of event to be emitted.
    args:
            Arguments to pass to callback function.
    kwargs:
            Keyword arguments to pass to callback function.

    """
    # check if correct event is emitted
    if event_name not in _plugin_events:
        raise EvertPluginException('Invalid event name: {}'.format(event_name))

    listeners = _iter_listeners(event_name)
    plugin_processes = [Process(target=process, args=args, kwargs=kwargs).start() for process in listeners]

    return


def register_plugin_settings(plugin_name, config_path):
    """
    Registers the plugin config with the default Evert config. Any changes that are made to these settings
    in Evert will not be updated in the plugins local config file.
    
    Parameters
    ----------
    plugin_name: str
                Name of the plugin, Use the '__plugin__' variable.
    config_path: str
                File path to the plugin's config file relative to the plugins folder.

    Returns
    -------

    """



    app = current_app
    evert_config = configparser.RawConfigParser()
    plugin_config = configparser.ConfigParser()
    evert_config.read(app.config['CONFIG_INI'])
    local_read__path = os.path.join(app.config["UPLOADED_PLUGIN_DEST"], config_path)
    plugin_config.read(local_read__path)
    plugin_settings = plugin_config['DEFAULT']

    if plugin_name not in evert_config.sections():
        evert_config[plugin_name] = dict(plugin_settings)

        with open(os.path.join(app.config["CONFIG_INI"], 'config.ini'), 'w') as configfile:
            evert_config.write(configfile)





