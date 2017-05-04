from copy import deepcopy

import pandas as pd
from scipy.signal import savgol_filter


def _arr_to_stream_(filtered_data, timestamps, headers):
    _stream_ = []
    _col_ = []
    for i, v in enumerate(headers):
        _col_ = [['timestamp', v]]
        _col_vals_ = list(map(list, list(zip(timestamps, filtered_data[:, i]))))  # This seems too complex, but it works
        _col_ += _col_vals_
        _stream_.append(_col_)
    return _stream_


def _remove_constants_(_dataframe, _headers):
    for i, h in enumerate(_headers):
        _lst = _dataframe[h].as_matrix()
        if _check_constant_(_lst):
            del _dataframe[h]
            del _headers[i]
    return _dataframe, _headers


def _arr_to_df_(_arr, _headings):
    dfdict = {}
    for i, h in enumerate(_headings):
        dfdict[h] = _arr[:, i]
    # dfdict = dict(zip(headings, arr)) found this method, but having issues slicing arr in one liner
    DF = pd.DataFrame(dfdict)
    return DF


def _check_constant_(_lst):
    return all(round(x, 6) == round(_lst[0], 6) for x in _lst)


def _filter_df_(_initialdf_, config):
    DF_nostamp = deepcopy(_initialdf_)
    del DF_nostamp['timestamp']
    headers = list(DF_nostamp)
    window_length, polyorder = config
    arr_noconst, _headers = _remove_constants_(DF_nostamp, headers)
    filtered_data = savgol_filter(arr_noconst, window_length, polyorder, axis=0)
    data_stream = _arr_to_stream_(filtered_data, _initialdf_['timestamp'].tolist(), headers)
    return data_stream


def sg_filter(dataframe, config):
    return _filter_df_(dataframe, config)
