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
@main.route('/upload', methods=['GET', 'POST'])
def upload():
    filename = None
    form = FileUploadForm()
    form2 = PlantSetupForm()

    if request.method == 'POST' and 'file' in request.files:
        filename = request.files['file']
        models.write_data_to_db(filename)
        flash('{} successfully uploaded to Evert.'.format(filename.filename), category='success')

    else:
        filename = None

    return render_template('uploads.html', form=form, form2=form2)


# renders the plotting template
@main.route('/plotting', methods=['GET', 'POST'])
def plot():
    form = PlotDataSelectForm()
    files = funcs.uploaded_files()
    form.select.choices = files
    try:
        headers = funcs.unique_headers(files[0][0], initial=True)
        form.selectX.choices = headers
        form.selectY.choices = headers

    except FileNotFoundError:
        return render_template('plot.html', form=form)

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
    form.select.choices = funcs.uploaded_files()

    if form.validate_on_submit():
        filepath = form.select.data
        hdf5store = current_app.config["HDF5_STORE"]
        store = pd.HDFStore(hdf5store)
        data = store.get(filepath)
        store.close()
        titles = [{'title': key} for key in data.columns.values]
        data = data.values.tolist()

    else:
        data = None
        titles = ''

    return render_template('dataviewer.html', form=form, data=data, titles=titles)
