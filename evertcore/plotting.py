import pandas
import json


class Fig:
    """
    Creates an instance of the Evert Fig class. This class is passed to the front end to be rendered.
    """

    def __init__(self):
        self.data = None
        self.datamap = dict()

    def prepare_data(self, data):
        """
        Changes the input data to the correct format for plotting.
        
        Parameters
        ----------
        data: pandas.DataFrame
             Plotting data.

        Returns
        -------

        """

        _data = data.values.tolist()
        _columns = data.columns.values
        self.data = [list(_columns)] + _data

        for c in _columns:
            if c != 'timestamp':
                self.datamap[c] = 'timestamp'
        return

    def return_data(self):
        return self.data, self.datamap

    def __repr__(self, *args, **kwargs):
        return json.dumps({"data": self.data, "datamap": self.datamap})


