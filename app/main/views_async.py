import matplotlib.pyplot as plt
from flask_plugins import PluginManager, get_plugin_from_all
from zipfile import ZipFile, BadZipFile
import mpld3
from flask import jsonify, request, current_app
import pandas as pd
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

        if filename:
            if request_path == '/_dataopen':
                models.MeasurementData.write_data_to_db(file, filename, 1, 0)

            elif request_path =='/_dataupload':
                models.MeasurementData.write_data_to_db(file, filename, 0, 1)
        else:
            pass

    return jsonify(success=True)


@main.route('/_plantchange', methods=['GET', 'POST'])
def _plantchange(json=True):

    cur_plant = request.args.get('plant', 0, type=int)
    plant_name = models.Plants.get_filtered_names(id=cur_plant)[0]
    sections = models.Sections.get_filtered_names(plant=cur_plant)
    tags = models.Tags.get_unassigned_tags(plant=cur_plant)

    if sections:
        unit_tags = models.Tags.get_filtered_names(section=sections[0][0])
        data = dict(plant_name=plant_name, sections=dict(sections),
                    tags=dict(tags), unittags=dict(unit_tags))

    else:
        data = dict(plant_name=plant_name, sections=dict(sections),
                    tags=dict(tags))
    if not json:
        return data

    else:
        return jsonify(data)


@main.route('/_plantupload', methods=['GET', 'POST'])
def _updateplantlist():
    plant = models.Plants.get_names()

    return jsonify(plants=dict(plant))


@main.route('/_plantnamechange', methods=['GET','POST'])
def _plantnamechange():

    new_name = request.args.get('newname', 0, type=str)
    cur_plant = request.args.get('plant', 0, type=int)
    models.Plants.query.filter_by(id=cur_plant).update(dict(name=new_name))
    models.db.session.commit()
    plants = models.Plants.get_names()
    return jsonify(success=True, plants=dict(plants))


@main.route('/_unitadd', methods=['GET'])
@main.route('/_unitnamechange', methods=['GET'])
def _unitschange():

    unit_name = request.args.get('unitname', 0, type=str)

    if request.path =='/_unitadd':
        cur_plant = request.args.get('plant', 0, type=int)
        models.Sections.create(name=unit_name, plant=cur_plant)
        data = _plantchange(False)
        data['cursection'] = unit_name

    else:
        cur_unit = request.args.get('unit', 0, type=int)
        models.Sections.query.filter_by(id=cur_unit).update(dict(name=unit_name))
        models.db.session.commit()
        data = _plantchange(False)
        data['cursection'] = unit_name

    return jsonify(data)

@main.route('/_unitchange', methods=['GET'])
def _unit_change():
    unit = request.args.getlist('unit[]')
    if unit:
        unittags = models.Tags.get_filtered_names(section=int(unit[0]))
        return jsonify(success=True, unittags=dict(unittags))
    else:
        return jsonify(success=True)


@main.route('/_settags')
@main.route('/_removeunittags', methods=['GET'])
def _settags():
    plant = request.args.get('plant', 0, type=int)
    cur_unit = request.args.get('unit', 0, type=int)
    tags = [int(tag) for tag in request.args.getlist('tags[]')]

    if request.path == '/_settags':
        models.Tags.assign_tag_sections(cur_unit, tags)

    else:
        models.Tags.assign_tag_sections(None, tags)

    freetags = models.Tags.get_unassigned_tags(plant=plant)
    unittags = models.Tags.get_filtered_names(section=cur_unit)

    return jsonify(freetags=dict(freetags), unittags=dict(unittags))

@main.route('/_deleteplant', methods=['GET'])
def _deletedata():

    plant = request.args.get('plant', None, type=int)
    models.Plants.delete(id=plant)
    new_plants = models.Plants.get_names()


    return jsonify(plants=new_plants)

