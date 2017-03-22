from flask_wtf import FlaskForm
from wtforms import SubmitField, FileField, SelectField, StringField, SelectMultipleField
from wtforms.validators import DataRequired, required, length


# form for selecting files to upload
class FileUploadForm(FlaskForm):
    file = FileField('CSV file', validators=[DataRequired()])


# from fro plant setup
class PlantSetupForm(FlaskForm):
    plant_select = SelectField('Current Plant: ', choices='')
    plant_name = StringField('Plant Name: ', validators=[required, length(max=15)])
    unit_name = StringField('Unit Name: ', validators=[required, length(max=15)])
    unit_select = SelectMultipleField('Units:', choices='')
    tags = SelectMultipleField('Tags:', choices='')
    unit_tags = SelectMultipleField('Unit Tags:', choices='')


# form for selecting data to plot
class PlotDataSelectForm(FlaskForm):
    selectPlant = SelectField('Please select file to plot.', choices='', id='plotPlant')
    selectUnits = SelectMultipleField('', choices='', id='plotUnits')
    selectTags = SelectMultipleField('', choices='', id='plotTags')
    selectType = SelectField('', choices=[('Scatter', 'Scatter'), ('Line', 'Line')], id='plotType')


# form for disabling and enabling of plugins
class PluginsForm(FlaskForm):
    select_enabled = SelectField('Select plugin to disable', choices='', id='select_enabled')
    select_disabled = SelectField('Select plugin to enable', choices='', id='select_disabled')


# form for selecting data for dataviewer
class DataViewerForm(FlaskForm):
    select = SelectField('Select file to view.', choices='', id='text')
    submit = SubmitField('View')


# form for selecting plugin zip file upload
class PluginsUploadForm(FlaskForm):
    file = FileField('Select plugin to upload', validators=[DataRequired()])


