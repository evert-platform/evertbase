from app import create_app
import os
import eventlet
from evertcore.websockets import socketio
eventlet.monkey_patch()

# Creating app
app = create_app(os.getenv('FLASK_CONFIG') or 'default')
socketio.init_app(app, message_queue=app.config['MESSAGE_QUEUE'])

if __name__ == '__main__':
    socketio.run(app, debug=True)
