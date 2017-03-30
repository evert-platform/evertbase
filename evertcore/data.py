from .models import Plants, Sections, Equipment, Tags, MeasurementData


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


