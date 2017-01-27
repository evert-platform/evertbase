from flask_testing import TestCase
import unittest
from evert.app import create_app



class TestNotRenderTemplates(TestCase):

    def create_app(self):
        app = create_app()
        app.config['TESTING'] = True
        return app

    render_templates = False

    def test_assert_not_process_the_index_template(self):
        response = self.client.get("/")

        self.assert_template_used('index.html')


    def test_assert_not_process_the_plot_template(self):
        response = self.client.get("/plotlyplotting")

        self.assert_template_used('plot.html')


    def test_assert_not_process_the_dataviewer_template(self):
        response = self.client.get("/dataviewer")

        self.assert_template_used('dataviewer.html')



if __name__ == '__main__':
    unittest.main()