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

    domain = socket_data['domain']
    tags = socket_data['ids']
    domain = [float(d) / 1000 for d in domain]

    tag_data_ = data.tag_data(tags, datetime.fromtimestamp(domain[0]), datetime.fromtimestamp(domain[1]))
    fig = plotting.Fig()
    fig.prepare_data(tag_data_, threshold=_threshold)
    data_, datamap = fig.return_data()
    window_data = fig.window_data(domain)
    plugins.emit_event('zoom_event', window_data, fig.domain)

    emit('zoom_return', dict(success=True, data=data_, datamap=datamap, domain=domain))
    return

