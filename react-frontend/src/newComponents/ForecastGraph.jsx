import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Paper } from '@material-ui/core';
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js/dist/plotly-cartesian';
const PlotlyComponent = createPlotlyComponent(Plotly);

const graphWidth = 1000;
const graphHeight = 420;

const dataTrace = {
  name: 'Data Trace',
  type: 'scatter',
  line: { color: 'rgb(22, 156, 57)', width: 2 },
};

const forecastTrace = {
  name: 'Forecast',
  type: 'scatter',
  line: { color: 'rgb(173, 14, 14)', width: 1, dash: 'dashdot' },
};

const layout = {
  title: 'Forecasted Time-Series',
  width: graphWidth,
  height: graphHeight,
  shapes: [],
  xaxis: {
    type: 'date',
    range: [],
    autorange: false,
  },
};

const styles = theme => ({
  graphPaper: {
    margin: 5,
  },
});

class ForecastGraph extends Component {
  state = {
    revision: 0,
    storage: { x: [], y: [] },
    normalTrace: {},
    forecastedTrace: {},
    layout: layout,
    interval: undefined,
  };

  startUpdate = query => {
    const loop = setInterval(() => {}, query.interval);
  };

  componentWillReceiveProps(props) {
    if (props.query) {
    }
  }

  render() {
    const { classes } = this.props;
    const { data, layout, revision } = this.state;

    return (
      <div className={classes.root}>
        <Paper className={classes.graphPaper}>
          <PlotlyComponent
            divId="forecastGraph"
            data={data}
            layout={layout}
            revision={revision}
          ></PlotlyComponent>
        </Paper>
      </div>
    );
  }
}

ForecastGraph.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ForecastGraph);
