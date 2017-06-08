from app import create_app
import pytest
from flask import url_for, current_app
from flask_socketio import emit, send
from .. import restapi
from flask_socketio import SocketIO

socketio = SocketIO()


@pytest.fixture
def app():
    app = create_app('testing')
    return app


@pytest.fixture
def no_queue():
    app = create_app_test('testing')
    return app


@pytest.fixture
def conf_app(config):
    return create_app(config)
# ==================================================================================
#                                 Testing application views
# ==================================================================================


# Class based test for testing the initial rendering of views
@pytest.mark.usefixtures('client_class')
class TestViews:

    def test_index(self):
        assert self.client.get(url_for('main.index')).status_code == 200

    def test_plot(self):
        assert self.client.get(url_for('main.plot')).status_code == 200

    def test_plugins(self):
        assert self.client.get(url_for('main.plugins')).status_code == 200

    def test_uploads(self):
        assert self.client.get(url_for('main.upload')).status_code == 200

    def test_dataviewer(self):
        assert self.client.get(url_for('main.dataview')).status_code == 200


@pytest.mark.parametrize("fixture, app_config, debug, testing, message_queue", [
    (conf_app, 'default', False, False, 'amqp://guest:guest@localhost:5672//'),
    (conf_app, 'testing', False, True, None),
    (conf_app, 'development', True, False, 'amqp://guest:guest@localhost:5672//')

])
def test_debug_testing_values_for_config(fixture, app_config, debug, testing, message_queue):
    test_app = fixture(app_config)
    assert test_app.debug == debug
    assert test_app.testing == testing
    assert test_app.config['MESSAGE_QUEUE'] == message_queue

# ================================================================================
#                               Tests for restAPT endpoints
# ================================================================================


@pytest.mark.parametrize('url', [
    ('/_disable_plugin'),
    ('/_enable_plugin'),
    ('/_uploadp'),
    ('/_plantupload')
])
def test_ajax(client, url):
    res = client.get(url)
    assert res.json['success']


@pytest.mark.usefixtures('client_class', 'app')
class TestAsync:

    def test_plantupdatename(self, mocker):
        m = mocker.patch('flask.request.args.get')
        m.side_effect = ['test_name', 0]
        res = restapi.endpoints._plantnamechange()
        assert res.json['success']

    def test_deleteunit(self, mocker):
        unit = mocker.patch('flask.request.args.getlist')
        unit.return_value = ['0']
        res = restapi.endpoints._deleteunit()
        assert res.json['success']

    def test_deleteplant(self, mocker):
        plant = mocker.patch('flask.request.args.get')
        plant.return_value = 0
        res = restapi.endpoints._deleteplant()
        assert res.json['success']

    def test_deleteunittags(self, mocker):
        tags = mocker.patch('flask.request.args.getlist')
        tags.return_value = ['0']
        plant = mocker.patch('flask.request.args.get')
        plant.return_value = 0

        # TODO: expand test to cover different paths
        res = restapi.endpoints._deleteunittags()
        assert res.json['success']

    def test_unitchange(self, mocker):
        unit = mocker.patch('flask.request.args.getlist')
        unit.return_value = ['0']
        res = restapi.endpoints._unitselectchange()
        assert res.json['success']

        unit.return_value = []
        res = restapi.endpoints._unitselectchange()
        assert res.json['success']


# ==========================================================================================
#                                           Testing websockets
# ==========================================================================================

@socketio.on('test_event')
def on_test_event(data):
    emit('test_event_response', data)


@socketio.on('connect')
def on_connect():
    send('connected')


@socketio.on('custom_namespace_emit')
def on_custom_namespace_emit(data):
    emit('return_custom_namespace_emit', data, namespace='/test')


@pytest.mark.usefixtures('client_class', 'app')
class TestSocket:

    def test_connect(self, app):
        socketio.init_app(app)
        client = socketio.test_client(app)
        received = client.get_received()
        assert current_app.testing
        assert len(received) == 1
        assert received[0]['args'] == 'connected'

    def test_emit_event(self, app):
        socketio.init_app(app)
        client = socketio.test_client(app)
        client.get_received()
        client.emit('test_event', {'test': True})
        received = client.get_received()

        assert len(received) == 1
        assert len(received[0]['args']) == 1
        assert received[0]['name'] == 'test_event_response'
        assert received[0]['args'][0]['test']

    def test_emit_custom_namespace(self, app):
        socketio.init_app(app)
        client = socketio.test_client(app, namespace='/test')
        client.get_received('/test')
        client.emit('custom_namespace_emit', {'test': True})
        received = client.get_received('/test')
        assert len(received) == 1
        assert len(received[0]['args']) == 1
        assert received[0]['name'] == 'return_custom_namespace_emit'
        assert received[0]['args'][0]['test']
