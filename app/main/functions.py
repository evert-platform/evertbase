import os
import glob
from flask_plugins import get_enabled_plugins, get_all_plugins
import pandas as pd
import matplotlib.dates as mdates
import csv


def checkplugins(enabled=True):
    """
    This function is used to populate a multiselect field. It checks which plugins are enabled and disabled
     and generates the output required for the DOM element.
    :param enabled: If true a list of enabled plugins are returned else a list of disabled plugins are returned.
    :return: Output required by DOM element
    """
    plugins = [(plugin.identifier, plugin.name) for plugin in get_all_plugins()]
    enabled_plugins = [(plugin.identifier, plugin.name) for plugin in get_enabled_plugins()]
    disabled_plugins = [x for x in plugins if x not in enabled_plugins]

    if plugins:
        if enabled:
            if enabled_plugins != []:
                p = [plugin for plugin in enabled_plugins]

            else:
                p = [('', 'No active plugins')]

        else:
            if disabled_plugins != []:
                p = [plugin for plugin in disabled_plugins]

            else:
                p = [('', 'All plugins enabled')]

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


def unique_headers(file):
    """
    Get the headers for a csv file
    :param file: file path to csv file
    :return: list of headers
    """
    try:
        if os.path.basename(file).split('.')[-1] == 'h5':
            df = pd.read_hdf(file)
            fieldnames = df.columns.values
            del df

        else:
            with open(file) as f:
                fin = csv.DictReader(f, delimiter=',')
                fieldnames = fin.fieldnames
    except OSError:
        fieldnames = ['']

    return fieldnames


def date_parser(start_date, end_date):
    """
    This is a date parsing function to automatically determine the best date format to you for time-series data
    :param start_date: A datetime object of the start date
    :param end_date: A datetime object of the end date
    :return: Two DateFormatter objects of the major and minor date format respectively
    """

    delta = end_date - start_date
    days = delta.days
    seconds = delta.seconds

    if days > 365:
        major_fmt = '%Y'
        minor_fmt = '%m-%d'

    elif 1 < days < 365:
        major_fmt = '%Y-%m-%d'
        minor_fmt = '%Y-%m-%d %H:00'

    elif days == 0 and seconds > 3600:
        major_fmt = '%H:%M'
        minor_fmt = '%H:%M:%S'

    elif days == 0 and seconds < 3600:
        major_fmt = '%M:00'
        minor_fmt = '%M:%S'

    return mdates.DateFormatter(major_fmt), mdates.DateFormatter(minor_fmt)