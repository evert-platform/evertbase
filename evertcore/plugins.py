from flask_plugins import connect_event as _connect_event, iter_listeners as _iter_listeners, Plugin, PluginManager
from multiprocessing import Process
from flask import current_app
import configparser
import os
from sqlalchemy.exc import IntegrityError

from .websockets import socketio
from .plotting import Features
from .models import PluginIds


_plugin_events = ['data_upload', 'zoom_event']
_plugin_types = ['features', 'timeseries']
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

    evert_config = configparser.ConfigParser()
    plugin_config = configparser.ConfigParser()
    evert_config.read(current_app.config['CONFIG_INI_FILE'])
    local_read__path = os.path.join(current_app.config["UPLOADED_PLUGIN_DEST"], config_path)
    plugin_config.read(local_read__path)
    plugin_settings = plugin_config['DEFAULT']

    if plugin_name not in evert_config.sections():
        evert_config[plugin_name] = dict(plugin_settings)

        with open(os.path.join(current_app.config["CONFIG_INI_FILE"]), 'w') as configfile:
            evert_config.write(configfile)


def get_plugin_settings(plugin_name):
    """
    Gets the setting for the plugin from the central config file
    
    Parameters
    ----------
    plugin_name: str
                Name of the plugin. Use the sam name as used to register plugin settings.

    Returns
    -------
    plugin_settings: dict
                    Key value pairs of plugin settings

    """

    if not isinstance(plugin_name, str):
        raise TypeError('Input of type: str expected for argument: plugin_name, instead got {}'.format(type(plugin_name)))

    plugin_config = configparser.ConfigParser()
    plugin_config.read(os.path.expanduser('~/.evert/config.ini'))

    config = dict(plugin_config[plugin_name])
    for key, value in config.items():   # converting values to numbers
        try:
            config[key] = int(value)    # checking if value can be converted to int
        except ValueError:              # If not try float
            try:
                config[key] = float(value)  # checking if value can be converted to float
            except ValueError:              # If not value should probably be a string therefore continue to next item
                continue                    # in the dict

    return config


def emit_feature_data(data, domain, plugin_name):
    feature = Features(data)
    datamap, data = feature.plot_data()
    socketio.emit("pluginFeaturesEmit", {'data': data, 'datamap': datamap, 'domain': domain, 'name': plugin_name},
                  namespace='/test')
    return


def register_plugin(plugin_name, plugin_type):
    """
    Register the plugin in the database on server start. 
    
    Parameters
    ----------
    plugin_name: str    
                Name of the plugin
    plugin_type: str
                Type of plugin: ['features', 'timeseries']

    Returns
    -------

    """

    if not isinstance(plugin_name, str):
        raise ValueError("Input of type: str expected for argument: plugin_name, instead got: {}".format(type(plugin_name)))
    if plugin_type not in _plugin_types:
        raise ValueError('Invalid plugin type: {} valif values are: {}'.format(plugin_type, _plugin_types))


    # add plugin to database
    try:
        PluginIds.create(plugin_name=plugin_name, plugin_type=plugin_type)
    except IntegrityError:
        pass

    return
