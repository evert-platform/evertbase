import pandas as pd
from flask import render_template, flash, request, current_app
from . import main
from .forms import FileUploadForm, DataViewerForm, PlotDataSelectForm, PluginsUploadForm, PluginsForm, PlantSetupForm
from . import functions as funcs
from . import models


# Renders the main index template
@main.route('/', methods=['GET', 'POST'])
def index():
    return render_template('index.html')


# Renders the file uploads template
@main.route('/data', methods=['GET', 'POST'])
def upload():
    form = FileUploadForm()
    form2 = PlantSetupForm()

    return render_template('uploads.html', form=form, form2=form2)


# renders the plotting template
@main.route('/plotting', methods=['GET', 'POST'])
def plot():
    form = PlotDataSelectForm()
    form.select.choices = models.get_tag_names()

    return render_template('plot.html', form=form)


# renders the plugins page template
@main.route('/plugins', methods=['GET', 'POST'])
def plugins():
    form = PluginsForm()
    form2 = PluginsUploadForm()
    form.select_disabled.choices = funcs.checkplugins(enabled=False)
    form.select_enabled.choices = funcs.checkplugins(enabled=True)
    return render_template('plugins.html', form=form, form2=form2)


# renders the dataview template
@main.route('/dataviewer', methods=['GET', 'POST'])
def dataview():
    form = DataViewerForm()
    form.select.choices = models.Tags.get_tags()

    if form.validate_on_submit():
        filepath = form.select.data
        data = pd.DataFrame(models.MeasurementData.get_tag_data(tag_id=int(filepath)))
        titles = [{'title': key} for key in data.columns.values]
        data = data.values.tolist()

    else:
        data = None
        titles = ''

    return render_template('dataviewer.html', form=form, data=data, titles=titles)


