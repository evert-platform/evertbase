from app import create_app
import pytest
from flask import url_for


@pytest.fixture
def app():
    app = create_app('testing')
    return app


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






