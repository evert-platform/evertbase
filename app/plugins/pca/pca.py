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
    layout = dict()
    plotdata, layout = _prepare_skree(evr, layout)

    try:
        plotdata, layout = _prepare_biplot(data, pca, plotdata, layout)
        return plotdata, layout
    except IndexError:
        return False, False


def _prepare_skree(evr, layout):
    evr = list(evr)
    skree_xaxis = ['PC{}'.format(i+1) for i in range(len(evr))]
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
        'title': 'explained variance ratio',
        'showline': True
    }
    layout['xaxis'] = {
        'title': 'Principal components',
        'domain': [0, 0.45]
    }

    return data, layout


def _prepare_biplot(data, pca, plotdata, layout):

    transformed_data = pca.transform(data.values)

    biplot_data = transformed_data[:, :2]
    plotdata.append({
        'x': list(biplot_data[:, 0]),
        'y': list(biplot_data[:, 1]),
        'type': 'scatter',
        'mode': 'markers',
        'marker': {
            'color': 'rgba(32, 160, 255, 0.5)'
        },
        'xaxis': 'x2',
        'yaxis': 'y2'
    })

    layout['xaxis2'] = {
        'title': 'S1',
        'domain': [0.55, 1]
    }

    layout['yaxis2'] = {
        'title': 'S2',
        'showline': 1,
        'anchor': 'x2'
    }
    return plotdata, layout


