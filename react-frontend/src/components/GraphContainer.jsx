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
import SidebarLeft from './SiderbarLeft';
import PerformanceInfo from './fragments/PerformanceInfo';
import SidebarRight from './SidebarRight';
import Axios from 'axios';
import { Bokeh } from 'bokehjs';
import { plotlyTimestampToDate } from '../js/helper';
import BokehContainer from './BokehContainer';
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

class GraphContainer extends Component {
  state = {
    graphType: 'Plotly',
    streaming: false,
    revision: 0,
    updateLoop: undefined,
    lastUpdate: performance.now(),
    queryLatency: 0,
    dataLatency: 0,
    startTime: startNOAAData.getTime(),
    msQueryStep: 6 * 60 * 1000,
    msQueryInterval: 150,
    maxPoints: 100,
    maxStorage: 1000,
    layout: standardLayout,
    initialized: false,
    mqtt: true,
    graphData: {},
    chartType: 'scattergl',
    measurement: 0,
    field: 0,
    forecastGraph: { initialized: true, data: [], layout: standardLayout },
    forecastThreshold: 10,
    bokehGraph: { initialized: false, data: {} },
  };

  changeState = changed => {
    const { forecastGraph, bokehGraph, initialized } = this.state;
    const {
      toggle,
      start,
      interval,
      step,
      points,
      trace,
      m,
      f,
      graphType,
    } = changed;
    if (trace) this.updateChartType(trace);
    if (m || f) this.updateQuery(m, f);
    this.setState(
      prevState => ({
        graphType: graphType ? graphType : prevState.graphType,
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
    const {
      startTime,
      msQueryStep,
      measurement,
      field,
      bokehGraph,
    } = this.state;
    const { revision, layout } = this.state;
    const updateStart = performance.now();
    const start = startTime + revision * msQueryStep;
    const stop = start + msQueryStep;
    const tables = await queryNOAAMetric(measurement, field, start, stop);
    const queryDone = performance.now();
    this.updateTitle();
    const traces = jsonToTraces(tables);
    traces.forEach(res => {
      res.forEach(line => this.updateTrace(line));
    });
    bokehGraph.traces = traces;
    const linesDone = performance.now();
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
      forecastGraph,
    } = this.state;

    const { name, x, y } = line;
    if (!graphData[name]) graphData[name] = emptyTrace(name, chartType);
    const graph = graphData[name];
    const len = graph.xAll.push(x) && graph.yAll.push(y);
    if (len > maxStorage) graph.xAll.shift() && graph.yAll.shift();
    graph.x = graph.xAll.slice(-maxPoints);
    graph.y = graph.yAll.slice(-maxPoints);

    if (graph.x.length > forecastThreshold && forecastGraph.initialized) {
      const { data, layout } = createForecastGraph(graph, maxPoints);
      forecastGraph.data = data;
      forecastGraph.layout = layout;
    }
  };

  updateForecastGraph = (graph, maxPoints) => {
    const { forecastGraph } = this.state;
    if (true) {
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
    this.setState(prevState => ({
      measurement: m ? m : prevState.measurement,
      field: f ? f : m ? 0 : prevState.field,
      revision: 0,
      graphData: {},
    }));
  };

  reset = () => {
    const { bokehGraph } = this.state;
    bokehGraph.initialized = bokehGraph.initialized;
    bokehGraph.traces = {};
    clearInterval(this.state.updateLoop);
    this.setState({
      revision: 0,
      graphData: {},
      streaming: false,
      updateLoop: undefined,
    });
  };

  bokehUpdate = traces => {
    const { bokehSrc, maxPoints } = this.state;
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
  };

  componentDidMount() {
    // const { src, plot } = bokehPlot();
    // window.Bokeh.Plotting.show(plot, '#bokehDiv');
    // this.setState({
    //   bokehSrc: src,
    // });
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
      initialized,
      bokehGraph,
      mqtt,
      graphType,
    } = this.state;
    console.log(graphData);
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
            graphType={graphType}
          ></SidebarLeft>
        </div>
        <div className={classes.graphDiv}>
          {graphType === 'Plotly' ? (
            <Paper className={classes.graphPaper}>
              <PlotlyComponent
                divId="graph"
                data={Object.values(graphData)}
                layout={layout}
                revision={revision}
              ></PlotlyComponent>
            </Paper>
          ) : null}

          {graphType === 'Bokeh' ? (
            <BokehContainer
              streaming={this.state.streaming}
              traces={bokehGraph.traces}
              maxPoints={maxPoints}
            ></BokehContainer>
          ) : null}
          {graphType === 'Forecast' ? (
            <Paper className={classes.graphPaper}>
              <PlotlyComponent
                divId="graph"
                data={Object.values(forecastGraph.data)}
                layout={forecastGraph.layout}
                revision={revision}
              ></PlotlyComponent>
            </Paper>
          ) : null}
        </div>
        <div>
          <SidebarRight
            queryLatency={queryLatency}
            dataLatency={dataLatency}
            lastUpdate={lastUpdate}
            traces={this.currentTraces()}
            update={this.changeState}
            forecast={forecastGraph.initialized}
            bokeh={bokehGraph.initialized}
            initialized={initialized}
          ></SidebarRight>
        </div>
      </div>
    );
  }
}

GraphContainer.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(GraphContainer);
