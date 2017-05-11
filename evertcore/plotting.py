import pandas as pd
import json
import datetime
import numpy as np


class LttbException(Exception):
    pass


def convert_to_timestamp(x):
    return x.timestamp()


def convert_to_datetime(x):
    return datetime.datetime.fromtimestamp(x).strftime('%Y-%m-%d %H:%M:%S')


def largest_triangle_three_buckets(data, threshold):
    """
    Return a downsampled version of data.
    Parameters
    ----------
    data: list of lists/tuples
        data must be formatted this way: [[x,y], [x,y], [x,y], ...]
                                    or: [(x,y), (x,y), (x,y), ...]
    threshold: int
        threshold must be >= 2 and <= to the len of data
    Returns
    -------
    data, but downsampled using threshold
    """

    if not isinstance(threshold, int) or (0 < threshold <= 2):
        raise LttbException("threshold not well defined")

    if threshold == 0:
        return data

    if threshold >= len(data):
        return data

    else:
        data.timestamp = pd.to_datetime(data.timestamp)
        data.timestamp = data.timestamp.apply(convert_to_timestamp)
        cols = data.columns.values
        data = data.values.tolist()

        # Bucket size. Leave room for start and end data points
        every = (len(data) - 2) / (threshold - 2)

        a = 0  # Initially a is the first point in the triangle
        next_a = 0
        max_area_point = (0, 0)

        sampled = [data[0]]  # Always add the first point

        for i in range(0, threshold - 2):
            # Calculate point average for next bucket (containing c)
            avg_x = 0
            avg_y = 0
            avg_range_start = int(np.floor((i + 1) * every) + 1)
            avg_range_end = int(np.floor((i + 2) * every) + 1)
            avg_rang_end = avg_range_end if avg_range_end < len(data) else len(data)

            avg_range_length = avg_rang_end - avg_range_start
            while avg_range_start < avg_rang_end:
                avg_x += data[avg_range_start][0]
                avg_y += data[avg_range_start][1]
                avg_range_start += 1

            avg_x /= avg_range_length
            avg_y /= avg_range_length

            # Get the range for this bucket
            range_offs = int(np.floor((i + 0) * every) + 1)
            range_to = int(np.floor((i + 1) * every) + 1)

            # Point a
            point_ax = data[a][0]
            point_ay = data[a][1]

            max_area = -1

            while range_offs < range_to:
                # Calculate triangle area over three buckets
                area = np.fabs(
                    (point_ax - avg_x)
                    * (data[range_offs][1] - point_ay)
                    - (point_ax - data[range_offs][0])
                    * (avg_y - point_ay)
                ) * 0.5

                if area > max_area:
                    max_area = area
                    max_area_point = data[range_offs]
                    next_a = range_offs  # Next a is this b
                range_offs += 1

            sampled.append(max_area_point)  # Pick this point from the bucket
            a = next_a  # This a is the next a (chosen b)

        sampled.append(data[len(data) - 1])  # Always add last
        #
        sampled = pd.DataFrame(sampled, columns=cols)
        sampled.timestamp = sampled.timestamp.apply(convert_to_datetime)

        return sampled


class Fig:
    """
    Creates an instance of the Evert Fig class. This class is passed to the front end to be rendered.
    """

    def __init__(self):
        self.data = None
        self.datamap = dict()
        self.dataFrame = pd.DataFrame()

    def prepare_data(self, data, threshold=0):
        """
        Changes the input data to the correct format for plotting.
        
        Parameters
        ----------
        data: pandas.DataFrame
             Plotting data.

        Returns
        -------

        """
        data = largest_triangle_three_buckets(data, threshold)
        data.timestamp
        self.dataFrame = data
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


