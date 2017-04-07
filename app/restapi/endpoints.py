from flask_plugins import PluginManager, get_plugin_from_all
from zipfile import ZipFile, BadZipFile
from flask import jsonify, request, current_app
import pandas as pd
from . import restapi
import evertcore as evert
from datetime import datetime


# this retrieves the data that needs to be plotted and returns the data that will be rendered as a figure by
# mpld3.js
@restapi.route('/_plotdata', methods=['GET'])
def _plotdata():
    tags = request.args.getlist('tags[]')
    tag_data = pd.DataFrame(evert.data.tag_data(tags))
    tag_names = dict(evert.data.get_tag_names(key='id', values=map(int, tags)))
    tag_data.tag = [tag_names[key] for key in tag_data['tag'].values]
    tag_data = tag_data.pivot_table(index='timestamp', columns='tag')
    tag_data.columns = tag_data.columns.droplevel().rename(None)
    tag_data = tag_data.reset_index()
    data = tag_data.values.tolist()
    columns = tag_data.columns.values
    plot_data = [list(columns)] + data

    return jsonify(success=True, data=plot_data)


# this functions enables the plugin selected in the enable plugin select element on the plugins page
@restapi.route('/_enable_plugin', methods=['GET', 'POST'])
def _enable_plugins():
    plugin = request.args.get('enableplugins', 0, type=str)
    pluginsmanager = PluginManager()
    try:
        pluginsmanager.enable_plugins([get_plugin_from_all(plugin)])
    except KeyError:
        pass
    return jsonify(success=True)


# this functions disables the plugin selected in the disable plugin select element on the plugins page
@restapi.route('/_disable_plugin', methods=['GET', 'POST'])
def _disable_plugins():
    plugin = request.args.get('disableplugins', 0, type=str)
    pluginsmanager = PluginManager()
    try:
        pluginsmanager.disable_plugins([get_plugin_from_all(plugin)])
    except KeyError:
        pass
    return jsonify(success=True)


# this function handles the ajax upload of plugin zip files
@restapi.route('/_uploadp', methods=['GET', 'POST'])
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
@restapi.route('/_dataopen', methods=['GET', 'POST'])
@restapi.route('/_dataupload', methods=['GET', 'POST'])
def _data_handle():
    success = None
    if request.method == 'POST' and 'file' in request.files:
        file = request.files['file']
        plant_name = file.filename.split('.')[0]
        request_path = request.path

        if plant_name:
            if request_path == '/_dataopen':
                success = evert.data.upload_file(file, plant_name, True, False)

            elif request_path == '/_dataupload':
                success = evert.data.upload_file(file, plant_name, False, True)
        else:
            pass

    return jsonify(success=success)


@restapi.route('/_plantchangesetup', methods=['GET', 'POST'])
def _plantchange(json=True):
    cur_plant = request.args.get('plant', None, type=int)
    if cur_plant:

        plant_name = evert.data.get_plant_names(id=cur_plant)[0]
        sections = evert.data.get_section_names(plant=cur_plant)
        tags = evert.data.get_unassigned_tags(plant=cur_plant)
        all_tags = evert.data.get_tag_names(plant=cur_plant)

        if sections:
            unit_tags = evert.data.get_tag_names(section=sections[0][0])
            data = dict(success=True, plant_name=plant_name, sections=dict(sections),
                        tags=dict(tags), unittags=dict(unit_tags), alltags=dict(all_tags))

        else:
            data = dict(success=True, plant_name=plant_name, sections=dict(sections),
                        tags=dict(tags), alltags=dict(all_tags))
    else:
        data = dict(success=False)

    if not json:
        return data

    else:
        return jsonify(data)

@restapi.route('/_plantchangemanage')
def _plantchangemanage():
    cur_plant = request.args.get('plantDataManage', None, type=int)
    if cur_plant:

        plant_name = evert.data.get_plant_names(id=cur_plant)
        sections = evert.data.get_section_names(plant=cur_plant)
        tags = evert.data.get_unassigned_tags(plant=cur_plant)
        all_tags = evert.data.get_tag_names(plant=cur_plant)

        if sections:
            unit_tags = evert.data.get_tag_names(section=sections[0][0])
            data = dict(success=True, plant_name=plant_name[0], sections=dict(sections),
                        tags=dict(tags), unittags=dict(unit_tags), alltags=dict(all_tags))

        else:
            data = dict(success=True, plant_name=plant_name, sections=dict(sections),
                        tags=dict(tags), alltags=dict(all_tags))
    else:
        data = dict(success=False)

    return jsonify(data)



@restapi.route('/_plantupload', methods=['GET', 'POST'])
def _updateplantlist():
    plant = evert.data.get_plant_names()

    return jsonify(success=True, plants=dict(plant))


@restapi.route('/_plantnamechange', methods=['GET', 'POST'])
def _plantnamechange():
    # getting request args
    new_name = request.args.get('plantName', 0, type=str)
    cur_plant = request.args.get('plant', 0, type=int)
    # Updating plant names
    plants = evert.data.update_plant_name(cur_plant, new_name)
    return jsonify(success=True, plants=dict(plants))


@restapi.route('/_unitadd', methods=['GET'])
def _unitsadd():

    unit_name = request.args.get('unitName', 0, type=str)
    cur_plant = request.args.get('plant', 0, type=int)
    evert.data.create_unit(unit_name, cur_plant)
    data = _plantchange(False)
    data['cursection'] = unit_name

    return jsonify(data)


@restapi.route('/_unitnamechange', methods=['GET'])
def _unitchangename():
    unit_name = request.args.get('unitName', 0, type=str)
    cur_unit = request.args.getlist('units[]')[0]
    evert.data.update_section_name(int(cur_unit), unit_name)
    data = _plantchange(False)
    data['cursection'] = unit_name
    data['success'] = True
    return jsonify(data)


@restapi.route('/_unitchange', methods=['GET'])
def _unitselectchange():

    cur_plant = request.args.get('plant', 0, type=int)
    unit = request.args.getlist('units[]')

    if unit:
        if len(unit) <= 1:
            unittags = evert.data.get_tag_names(section=int(unit[0]))

        else:
            units = list(map(int, unit))
            unittags = evert.data.get_tag_names(key='section', values=units)
        return jsonify(success=True, unittags=dict(unittags))
    else:
        all_tags = evert.data.get_tag_names(plant=cur_plant)
        return jsonify(success=True, unittags=None, alltags=dict(all_tags))

@restapi.route('/_unitchangedatamanage', methods=['GET'])
def _unitdatamanagechange():

    unit = request.args.getlist('unitDataManage[]')
    if unit:
        if len(unit) <= 1:
            unittags = evert.data.get_tag_names(section=int(unit[0]))

        else:
            units = list(map(int, unit))
            unittags = evert.data.get_tag_names(key='section', values=units)

        return jsonify(success=True, unittags=dict(unittags))
    else:
        return jsonify(success=True, unittags=None)

@restapi.route('/_settags')
@restapi.route('/_removeunittags', methods=['GET'])
def _settags():
    # accessing request variables
    plant = request.args.get('plant', 0, type=int)
    cur_unit = int(request.args.getlist('units[]')[0])
    # mapping string values to integer values
    tags = map(int, request.args.getlist('tags[]'))
    selected_unittags = map(int, request.args.getlist('unitTags[]'))

    if request.path == '/_settags':
        evert.data.assign_tag_sections(cur_unit, tags)

    else:
        evert.data.assign_tag_sections(None, selected_unittags)
    # Get required tag data
    freetags = evert.data.get_unassigned_tags(plant=plant)
    unittags = evert.data.get_tag_names(section=cur_unit)
    return jsonify(freetags=dict(freetags), unittags=dict(unittags))


@restapi.route('/_deleteplant', methods=['GET'])
def _deleteplant():
    # getting request args
    plant = request.args.get('plant', None, type=int)
    # deleting plant and retrieving remaining plants
    remaining_plants = evert.data.delete_plant(plant)

    return jsonify(success=True, plants=dict(remaining_plants))


@restapi.route('/_deleteunit', methods=['GET'])
def _deleteunit():
    # getting request args
    units = request.args.getlist('unitDataManage[]')
    # deleting and retrieving remaining units
    new_units = evert.data.delete_sections(units)

    return jsonify(success=True, units=dict(new_units))


@restapi.route('/_deleteunittags', methods=['GET'])
@restapi.route('/_deletetags', methods=['GET'])
def _deleteunittags():
    # current plant
    plant = request.args.get('plant', None, type=int)
    if request.path == '/_deleteunittags':
        # Current unit and tags
        unit = int(request.args.getlist('unitDataManage[]')[0])
        unit_tags = request.args.getlist('unitTagsDataManage[]')
        data = evert.data.delete_tags(unit_tags, plant, unit)

    else:
        # current tags
        tags = request.args.getlist('tagsDataManage[]')
        data = evert.data.delete_tags(tags, plant)

    return jsonify(success=True, data=dict(data))


@restapi.route('/_viewdata')
def _viewdata():

    tags = request.args.getlist('tags[]')
    tag_data = pd.DataFrame(evert.data.tag_data(tags))
    tag_names = dict(evert.data.get_tag_names(key='id', values=map(int, tags)))
    tag_data.tag = [tag_names[key] for key in tag_data['tag'].values]
    tag_data = tag_data.pivot_table(index='timestamp', columns='tag')
    tag_data.columns = tag_data.columns.droplevel().rename(None)
    tag_data = tag_data.reset_index()
    data = tag_data.values.tolist()
    columns = [{'title': key} for key in tag_data.columns]

    return jsonify(success=True, data=data, headers=columns)


@restapi.route('/_daterange')
def _daterange():
    domain = request.args.getlist('domain[]')
    tags = request.args.getlist('ids[]')
    domain = [float(d)/1000 for d in domain]

    tag_data = pd.DataFrame(evert.data.tag_data(tags, datetime.fromtimestamp(domain[0]), datetime.fromtimestamp(domain[1])))
    tag_names = dict(evert.data.get_tag_names(key='id', values=map(int, tags)))
    tag_data.tag = [tag_names[key] for key in tag_data['tag'].values]
    tag_data = tag_data.pivot_table(index='timestamp', columns='tag')
    tag_data.columns = tag_data.columns.droplevel().rename(None)
    tag_data = tag_data.reset_index()
    data = tag_data.values.tolist()
    columns = tag_data.columns.values
    plot_data = [list(columns)] + data

    return jsonify(success=True, data=plot_data)