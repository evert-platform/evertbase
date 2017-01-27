import os
import glob
from flask_plugins import get_all_plugins


def checkplugins(textbox=True):
    """
    This function is used to populate select fields and textbox fields. It checks which plugins are installed
    and generates the output required for the DOM element.
    :param textbox: Defualt value of True. Set to False if a select field needs to be populated.
    :return: Output required by DOM element
    """
    plugins = get_all_plugins()
    p = ''
    if plugins:
        if textbox:
            for plugin in plugins:
                p += (plugin.name + '\n')

        elif not textbox:
            p = [(plugin.identifier, plugin.name) for plugin in plugins]

    else:
        p = None

    return p


def uploaded_files(textbox=True):
    """
    This function is used to populate select fields and textbox fields. It checks which files are uploaded
    and generates the output required for the DOM element.
    :param textbox: Defualt value of True. Set to False if a select field needs to be populated.
    :return: Output required by DOM element
    """
    files = glob.glob('app/static/uploads/*')
    up = ''
    if textbox:
        if files:
            for file in files:
                up += (os.path.basename(file) + '\n')
        else:
            up = 'No files uploaded'

    if not textbox:
        if files:
            up = [(file, os.path.basename(file)) for file in files]
        else:
            up = [('No files uploaded', 'No files uploaded')]
    return up
