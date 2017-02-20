import matplotlib.pyplot as plt
import pandas as pd
from flask import render_template, flash, get_flashed_messages, request, jsonify, current_app
from . import main
from .forms import *
from flask_plugins import PluginManager, get_plugin_from_all
from . import functions as funcs
from flask_uploads import UploadSet, DATA, configure_uploads, ALL
from zipfile import ZipFile, BadZipFile
import mpld3
import re
import os


@main.route('/', methods=['GET', 'POST'])
def index():
    return render_template('index.html')


@main.route('/upload', methods=['GET', 'POST'])
def upload():
    filename = None
    form = FileUploadForm()

    if request.method == 'POST' and 'file' in request.files:
        data = UploadSet('file', DATA)
        app = current_app
        configure_uploads(app, data)
        filename = request.files['file'].filename
        data = pd.read_csv(request.files['file'])
        hdf5path = os.path.join(current_app.config['UPLOADED_FILE_DEST'], filename.split('.')[0])
        data.to_hdf('{}.h5'.format(hdf5path), key=filename)
        flash('{} successfully uploaded to Evert.'.format(filename), category='success')

    else:
        filename = None

    return render_template('uploads.html', form=form)


@main.route('/plotting', methods=['GET', 'POST'])
def plot():
    form = DataSelectForm()
    files = funcs.uploaded_files(textbox=False)
    form.select.choices = files
    try:
        headers = funcs.unique_headers(files[0][0])
        form.selectX.choices = [(header, header) for header in headers]
        form.selectY.choices = [(header, header) for header in headers]

    except FileNotFoundError:
        return render_template('plot.html', form=form)

    return render_template('plot.html', form=form)


# Async view
@main.route('/_plotdata', methods=['GET'])
def _plotdata():
    fig, ax = plt.subplots()
    filepath = request.args.get('plotdata', 0, type=str)
    filetype = os.path.basename(filepath).split('.')[-1]
    if filetype == 'h5':
        data = pd.read_hdf(filepath)

    else:
        data = pd.read_csv(filepath, sep=',|;', engine='python')

    plottype = request.args.get('type', 0, type=str)
    xset = request.args.get('xset', 0, type=str)
    yset = request.args.get('yset', 0, type=str)

    xset = re.findall(r"[\w']+", xset)
    yset = re.findall(r"[\w']+", yset)
    if len(xset) > 1:
        for x, y in zip(xset, yset):

            if plottype == 'Line' and x != '' and y != '':
                ax.plot(data[x].values, data[y].values)

            elif plottype == 'Scatter' and x != '' and y != '':
                ax.plot(data[x].values, data[y].values, '.')

    elif len(xset) == 1:
        if plottype == 'Line':
            ax.plot(data[xset].values, data[yset].values)

        elif plottype == 'Scatter':
            ax.plot(data[xset].values, data[yset].values, '.')

        ax.set_xlabel(xset[0])
        ax.set_ylabel(yset[0])

    div = mpld3.fig_to_dict(fig)
    return jsonify(plot=div)

@main.route('/_plotdetails', methods=['GET'])
def _plotdetails():

    file = request.args.get('plotfile', 0, type=str)

    headers = funcs.unique_headers(file)

    return jsonify(success=True, headers=headers)


@main.route('/plugins', methods=['GET', 'POST'])
def plugins():
    pluginsmanager = PluginManager()
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
        file = request.files['file']
        try:
            zipfile = ZipFile(file)
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
    form.select.choices = funcs.uploaded_files(textbox=False)

    if form.validate_on_submit():
        filepath = form.select.data
        filetype = os.path.basename(filepath).split('.')[-1]
        if filetype == 'h5':
            data = pd.read_hdf(filepath)

        else:
            data = pd.read_csv(filepath, sep=',|;', engine='python')

        titles = [{'title': key} for key in data.columns.values]
        data = data.values.tolist()

    else:
        data = None
        titles = ''

    return render_template('dataviewer.html', form=form, data=data, titles=titles)
