from flask_socketio import emit, SocketIO

socketio_mp = SocketIO(message_queue='amqp://guest:guest@localhost:5672//')
print(socketio_mp)



@socketio_mp.on('connected', namespace='/test')
def joined():
    """Sent by clients when they enter a room.
    A status message is broadcast to all people in the room."""
    print('connected')
    emit('connected', {'msg': 'hello'})


@socketio_mp.on('zoomed', namespace='/test')
def zoom_event(data):


    print('zoom')
    print(data)
    emit('zoom_return', {'msg': 'zoom_return'})
    return

