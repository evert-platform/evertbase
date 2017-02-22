import matplotlib.pyplot as plt
import pandas as pd
from flask import render_template, flash, request, jsonify, current_app
from . import main
from .forms import FileUploadForm, DataViewerForm, DataSelectForm, PluginsUploadForm, PluginsForm
from flask_plugins import PluginManager, get_plugin_from_all
from . import functions as funcs
from zipfile import ZipFile, BadZipFile
import mpld3


@main.route('/', methods=['GET', 'POST'])
def index():
    return render_template('index.html')


@main.route('/upload', methods=['GET', 'POST'])
def upload():
    filename = None
    form = FileUploadForm()

    if request.method == 'POST' and 'file' in request.files:
        filename = request.files['file'].filename.split('.')[0]
        data = pd.read_csv(request.files['file'])
        store = pd.HDFStore(current_app.config['HDF5_STORE'])
        store.put(filename, data)
        flash('{} successfully uploaded to Evert.'.format(filename), category='success')

    else:
        filename = None

    return render_template('uploads.html', form=form)


@main.route('/plotting', methods=['GET', 'POST'])
def plot():
    form = DataSelectForm()
    files = funcs.uploaded_files()
    form.select.choices = files
    try:
        headers = funcs.unique_headers(files[0][0], initial=True)
        form.selectX.choices = headers
        form.selectY.choices = headers

    except FileNotFoundError:
        return render_template('plot.html', form=form)

    return render_template('plot.html', form=form)


# Async view
@main.route('/_plotdata', methods=['GET'])
def _plotdata():
    fig, ax = plt.subplots()
    filepath = request.args.get('plotdata', 0, type=str)

    hdf5store = current_app.config["HDF5_STORE"]
    store = pd.HDFStore(hdf5store)
    data = store.get(filepath)
    store.close()

    plottype = request.args.get('type', 0, type=str)
    xset = request.args.getlist('xset[]')
    yset = request.args.getlist('yset[]')

    for x, y in zip(xset, yset):
        if plottype == 'Line':

            data.plot.line(x=x, y=y, ax=ax)

        elif plottype == 'Scatter':
            data.plot.line(x=x, y=y, lw=0, marker='.', ax=ax)

    if len(xset) == 1:
        ax.set_xlabel(xset[0])
        ax.set_ylabel(yset[0])

    ax.legend(loc=0)
    fig.tight_layout()
    div = mpld3.fig_to_dict(fig)
    return jsonify(plot=div)


@main.route('/_plotdetails', methods=['GET'])
def _plotdetails():

    table_key = request.args.get('plotfile', 0, type=str)
    headers = funcs.unique_headers(table_key)

    return jsonify(success=True, headers=headers)


@main.route('/plugins', methods=['GET', 'POST'])
def plugins():
    form = PluginsForm()
    form2 = PluginsUploadForm()
    form.select_disabled.choices = funcs.checkplugins(enabled=False)
    form.select_enabled.choices = funcs.checkplugins(enabled=True)
    return render_template('plugins.html', form=form, form2=form2)


# Async view
@main.route('/_enable_plugin', methods=['GET', 'POST'])
def _enable_plugins():
    plugin = request.args.get('enableplugins', 0, type=str)
    pluginsmanager = PluginManager()
    pluginsmanager.enable_plugins([get_plugin_from_all(plugin)])
    return jsonify(sucess=True)


# Async view
@main.route('/_disable_plugin', methods=['GET', 'POST'])
def _disable_plugins():
    plugin = request.args.get('disableplugins', 0, type=str)
    pluginsmanager = PluginManager()
    pluginsmanager.disable_plugins([get_plugin_from_all(plugin)])
    return jsonify(success=True)


# Async view
@main.route('/_uploadp', methods=['GET', 'POST'])
def _upload_plugins():
    if request.method == 'POST':
        zip_file = request.files['file']
        try:
            zipfile = ZipFile(zip_file)
            zipfile.extractall(current_app.config['UPLOADED_PLUGIN_DEST'])
            success = True
            msg = 'Success: Plugin uploaded successfully'

        except BadZipFile:
            success = False
            msg = 'Error: Ensure file is a zip file'

    return jsonify(success=success, msg=msg)


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
