from sklearn.decomposition import PCA


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

    data_values = data.values
    print(data_values)
    return