import pandas as pd
from scipy.signal import savgol_filter
import numpy as np
import copy

# TODO: Rename and refactor variables to use proper names
# TODO: Move filtering of dataframe to savgol plugin

def _check_constant_(_lst):
    return all(round(x, 6) == round(_lst[0], 6) for x in _lst)


def _remove_constants_(_dataframe, _headers):
    for i, h in enumerate(_headers):
        _lst = _dataframe[h].as_matrix()
        if _check_constant_(_lst):
            del _dataframe[h]
            del _headers[i]
    return _dataframe, _headers


def _filter_df_(_dataframe):
    __headers = list(_dataframe)
    arr_new__, _headers = _remove_constants_(_dataframe, __headers)
    arr_new_ = savgol_filter(arr_new__, 11, 1, axis=0)
    dataframe_new = _arr_to_df_(arr_new_, _headers)
    return dataframe_new, _headers


def _arr_to_df_(_arr, _headings):
    dfdict = {}
    for i, h in enumerate(_headings):
        dfdict[h] = _arr[:, i]
    # dfdict = dict(zip(headings, arr)) found this method, but having issues slicing arr in one liner
    DF = pd.DataFrame(dfdict)
    return DF


def _global_min_(_dataframe):
    points = []
    headers = list(_dataframe)
    min_vals = _dataframe.min()
    min_index = _dataframe.idxmin(0)

    for i, h in enumerate(headers):
        points.append([h, min_index[h], min_vals[h], 'Global Minimum'])

    return points


def _global_max_(_dataframe):
    points = []
    headers = list(_dataframe)
    max_vals = _dataframe.max()
    max_index = _dataframe.idxmax(0)

    for i, h in enumerate(headers):
        points.append([h, max_index[h], max_vals[h], 'Global Maximum'])

    return points


def filter_peaks(_lst, peak_width, width):
    lst = []
    features = []
    _container_ = []

    for i, v in enumerate(_lst):

        if i == 0:
            _container_.append(v)

        if i > 0:

            if _lst[i][0] - _lst[i - 1][0] < width:
                _container_.append(v)

            else:
                if len(_container_) != 0:
                    lst.append(_container_)
                _container_ = []

    for i, v in enumerate(lst):

        temp = np.array(v)

        if len(temp[:, 1]) > peak_width:
            if temp[:, 2][0] == 'max':
                _max_ = float(max(temp[:, 1]))
                index = temp[:, 0][np.argmax(temp[:, 1])]
                features.append([index, _max_, 'Local Maximum'])
            elif temp[:, 2][0] == 'min':
                _min_ = float(min(temp[:, 1]))
                index = temp[:, 0][np.argmin(temp[:, 1])]
                features.append([index, _min_, 'Local Minimum'])

    return features


def moving_filter(__vals, _threshold, width, peak_width):
    lst = []

    for i, v in enumerate(__vals):
        if width <= i <= len(__vals) - width:
            scope = __vals[i - width: i + width]

            std_dev = np.std(scope)
            avg = sum(scope) / len(scope)

            if v > scope[0] and v > scope[-1]:

                if v > avg + std_dev * _threshold:
                    lst.append([i, v, 'max'])

            elif v < scope[0] and v < scope[-1]:

                if v < avg - std_dev * _threshold:
                    lst.append([i, v, 'min'])

    _lst = filter_peaks(lst, peak_width, width)
    return _lst


def _median_(_dataframe):
    points = []
    headers = list(_dataframe)
    median_vals = _dataframe.median()
    for i, h in enumerate(headers):
        points.append([h, 'line', median_vals[h], 'Median'])
    return points


def _mean_(_dataframe):
    points = []
    headers = list(_dataframe)
    mean_vals = _dataframe.mean()
    for i, h in enumerate(headers):
        points.append([h, 'line', mean_vals[h], 'Mean'])
    return points


def extract_features(__dataframe):
    tindex = [i for i in range(len(__dataframe))]
    features = []
    headers = list(__dataframe)
    DF_nostamp = copy.copy(__dataframe)
    del DF_nostamp[headers[0]]
    del (headers[0])

    """
    I might have to add a function to remove the timestamp from data,
    since it could be the case that it is parsed through from Evert.
    This is quick and easy (and essentially done above).
    
    Also, this library assumes a continuous dataframe is given as input.
    """

    __dataframe_filtered, headers = _filter_df_(__dataframe)

    for i in headers:
        minmax = moving_filter(__dataframe[i].as_matrix().tolist(), 2, 150, 3)
        for j in range(len(minmax)):
            minmax[j].insert(0, i)
        features += minmax

    features += _global_max_(__dataframe)
    features += _global_min_(__dataframe)
    features += _median_(__dataframe)
    features += _mean_(__dataframe)

    return features, headers, tindex, __dataframe_filtered
