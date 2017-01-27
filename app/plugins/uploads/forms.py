from wtforms import TextAreaField
from wtforms_components import read_only
from flask_wtf import FlaskForm


class UploadedDataForm(FlaskForm):
    uploadeddata = TextAreaField("Uploaded data")

    def __init__(self, *args, **kwargs):
        super(UploadedDataForm, self).__init__(*args, **kwargs)
        read_only(self.uploadeddata)