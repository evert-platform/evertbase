from flask_wtf import FlaskForm
from wtforms import SubmitField, FileField, SelectField, StringField
from wtforms.validators import DataRequired, required, length


# form for selecting files to upload
class FileUploadForm(FlaskForm):
    file = FileField('CSV file', validators=[DataRequired()])
    submit = SubmitField('Submit')

# from fro plant setup
class PlantSetupForm(FlaskForm):
    plant_name = StringField('Plant Name: ', validators=[required, length(max=15)])
    unit_name = StringField('Unit Name: ', validators=[required, length(max=15)])



# form for selecting data to plot
class PlotDataSelectForm(FlaskForm):
    select = SelectField('Please select file to plot.', choices='', id='text')
    selectX = SelectField('', choices='', id='plotX')
    selectY = SelectField('', choices='', id='plotY')
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


