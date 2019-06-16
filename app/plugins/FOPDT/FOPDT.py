from scipy.optimize import curve_fit
import numpy

def apply_fopdt(data, settings):
    """"
    Applies the First Order Plus Dead Time Fit to the data
    Parameters
    ---------------------
    data: DataFrame
        Dataframe containing timestamps as the first column, and time-series as further columns

    config: List
        A list containing the following configuration variables: Kp, taup, thetap and y0p as initial guess
                                                                    for FOPDT Fit

    Returns
    ----------------------
    First Order Plus Deadtime fit to the data
    """
    #Collecting data to fit
    timestamp = data['timestamp']
    data.drop(['timestamp'], axis=1, inplace=True)
    ydata = data.values

    #Setting Up Config
    Kp = settings['Kp']
    taup = settings['taup']
    thetap = settings['thetap']
    y0p = settings['y0p']

    [tau, K, theta, y0], _ = curve_fit(
        fopdt, timestamp, ydata, [taup, Kp, thetap, y0p])

    fitted_data = fopdt(timestamp, tau, K, theta, y0)

    return fitted_data




def fopdt(t, tau, K, theta, y0):
    """ First Order Plus Dead Time response with bias. Note this assumes K > 0"""

    return numpy.maximum(y0, y0 + K*(1 - numpy.exp(-(t - theta)/tau)))
