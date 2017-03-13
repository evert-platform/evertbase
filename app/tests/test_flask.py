from app import create_app
import pytest
from flask import url_for
from .. import main



@pytest.fixture
def app():
    app = create_app('testing')
    return app


@pytest.fixture
def conf_app(config):
    return create_app(config)


# Class based test for testing the initial rendering of views
@pytest.mark.usefixtures('client_class')
class TestViews:

    def test_index(self):
        assert self.client.get(url_for('main.index')).status_code == 200

    # def test_plot(self):
    #     assert self.client.get(url_for('main.plot')).status_code == 200

    def test_plugins(self):
        assert self.client.get(url_for('main.plugins')).status_code == 200

    def test_uploads(self):
        assert self.client.get(url_for('main.upload')).status_code == 200

    def test_dataviewer(self):
        assert self.client.get(url_for('main.dataview')).status_code == 200


@pytest.mark.parametrize("fixture, app_config, debug, testing", [
    (conf_app, 'default', False, False),
    (conf_app, 'testing', False, True),
    (conf_app, 'development', True, False)
])
def test_debug_testing_values_for_config(fixture, app_config, debug, testing):
    test_app = fixture(app_config)
    assert test_app.debug == debug
    assert test_app.testing == testing


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
        new_name = mocker.patch('flask.request.args.get')
        cur_plant = mocker.patch('flask.request.args.get')

        new_name.return_value = 'test_name'
        cur_plant.return_value = 0

        res = main.views_async._plantnamechange()
        assert res.json['success']

    def test_deleteumit(self, mocker):
        unit = mocker.patch('flask.request.args.getlist')
        unit.return_value = ['0']
        res = main.views_async._deleteunit()
        assert res.json['success']

    def test_deleteplant(self, mocker):
        plant = mocker.patch('flask.request.args.get')
        plant.return_value = 0
        res = main.views_async._deleteplant()
        assert res.json['success']

    def test_deleteunittags(self, mocker):
        tags = mocker.patch('flask.request.args.getlist')
        tags.return_value = ['0']
        # TODO: expand test to cover different paths
        res = main.views_async._deleteunittags()
        assert res.json['success']










