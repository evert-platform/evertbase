from flask_plugins import connect_event, iter_listeners
from multiprocessing import Process

_plugin_events = ['data_upload', 'zoom_event']


class EvertPluginException(Exception):
    pass


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
        raise EvertPluginException('Invalid event name.')

    # check if callback is a callable function
    if not callable(callback):
        raise EvertPluginException('Callback argument not a function')

    connect_event(event_name, callback)
    return


def event_emit(event_name, *args, **kwargs):
    """
    Emits an event and executes all the plugins subscribed to the event.
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
        raise EvertPluginException('Invalid event name')

    listeners = iter_listeners(event_name)

    for process in listeners:
        p = Process(target=process, args=args, kwargs=kwargs)
        p.start()
    return





