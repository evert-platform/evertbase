import matplotlib.pyplot as plt
from flask_plugins import PluginManager, get_plugin_from_all
from flask import session
from zipfile import ZipFile, BadZipFile
import mpld3
from flask import jsonify, request, current_app
import pandas as pd
from . import functions as funcs
from . import main
from . import models


# this retrieves the data that needs to be plotted and returns the data that will be rendered as a figure by
# mpld3.js
@main.route('/_plotdata', methods=['GET'])
def _plotdata():
    if not current_app.testing:
        fig, ax = plt.subplots()
        filepath = request.args.get('plotdata', 0, type=str)
        plottype = request.args.get('type', 0, type=str)

        # xset = request.args.getlist('xset[]')
        # yset = request.args.getlist('yset[]')

        data_cols = ['Timestamp', filepath]
        data = pd.DataFrame(models.get_tag_data(filepath), columns=data_cols)

        # for x, y in zip(xset, yset):
        if data['Timestamp'].dtype == 'O':
            data['Timestamp'] = pd.to_datetime(data['Timestamp'])

        if plottype == 'Line':
            data.plot.line(x='Timestamp', y=filepath, ax=ax)

        elif plottype == 'Scatter':
            data.plot.line(x='Timestamp', y=filepath, lw=0, marker='.', ax=ax)

        ax.legend(loc=0)

        fig.tight_layout()
        div = mpld3.fig_to_dict(fig)
    else:
        div = None
    return jsonify(success=True, plot=div)


# this function updates the x- and y-axis select elements on the plotting page
@main.route('/_plotdetails', methods=['GET'])
def _plotdetails():

    table_key = request.args.get('plotfile', 0, type=str)
    headers = funcs.unique_headers(table_key)

    return jsonify(success=True, headers=headers)


# this functions enables the plugin selected in the enable plugin select element on the plugins page
@main.route('/_enable_plugin', methods=['GET', 'POST'])
def _enable_plugins():
    plugin = request.args.get('enableplugins', 0, type=str)
    pluginsmanager = PluginManager()
    try:
        pluginsmanager.enable_plugins([get_plugin_from_all(plugin)])
    except KeyError:
        pass
    return jsonify(success=True)


# this functions disables the plugin selected in the disable plugin select element on the plugins page
@main.route('/_disable_plugin', methods=['GET', 'POST'])
def _disable_plugins():
    plugin = request.args.get('disableplugins', 0, type=str)
    pluginsmanager = PluginManager()
    try:
        pluginsmanager.disable_plugins([get_plugin_from_all(plugin)])
    except KeyError:
        pass
    return jsonify(success=True)


# this function handles the ajax upload of plugin zip files
@main.route('/_uploadp', methods=['GET', 'POST'])
def _upload_plugins():
    success = True
    msg = None
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


# open/upload data files
@main.route('/_dataopen', methods=['GET', 'POST'])
@main.route('/_dataupload', methods=['GET', 'POST'])
def _data_handle():

    if request.method == 'POST' and 'file' in request.files:
        file = request.files['file']
        filename = file.filename.split('.')[0]
        request_path = request.path

        if request_path == '/_dataopen':
            models.Measurement_data.write_data_to_db(file, filename, 1, 0)

        elif request_path =='/_dataupload':
            models.Measurement_data.write_data_to_db(file, filename, 0, 1)

    return jsonify(success=True)