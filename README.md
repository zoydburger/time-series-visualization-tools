# Time Series Visualization Methods and Tools - Demonstration of Findings

## Bachelor's thesis at the chair of Computer Architecture and Parallel Systems at the Technical University of Munich

## Contributors

Author: Roman Salameh\
Supervisor: Prof. Dr. Michael Gerndt\
Advisor: Vladimir Podolskiy, Ph.D.

## Setup of Test Environment

### Install dependencies

To run the test framework a current version of NodeJS (https://nodejs.org/en/) is needed and yarn (https://yarnpkg.com/) was used for package management.

A current version of InfluxDB running in Docker container can be installed via the Docker command:

docker run --name influxdb -p 9999:9999 quay.io/influxdb/influxdb:2.0.0-alpha

### Setup Database

To setup the database, the InfluxDB GUI can be reached on http://localhost:9999/.

For an initial setup the organization needs to be named 'tum' and the initial bucket name 'noaa-data'
The token in the "Load Data" Section has to be copied into the constant variable 'token' located in the first lines of the file './react-frontend/src/js/influx.js'

### Install Modules

To install the JavaScript modules, run 'yarn' as a terminal command in the './react-frontend/' folder.

### Setup MQTT Publisher/Subscriber

An example setup for a publisher-subscriber model is provided in the './mqtt-pubsub' folder. It should be configure with a Anaconda Python distribution (https://www.anaconda.com/distribution/#download-section). The MQTT package can be installed via

pip install paho-mqtt

## Running Test Environment (InfluxDB & Stress Test)

To start the test environment run 'yarn start' in the './react-frontend/'. A browser window automatically opens that shows the test setup on http://localhost:3000/.

In the upper left corner the graph can be switched between Plotly, BokehJS and a proposed Forecast Graph.

## Running MQTT Environment

To test the MQTT Publisher-Subscriber setup switch to http://localhost:3000/mqtt and run subscriber.py in './mqtt-pubsub'. The subscriber is subscribed to an event triggered by the 'Start Stream' button in the front-end.

It reads job_events from the google clusterdata set (https://github.com/google/cluster-data/blob/master/ClusterData2011_2.md) and show currently running, pending and dead jobs. For a proper visualization its good to deactivate traces to have a proper scaling of the time-series.

The publisher publishes every 50ms.

## Possible Manual Adjustments

Plotly rendering is set to WebGL by default. It can be changed by changing the 'chartType' variable in the state of the GraphContainer to from 'scattergl' to 'scatter'.

## Known Issues

The overall code has a lot of overhead. This is due the project fact that the project has been merged between several test setups.

The forecast graph does not allow interactivity because it is currently rerendered on newData instead of getting appended.

The chart settings only work on the standard Plotly Graph.

Performance is only correctly measured if the stream is running.
