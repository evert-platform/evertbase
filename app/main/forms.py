from flask_wtf import FlaskForm
from wtforms import SubmitField, FileField, SelectField
from wtforms.validators import DataRequired


class FileUploadForm(FlaskForm):
    file = FileField('CSV file', validators=[DataRequired()])
    submit = SubmitField('Submit')


class DataSelectForm(FlaskForm):
    select = SelectField('Please select file to plot.', choices='', id='text')
    selectX = SelectField('', choices='', id='plotX')
    selectY = SelectField('', choices='', id='plotY')
    selectType = SelectField('', choices=[('Scatter', 'Scatter'), ('Line', 'Line')], id='plotType')


class PluginsForm(FlaskForm):
    select_enabled = SelectField('Select plugin to disable', choices='', id='select_enabled')
    select_disabled = SelectField('Select plugin to enable', choices='', id='select_disabled')


class DataViewerForm(FlaskForm):
    select = SelectField('Select file to view.', choices='', id='text')
    submit = SubmitField('View')


class PluginsUploadForm(FlaskForm):
    file = FileField('Select plugin to upload', validators=[DataRequired()])


