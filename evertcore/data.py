from .models import Plants, Sections, Equipment, Tags, MeasurementData, db


def assign_tag_sections(section, tags):
    """
    Assign tag numbers to plant sections. It can also be used to remove tags from sections by passing section as None.

    Parameters
    ----------
    section:
             ID of section tag must be assigned to.
    tags: list
         IDs of the tag which section must be assigned.
    """
    Tags.assign_tag_sections(section, tags)


def create_tags(tags_list):
    """
    Create tags and assign them to a plant.

    Parameters
    ----------
    tags_list : list
                A list of tuples containing the plant id and tag name, eg. [(plant_id, tag_name),..]

    """

    Tags.create_multiple(tags_list)


def create_unit(name, plant_id):
    """
    Adds a new unit to a plant

    Parameters
    ----------
    name : str
           Name of the unit
    plant_id: int
              ID of plant to which unit must be added

    Returns
    -------

    """
    Sections.create(name=name, plant=plant_id)


def delete_plant(plant_id):
    """
    Delete plant and all of its data.

    Parameters
    ----------
    plant_id : int
         ID of plant to be deleted

    Returns
    -------
    list
        List of the remaining plants and ids, eg. [(id, plant_name),..]

    """
    Plants.delete(id=plant_id)
    return Plants.get_names()


def delete_sections(ids):
    """
    Delete sections and their corresponding tag data.

    Parameters
    ----------
    ids: list
         IDs of sections to be deleted

    Returns
    -------
    list
        List of the remaining section and ids, eg. [(id, section_name),..]

    """
    Sections.delete_multiple_by_id(ids)
    return Sections.get_names()


def delete_tags(ids, plant, section=None):
    """

    Parameters
    ----------
    ids : list
          IDs of tags to be deleted.
    plant : int
            ID of the current plant
    section
            int, optional. The default is None. The return will then be of all tags of the current plant.

    Returns
    -------
    list
        List containing the remaining tag ids and names, eg. [(id, name),..]

    """

    Tags.delete_multiple_by_id(ids)

    if section:
        tags = Tags.get_filtered_names(plant=plant, section=section)

    else:
        tags = Tags.get_filtered_names(plant=plant)

    return tags


def get_tag_names(**kwargs):
    """
    Get the names and ids of the tags currently in the database. If **kwargs are not specified all names will be
    returned.

    Parameters
    ----------
    kwargs
            Filters to filter the data by.

    Returns
    -------
    list
        List of tuples int the following order (id, name)
    """

    if kwargs:
        if 'key' and 'values' in kwargs:
            names = Tags.get_filtered_names_in(kwargs['key'], kwargs['values'])

        else:
            names = Tags.get_filtered_names(**kwargs)

    else:
        names = Tags.get_names()

    return names


def get_plant_names(**kwargs):
    """
    Gets the plants currently in the application
    Parameters
    ----------
    kwargs
          Arguments for additional filtering
    Returns
    -------
    list
        List of tuples with plant ids and names, eg. [(id, name),..]

    """

    if kwargs:

            plants = Plants.get_filtered_names(**kwargs)

    else:
        plants = Plants.get_names()

    return plants


def get_section_names(**kwargs):
    """

    Parameters
    ----------
    kwargs
          Filters for section names

    Returns
    -------
    list
        Names of section in a list of tuples, ie. [(id, name),..]

    """

    if kwargs:
        sections = Sections.get_filtered_names(**kwargs)

    else:
        sections = Sections.get_names()

    return sections


def get_unassigned_tags(**kwargs):
    """
    Get all the tags that are not assigned to a section.

    Parameters
    ----------
    kwargs
            Arguments for further filtering. 'plant' is the only other valid option. The keyword argument can only be set
            equal to an int.

    Returns
    -------
    list
        List of tuples containing the tag_id and name.
    """
    return Tags.get_unassigned_tags(**kwargs)


def tag_data(tag_ids):
    """
    Retrieve tag data based on the given tag ids.

    Parameters
    ----------
    tag_ids : list
            A list containing the ids of the tags to be queried from database

    Returns
    -------
    list
        List of row data tuples containing the tag data in the following format (timestamp, tag_value, tag_id).

    """
    tag_ids = map(int, tag_ids)
    data = MeasurementData.get_tag_data_in(tag_ids)

    return data


def update_plant_name(plant_id, name):
    """
    Updates a plant's current name.
    Parameters
    ----------
    plant_id : int
               ID of plant to be updated
    name : str
           New name of plant

    Returns
    -------
    list
        List of new plant names

    """

    Plants.query.filter_by(id=plant_id).update(dict(name=name))
    db.session.commit()
    return Plants.get_names()


def update_section_name(section_id, name):
    """
    Updates section name.

    Parameters
    ----------
    section_id : int
                 ID for the section to be updated
    name : str
           Name of plant

    Returns
    -------

    """
    Sections.query.filter_by(id=section_id).update(dict(name=name))
    db.session.commit()


def upload_file(file_name, plant_name, opened, upload):
    """

    Parameters
    ----------
    file_name : str
               Name of the file to be uploaded.
    plant_name : str
                The name of the plant the file will be linked to.
    opened : bool
             Indicates if a data set is opened or uploaded into the application
    upload : bool
             Indicates if a data set is opened or uploaded into the application

    Returns
    -------
    bool
        indicates the success status of the upload

    """

    success = MeasurementData.upload_file(file_name, plant_name, opened, upload)
    return success
