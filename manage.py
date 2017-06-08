from app import create_app
from flask_uploads import UploadSet, configure_uploads, ALL
import os
import eventlet
from evertcore.websockets import socketio
eventlet.monkey_patch()

# Creating app
app = create_app(os.getenv('FLASK_CONFIG') or 'default')

# File upload configuration for ZIP files using flask-uploads
plugin_upload = UploadSet('plugin', ALL)
configure_uploads(app, plugin_upload)

socketio.init_app(app, message_queue=app.config['MESSAGE_QUEUE'])

if __name__ == '__main__':
    socketio.run(app)
