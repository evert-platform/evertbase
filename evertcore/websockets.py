from flask_socketio import emit, SocketIO
from datetime import datetime


from . import data, plotting, plugins

socketio = SocketIO()

_threshold = 500


@socketio.on('connect', namespace='/test')
def joined():
    """Sent by clients when they enter a room.
    A status message is broadcast to all people in the room."""
    print('Socket connected')


@socketio.on('zoom_event', namespace='/test')
def zoom_event(socket_data):
    print('socket zoom event')
    print(socket_data)
    print()
    try:
        tmin = datetime.strptime(socket_data['domain'][0], '%Y-%m-%d %H:%M:%S.%f')
    except ValueError:
        tmin = datetime.strptime(socket_data['domain'][0], '%Y-%m-%d %H:%M:%S')  # Does not contain milliseconds

    try:
        tmax = datetime.strptime(socket_data['domain'][1], '%Y-%m-%d %H:%M:%S.%f')
    except ValueError:
        tmax = datetime.strptime(socket_data['domain'][1], '%Y-%m-%d %H:%M:%S')  # Does not contain milliseconds

    tags = socket_data['ids']

    tag_data_ = data.tag_data(tags, tmin, tmax)

    fig = plotting.Fig()
    fig.prepare_data(tag_data_, threshold=_threshold)
    data_, datamap = fig.return_data()
    # window_data = fig.window_data(domain)
    # plugins.emit_event('zoom_event', window_data, fig.domain)

    emit('zoom_return', dict(success=True, data=data_, datamap=datamap))
    return

