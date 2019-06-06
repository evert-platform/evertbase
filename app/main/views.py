from flask import render_template
from . import main
from .forms import FileUploadForm, DataViewerForm, PlotDataSelectForm, PluginsUploadForm, PluginsForm, PlantSetupForm
from . import functions as funcs
import evertcore as evert

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
    plants = evert.data.get_plant_names()
    if plants:
        form.selectPlant.choices = plants
        form.selectUnits.choices = evert.data.get_section_names(plant=plants[0][0])
        form.selectTags.choices = evert.data.get_tag_names(plant=plants[0][0])

    form.select_enabled.choices = funcs.checkplugins(enabled=True)

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
    plants = evert.data.get_plant_names()
    if plants:
        form.selectPlant.choices = plants
        form.selectUnits.choices = evert.data.get_section_names(plant=plants[0][0])
        form.selectTags.choices = evert.data.get_tag_names(plant=plants[0][0])

    return render_template('dataviewer.html', form=form)


# renders page for page shutdown
@main.route('/shutdown', methods=['GET'])
def shutdown():
    funcs.shutdown_server()
    return render_template('shutdown.html')

#
# @main.route('/reload-server/')
# def restart_server():
#     main.kill(main.getpid(), signal.SIGHUP)
#     plugins()