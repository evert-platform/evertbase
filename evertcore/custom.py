from dirsync import sync
import logging

_log = logging.getLogger(__name__)
_log.setLevel(logging.INFO)


def folder_sync(source, target, two_way=True, inverse=False, exclude_patterns=None):
    """
    Syncs the items of two different folders
    
    Parameters
    ----------
    source: str
            Path to source folder.
    target: str
            Path to target folder.
    two_way: bool, default is True.
             If True contents are copied both ways, if False contents are copied only from source to target.
            
    inverse: bool, default is False.
            If True data is copied from target to source. Cannot be True if two_way is True.
    exclude_patterns: list(str)
            Regex patterns of folders and file to exclude from copy. Default patters are ["__pycache__", ".idea"]. 

    Returns
    -------

    """

    _exclude_patterns = ['__pycache__*', '.idea']
    if exclude_patterns:
        if not isinstance(exclude_patterns, list):
            raise TypeError('Input of type: list expected for argument: exclude_patterns, instead got {}'.format(
                type(exclude_patterns)))

        _exclude_patterns += exclude_patterns

    if not isinstance(two_way, bool):
        TypeError('Input of type: bool expected for argument: two_way, instead got {}'.format(type(two_way)))
    if not isinstance(inverse, bool):
        TypeError('Input of type: bool expected for argument: inverse, instead got {}'.format(type(inverse)))
    if not isinstance(source, str):
        TypeError('Input of type: str expected for argument: source, instead got {}'.format(type(source)))
    if not isinstance(target, str):
        TypeError('Input of type: str expected for argument: target, instead got {}'.format(type(target)))
    if two_way and inverse:
        raise ValueError('two_way must be False if inverse is True')

    if two_way:
        sync(source, target, 'sync', logger=_log, exclude=_exclude_patterns, create=True)
        sync(target, source, 'sync', logger=_log, exclude=_exclude_patterns, create=True)

    elif not two_way:
        sync(source, target, 'sync', logger=_log, exclude=_exclude_patterns, create=True)

    elif not two_way and inverse:
        sync(target, source, 'sync', logger=_log, exclude=_exclude_patterns, create=True)
    return


def sync_plugin_folder(app):
    """
    Syncs the plugin folder  in documents with the Evert Core plugins folder.
    Parameters
    ----------
    app:
        Flask app instance
        
    Returns
    -------

    """

    docplugins = app.config['USER_PLUGINS']
    baseplugindir = app.config['UPLOADED_PLUGIN_DEST']

    folder_sync(docplugins, baseplugindir)
    return

