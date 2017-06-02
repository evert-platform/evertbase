from app import create_app, socketio_mp
from flask_uploads import UploadSet, configure_uploads, ALL
import os
import eventlet
eventlet.monkey_patch()

# Creating app
app = create_app(os.getenv('FLASK_CONFIG') or 'default')

# File upload configuration for ZIP files using flask-uploads
plugin_upload = UploadSet('plugin', ALL)
configure_uploads(app, plugin_upload)

if __name__ == '__main__':
    socketio_mp.run(app)
