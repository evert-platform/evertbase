# Evert

![Travis CI Build](https://travis-ci.org/evert-platform/evertbase.svg?branch=master "Travis CI Build")
[![Code Health](https://landscape.io/github/evert-platform/evertbase/master/landscape.svg?style=flat)](https://landscape.io/github/evert-platform/evertbase/master)

This is the base code for the Evert project. The aim of the project is to make a
pluggable web interface for the analysis of time series data.
The application is written primarily in Python using the Flask web-framework.

Current features:
* File uploads
* Plotting
* Dataviewer


### Installation
Clone the `master` branch of the repository to get the latest stable version of the application.

Install the requirements in the `requirements.txt` using the following command:

`pip install -r requirements.txt`

Alternatively a virtual environment can be made for the app using the following command:

`conda env create --file environment.yml`

The application can be started in an IDE or in the command line using the following command:

`python manage.py`


