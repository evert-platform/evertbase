from flask_plugins import get_enabled_plugins, get_all_plugins
from flask import request


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
            if enabled_plugins:
                p = [plugin for plugin in enabled_plugins]

            else:
                p = [('', 'No active plugins')]

        else:
            if disabled_plugins:
                p = [plugin for plugin in disabled_plugins]

            else:
                p = [('', 'All plugins enabled')]

    else:
        p = [('', 'No plugins detected')]

    return p

def shutdown_server():
    func = request.environ.get('werkzeug.server.shutdown')
    if func is None:
        raise RuntimeError('Not running with the Werkzeug Server')
    func()