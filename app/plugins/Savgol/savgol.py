from copy import deepcopy
from scipy.signal import savgol_filter
import pandas as pd


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


def _check_constant_(_lst):
    return all(round(x, 6) == round(_lst[0], 6) for x in _lst)


def _filter_df_(_initialdf_, config):
    DF_nostamp = deepcopy(_initialdf_)
    del DF_nostamp['timestamp']
    headers = list(DF_nostamp)
    # setting up config
    window_length = config['window_length']
    polyorder = config['polyorder']
    arr_noconst, _headers = _remove_constants_(DF_nostamp, headers)
    filtered_data = savgol_filter(arr_noconst, window_length, polyorder, axis=0)
    data_stream = _arr_to_stream_(filtered_data, _initialdf_['timestamp'].tolist(), headers)
    data_stream.insert(0, 'line')
    return data_stream


def sg_filter(dataframe, config):
    """
    
    :param dataframe: A pandas.Dataframe containing timestamps as the first column, and timeseries as further columns
    :param config: A list containing the following configuration variables: window_length(length of window used to fit)
                                                                            polyorder(The order of the polynomial used
                                                                            to fit data).
    :return: A filtered list of lists, in the correct format for Evert to plot.
    """

    if not isinstance(dataframe, pd.DataFrame):
        raise TypeError('Expected input of type: pandas.DataFrame for argument: dataframe, instead got: {}'.format(
            type(dataframe)
        ))
    if not isinstance(config, dict):
        raise TypeError('Expected input of type: dict for argument: config, instead got: {}'.format(type(config)))

    return _filter_df_(dataframe, config)
