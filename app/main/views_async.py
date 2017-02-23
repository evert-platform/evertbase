import matplotlib.pyplot as plt
from flask_plugins import PluginManager, get_plugin_from_all
from zipfile import ZipFile, BadZipFile
import mpld3
from flask import jsonify, request, current_app
import pandas as pd
from . import functions as funcs
from . import main


# this retrieves the data that needs to be plotted and returns the data that will be rendered as a figure by
# mpld3.js
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
        if data[x].dtype == 'O':
            data[x] = pd.to_datetime(data[x])

        if plottype == 'Line':
            data.plot.line(x=x, y=y, ax=ax)

        elif plottype == 'Scatter':
            data.plot.line(x=x, y=y, lw=0, marker='.', ax=ax)

    ax.legend(loc=0)
    fig.tight_layout()
    div = mpld3.fig_to_dict(fig)
    return jsonify(plot=div)


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
    pluginsmanager.enable_plugins([get_plugin_from_all(plugin)])
    return jsonify(sucess=True)


# this functions disables the plugin selected in the disable plugin select element on the plugins page
@main.route('/_disable_plugin', methods=['GET', 'POST'])
def _disable_plugins():
    plugin = request.args.get('disableplugins', 0, type=str)
    pluginsmanager = PluginManager()
    pluginsmanager.disable_plugins([get_plugin_from_all(plugin)])
    return jsonify(success=True)


# this function handles the ajax upload of plugin zip files
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
