from flask_plugins import connect_event, iter_listeners
from multiprocessing import Process


address = ('localhost', 6000)


def connect_listener(event_name, callback):
    """
    Connects plugins to event listeners.

    Parameters
    ----------
    event_name: str
                Name of the event to bind to
    callback:
            Function to be used when this event is triggered

    """
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
    listeners = iter_listeners(event_name)

    for process in listeners:
        p = Process(target=process, args=args, kwargs=kwargs)
        p.start()
    return





