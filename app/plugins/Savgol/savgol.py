from scipy.signal import savgol_filter
import pandas as pd

# TODO: Add scipy to plugin requirements


def sg_filter(dataframe, settings):
    dataframe_filtered, headers = _filter_df_(dataframe, settings)
    return dataframe_filtered


def _filter_df_(_dataframe, settings):
    poly_width, padding_factor = settings
    __headers = list(_dataframe)
    arr_new__, _headers = _remove_constants_(_dataframe, __headers)
    arr_new_ = savgol_filter(arr_new__, poly_width, padding_factor, axis=0)
    dataframe_new = _arr_to_df_(arr_new_, _headers)
    return dataframe_new, _headers


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