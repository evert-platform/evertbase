from flask import session
from flask_socketio import emit, join_room, leave_room
from .. import socketio

@socketio.on('connect', namespace='/test')
def joined():
    """Sent by clients when they enter a room.
    A status message is broadcast to all people in the room."""
    print('connected')
    emit('connected', {'msg': 'hello'})


