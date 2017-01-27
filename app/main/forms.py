from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, FileField, SelectField, SelectMultipleField
from wtforms.validators import DataRequired



class UploadForm(FlaskForm):
    file = FileField('CSV file', validators=[DataRequired()])
    submit = SubmitField('Submit')


class DataSelectForm(FlaskForm):
    select = SelectField('Please select file to plot.', choices='', id='text')



class PluginsForm(FlaskForm):
    select = SelectMultipleField('')
    submit = SubmitField('Submit')

class DataViewerForm(FlaskForm):
    select = SelectField('Select file to view.', choices='', id='text')
    submit = SubmitField('View')

