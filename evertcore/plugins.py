from flask_plugins import connect_event as _connect_event, iter_listeners as _iter_listeners, Plugin, PluginManager
from multiprocessing import Process
from flask import current_app

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




