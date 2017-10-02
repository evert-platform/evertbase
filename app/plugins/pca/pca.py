from sklearn.decomposition import PCA
import numpy as np
from flask_plugins import emit_event


def apply_pca(data):
    """
    Applies the scikit-learn pca.
    Parameters
    ----------
    data: DataFrame
        DataFrame containing the tag data.

    Returns
    -------

    """

    data.drop(['timestamp'], axis=1, inplace=True)

    pca = PCA()
    pca.fit(data.values)

    evr = pca.explained_variance_ratio_
    pca_components = pca.components_
    data_transform = pca.transform(data.values)
    # print(evr, pca_components, np.matrix(pca_components).T*np.matrix(pca_components))


    layout = dict()
    skree_script = _prepare_skree(evr, layout)

    return skree_script

def _prepare_skree(evr, layout):
    evr = list(evr)
    addOnAreaID = 'plotAddOnsArea'
    skree_xaxis = ['S{}'.format(i+1) for i in range(len(evr))]
    skree_cusum = list(np.cumsum(evr))


    skree_bar = {
        'x': skree_xaxis,
        'y': evr,
        'type': 'bar'
    }

    skree_line = {
        'x': skree_xaxis,
        'y': skree_cusum,
        'type': 'scatter'
    }

    data = [skree_line, skree_bar]

    layout['yaxis'] = {
        'title': 'explained variance ratio'
    }
    layout['xaxis'] = {
        'title': 'Principal components'
    }

    return data, layout
