import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Paper, Checkbox } from '@material-ui/core';
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js/dist/plotly-cartesian';
import { standardLayout, createForecastGraph } from '../js/graphs';
import { emptyTrace, jsonToTraces } from '../js/graphs';
import { bokehPlot } from '../js/bokehGraphs';
import { queryNOAAMetric } from '../js/influx';
import { measurementsNOAA, startNOAAData } from '../js/constants';
import { plotlyTimestampToDate } from '../js/helper';
const PlotlyComponent = createPlotlyComponent(Plotly);

let src = undefined;

const styles = theme => ({
  root: {
    display: 'flex',
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(63, 81, 181, 0.03)',
    alignItems: 'space-around',
  },
  graphDiv: {
    display: 'flex',
    height: '95%',
    flexDirection: 'column',
    padding: 5,
  },
  graphPaper: {
    margin: 5,
  },
});

class BokehContainer extends Component {
  state = {
    bokehSrc: undefined,
    streaming: false,
    revision: 0,
    updateLoop: undefined,
    lastUpdate: performance.now(),
    queryLatency: 0,
    dataLatency: 0,
    startTime: startNOAAData.getTime(),
    msQueryStep: 6 * 60 * 1000,
    msQueryInterval: 1000,
    maxPoints: 100,
    maxStorage: 1000,
    layout: standardLayout,
    graphData: {},
    chartType: 'scattergl',
    measurement: 0,
    field: 0,
    forecastGraph: { initialized: false, data: [], layout: standardLayout },
    forecastThreshold: 10,
  };

  bokehUpdate = (traces, maxPoints) => {
    if (this.props.streaming) {
      const { bokehSrc } = this.state;
      let x_points = [];
      let cc_points = [];
      let sm_points = [];
      traces.forEach((res, idx) => {
        res.forEach(line => {
          if (idx === 0) x_points.push(line.x);
          if (line.name == 'coyote_creek') cc_points.push(line.y);
          if (line.name == 'santa_monica') sm_points.push(line.y);
        });
      });
      x_points = x_points.map(
        p => plotlyTimestampToDate(p).getTime() / 1000 / 1000,
      );
      bokehSrc.stream(
        {
          x: x_points,
          coyote_creek: cc_points,
          santa_monica: sm_points,
        },
        maxPoints,
      );
    }
  };

  componentWillReceiveProps(props) {
    if (props.streaming && props.traces != this.props.traces) {
      this.bokehUpdate(props.traces);
    }
  }

  componentDidMount() {
    const { src, plot } = bokehPlot();
    window.Bokeh.Plotting.show(plot, '#bokehDiv');
    this.setState(
      {
        bokehSrc: src,
      },
      () => this.bokehUpdate(this.props.traces, this.props.maxPoints),
    );
  }
  fetchData = () => {};

  currentTraces = () => {
    const { graphData } = this.state;
    return Object.keys(graphData).map(trace => {
      return {
        name: trace,
        type: graphData[trace].type,
      };
    });
  };

  render() {
    const { classes } = this.props;

    const {} = this.state;

    return <div id="bokehDiv"></div>;
  }
}

BokehContainer.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(BokehContainer);
