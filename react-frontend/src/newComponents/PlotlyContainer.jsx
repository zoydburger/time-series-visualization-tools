import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Paper } from '@material-ui/core';
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js/dist/plotly-cartesian';
import Axios from 'axios';
import { standardLayout, createForecastGraph } from '../js/graphs';
import { emptyTrace, jsonToTraces } from '../js/graphs';
import { queryNOAAMetric } from '../js/influx';
import { measurementsNOAA, startNOAAData } from '../js/constants';
import SidebarLeft from './SiderbarLeft';
import PerformanceInfo from './fragments/PerformanceInfo';
import SidebarRight from './SidebarRight';
import ForecastGraph from './ForecastGraph';
const PlotlyComponent = createPlotlyComponent(Plotly);

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

class PlotlyContainer extends Component {
  state = {
    streaming: false,
    revision: 0,
    updateLoop: undefined,
    lastUpdate: new Date().getTime(),
    queryLatency: 0,
    dataLatency: 0,
    startTime: startNOAAData.getTime(),
    msQueryStep: 6 * 60 * 1000,
    msQueryInterval: 1000,
    maxPoints: 100,
    maxStorage: 1000,
    layout: standardLayout,
    graphData: {},
    chartType: 'scatter',
    measurement: 0,
    field: 0,
    forecastGraph: { initialized: false, data: [], layout: standardLayout },
    forecastThreshold: 10,
  };

  changeState = changed => {
    console.log('Update', changed);
    const { toggle, start, interval, step, points, trace, m, f } = changed;
    if (trace) this.updateChartType(trace);
    if (m || f) this.updateQuery(m, f);
    this.setState(
      prevState => ({
        startTime: start ? start : prevState.startTime,
        streaming: toggle ? !prevState.streaming : prevState.streaming,
        msQueryInterval: interval ? interval : prevState.msQueryInterval,
        maxPoints: points ? points : prevState.maxPoints,
        msQueryStep: step ? step : prevState.msQueryStep,
      }),
      () => this.update(),
    );
  };

  update = () => {
    const { streaming, msQueryInterval, updateLoop } = this.state;
    let loop = undefined;
    clearInterval(updateLoop);
    if (streaming) {
      loop = setInterval(() => {
        this.updateGraph();
      }, msQueryInterval);
    }
    this.setState({ updateLoop: loop });
  };

  updateChartType = trace => {
    const { graphData } = this.state;
    const { name, type } = trace;
    graphData[name].type = type;
  };

  updateGraph = async () => {
    const { startTime, msQueryStep, measurement, field } = this.state;
    const { revision, layout } = this.state;
    console.log('Updating to revision', revision);
    const updateStart = new Date().getTime();
    const start = startTime + revision * msQueryStep;
    const stop = start + msQueryStep;
    const tables = await queryNOAAMetric(measurement, field, start, stop);
    console.log(tables);
    const queryDone = new Date().getTime();
    this.updateTitle();
    jsonToTraces(tables).forEach(line => this.updateTrace(line));
    const linesDone = new Date().getTime();
    this.setState({
      revision: revision + 1,
      queryLatency: queryDone - updateStart,
      dataLatency: linesDone - queryDone,
      lastUpdate: linesDone,
    });
    layout.layoutrevision = layout.layoutrevision + 1;
  };

  updateTrace = line => {
    const {
      graphData,
      maxPoints,
      maxStorage,
      chartType,
      forecastThreshold,
    } = this.state;
    const { name, x, y } = line;
    if (!graphData[name]) graphData[name] = emptyTrace(name, chartType);
    const graph = graphData[name];
    const len = graph.xAll.push(x) && graph.yAll.push(y);
    if (len > maxStorage) graph.xAll.shift() && graph.yAll.shift();
    graph.x = graph.xAll.slice(-maxPoints);
    graph.y = graph.yAll.slice(-maxPoints);
    if (graph.x.length > forecastThreshold) {
      this.updateForecastGraph(graph, maxPoints);
    }
  };

  updateForecastGraph = (graph, maxPoints) => {
    const { forecastGraph } = this.state;
    if (!forecastGraph.initialized) {
      const newGraph = createForecastGraph(graph, maxPoints);
      forecastGraph.data = newGraph.data;
      forecastGraph.layout = newGraph.layout;
      forecastGraph.initialized = true;
    } else {
    }
  };

  updateTitle = () => {
    const { measurement, field, layout } = this.state;
    const titleM = measurementsNOAA[measurement].label;
    const titleF = measurementsNOAA[measurement].fields[field].label;
    layout.title = '< ' + titleM + ' | ' + titleF + ' >';
  };

  updateQuery = (m, f) => {
    console.log('update query', m, f);
    this.setState(prevState => ({
      measurement: m ? m : prevState.measurement,
      field: f ? f : m ? 0 : prevState.field,
      revision: 0,
      graphData: {},
    }));
  };

  reset = () => {
    clearInterval(this.state.updateLoop);
    this.setState({
      revision: 0,
      graphData: {},
      streaming: false,
      updateLoop: undefined,
    });
  };

  currentTraces = () => {
    const { graphData } = this.state;
    return Object.keys(graphData).map(trace => {
      return {
        name: trace,
        type: graphData[trace].type,
      };
    });
  };

  componentDidMount() {
    Axios.get('http://localhost:5006/bokeh_visualization').then(function(resp) {
      window.Bokeh.embed.embed_item({ doc: resp.data }, 'bokehContainer');
      console.log(resp);
    });
  }

  render() {
    const { classes } = this.props;

    const {
      startTime,
      msQueryInterval,
      msQueryStep,
      maxPoints,
      queryLatency,
      dataLatency,
      graphData,
      layout,
      revision,
      lastUpdate,
      chartType,
      measurement,
      field,
      forecastGraph,
    } = this.state;
    console.log(layout);
    return (
      <div className={classes.root}>
        <div>
          <SidebarLeft
            streaming={this.state.streaming}
            sliderVals={{ startTime, msQueryInterval, msQueryStep }}
            reset={this.reset}
            update={this.changeState}
            measurement={measurement}
            field={field}
          ></SidebarLeft>
        </div>
        <div className={classes.graphDiv}>
          <Paper className={classes.graphPaper}>
            <PlotlyComponent
              divId="graph"
              data={Object.values(graphData)}
              layout={layout}
              revision={revision}
            ></PlotlyComponent>
          </Paper>
          <div id="bokehContainer"></div>
        </div>
        <div>
          <SidebarRight
            queryLatency={queryLatency}
            dataLatency={dataLatency}
            lastUpdate={lastUpdate}
            traces={this.currentTraces()}
            update={this.changeState}
          ></SidebarRight>
        </div>
      </div>
    );
  }
}

PlotlyContainer.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(PlotlyContainer);
