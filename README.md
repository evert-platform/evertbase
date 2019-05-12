# Evert
![Travis CI Build](https://travis-ci.org/TiaanPeens/evertbase.svg?branch=evertdevelop "Travis CI Build")
[![Code Health](https://landscape.io/github/evert-platform/evertbase/master/landscape.svg?style=flat)](https://landscape.io/github/evert-platform/evertbase/master)

Table of contents:
* [Overview](https://github.com/TiaanPeens/evertbase/new/Readme-prelim?readme=1#overview)
* [Installation](https://github.com/TiaanPeens/evertbase/new/Readme-prelim?readme=1#installation)
* [Start Up](https://github.com/TiaanPeens/evertbase/new/Readme-prelim?readme=1#start-up)

### Overview
This is the base code for the Evert project. The aim of the project is to make a
pluggable web interface for the analysis of time series data.
The application is written primarily in Python using the Flask web-framework.

Current features:
* File uploads
* Plotting
* Dataviewer


### Installation
Clone the `master` branch of the repository to get the latest stable version of the application, then navigate to the folder in the command line.


Create a virtual environment for the app using the following command:

`conda env create -f environment.yml `

This environment is currently only supporting `Python 3.5`.

Activate the environment using one of the following commands in the command line:
* Windows: `activate Evert`
* Linux/OSX: `source activate Evert`

After activating the environment the following packages need to be installed using `pip install`:
* `flask_bootstrap`
* `flask_plugins`
* `flask_sqlalchemy`
* `flask_socketio`
* `flask_wtf`
* `dirsync`
* `eventlet`
* `kombu`

Evert uses `RabbitMQ` for message queues communication. Install `RabbitMQ` from https://www.rabbitmq.com/

### Start Up 

After all the environment has been created and all the packages installed the application can now run.

The application can be started in an IDE or in the command line using the following command:

`python manage.py`

After the above command has been entered and run paste the following in your web browser:

`http://127.0.0.1:5000`

This should open Evert in your web browser. If an error is displayed keep on refreshing the page.
