from flask_testing import TestCase
import unittest
from app import create_app



class TestNotRenderTemplates(TestCase):

    def create_app(self):
        app = create_app()
        app.config['TESTING'] = True
        return app

    render_templates = False

    def test_assert_route_index_template(self):
        response = self.client.get("/")

        self.assert_template_used('index.html')


    def test_assert_route_plot_template(self):
        response = self.client.get("/plotlyplotting")

        self.assert_template_used('plot.html')


    def test_assert_route_dataviewer_template(self):
        response = self.client.get("/dataviewer")

        self.assert_template_used('dataviewer.html')

    def test_assert_route_uploads_template(self):
        response = self.client.get("/upload")

        self.assert_template_used('uploads.html')

    def test_assert_route_plugins_template(self):
        response = self.client.get("/plugins")

        self.assert_template_used('plugins.html')



if __name__ == '__main__':
    unittest.main()