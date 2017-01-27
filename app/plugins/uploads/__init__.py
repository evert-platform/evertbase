from flask_plugins import connect_event
from flask import Blueprint, render_template_string, flash
from Evert.manage import AppPlugin
from .forms import UploadedDataForm
import os
import glob


__plugin__ = "UploadedData"

uploads = Blueprint('uploads', __name__, template_folder='templates')

def uploaded_files(string=True):
    files = glob.glob('app/static/uploads/*')
    up = ''
    if string:
        if files:
            for file in files:
                up += (os.path.basename(file) + '\n')
        else:
            up = 'No files uploaded'

    if not string:
        if files:
            up = [(file, os.path.basename(file)) for file in files]
        else:
            up = 'No files'
    return up


def show_uploads():
    form = UploadedDataForm()
    form.uploadeddata.data = uploaded_files()
    return render_template_string(
        """
        {% import "bootstrap/wtf.html" as wtf %}
        {{ wtf.quick_form(form2) }}
        """
        , form2=form)

def test():
    return flash("it works", "success")



class UploadedData(AppPlugin):

    def setup(self):
        self.register_blueprint(uploads, url_prefix="/uploads")

        connect_event("uploads", show_uploads)
