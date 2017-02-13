import matplotlib.pyplot as plt
import pandas as pd
from flask import render_template, flash, get_flashed_messages, request, jsonify, current_app
from . import main
from .forms import *
from flask_plugins import PluginManager, get_plugin_from_all
import plotly.offline as offplot
from . import functions as funcs
from flask_uploads import UploadSet, DATA, configure_uploads, ALL
from zipfile import ZipFile, BadZipFile


@main.route('/', methods=['GET', 'POST'])
def index():
    return render_template('index.html')


@main.route('/upload', methods=['GET', 'POST'])
def upload():
    data = UploadSet('file', DATA)
    app = current_app
    configure_uploads(app, data)
    filename = None
    form = FileUploadForm()

    if request.method == 'POST' and 'file' in request.files:
        filename = data.save(request.files['file'])
        flash('{} successfully uploaded to Evert.'.format(filename), category='success')

    else:
        filename = None

    return render_template('uploads.html', form=form)


@main.route('/plotlyplotting', methods=['GET', 'POST'])
def plotly_plot():
    form = DataSelectForm()
    form.select.choices = funcs.uploaded_files(textbox=False)

    return render_template('plot.html', form=form)


# Async view
@main.route('/_plotdata', methods=['GET', 'POST'])
def _plotdata():
    fig, ax = plt.subplots()
    filepath = request.args.get('plotdata', 0, type=str)
    data = pd.read_csv(filepath, sep=',|;', engine='python')
    keys = data.columns.values
    ax.plot(data[keys[0]].values, data[keys[1]].values)
    ax.set_xlabel(keys[0])
    ax.set_ylabel(keys[1])
    div = offplot.plot_mpl(fig, show_link=False, output_type='div', include_plotlyjs=True, filename='kfn')

    return jsonify(plot=div)


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
        data = pd.read_csv(filepath, sep=',|;', engine='python')
        titles = [{'title': key} for key in data.columns.values]
        data = data.values.tolist()

    else:
        data = None
        titles = None

    return render_template('dataviewer.html', form=form, data=data, titles=titles)
