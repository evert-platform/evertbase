from flask_socketio import emit, SocketIO
from datetime import datetime

from . import data, plotting, plugins

socketio = SocketIO()

_threshold = 500


@socketio.on('connect', namespace='/test')
def joined():
    print('Socket connected')


@socketio.on('zoom_event', namespace='/test')
def zoom_event(socket_data):

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
    data_ = fig.return_data()
    emit('zoom_return', dict(success=True, data=data_))

    return


@socketio.on('update_plugins_event', namespace='/test')
def update_plugin_data(socket_data):
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
    data_ = fig.window_data(socket_data['domain'])
    plugins.emit_event('zoom_event', data_, fig.domain, socket_data['axisMap'])
    return


@socketio.on('add_on_event', namespace='/test')
def addon_event(socket_data):
    tags = socket_data['ids']
    name = socket_data['name']
    domain = socket_data['domain']

    try:
        tmin = datetime.strptime(domain[0], '%Y-%m-%d %H:%M:%S.%f')
    except ValueError:
        tmin = datetime.strptime(domain[0], '%Y-%m-%d %H:%M:%S')  # Does not contain milliseconds

    try:
        tmax = datetime.strptime(domain[1], '%Y-%m-%d %H:%M:%S.%f')
    except ValueError:
        tmax = datetime.strptime(domain[1], '%Y-%m-%d %H:%M:%S')  # Does not contain milliseconds

    tag_data_ = data.tag_data(tags, tmin, tmax)
    plugins.emit_event('add_on_event', tag_data_, name)
    emit('add_on_return', dict(msg='addon return data'))
    return

