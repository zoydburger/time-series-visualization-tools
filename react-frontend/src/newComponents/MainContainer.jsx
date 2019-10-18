import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js/dist/plotly-cartesian';
import { standardLayout } from '../js/graphs';
import { emptyGraph, emptyTrace, jsonToTraces } from '../js/graphs';
import { queryNOAAMetric } from '../js/influx';
import { measurementsNOAA, startNOAAData } from '../js/constants';
import SidebarLeft from './SiderbarLeft';
import PerformanceInfo from './fragments/PerformanceInfo';
import GraphContainer from './GraphContainer';
const PlotlyComponent = createPlotlyComponent(Plotly);

const styles = theme => ({
  root: { display: 'flex', width: '100%' },
});

class MainContainer extends Component {
  state = {
    streaming: false,
    queryInfo: {
      measure: 0,
      field: 0,
      step: 6 * 1000,
      interval: 1000,
    },
    graphInfo: {
      traceInfo: {},
      nSteps: 100,
      maxBuffer: 1000,
      revision: 0,
    },
    timeInfo: {
      lastUpdate: new Date().getTime(),
      queryLatency: 0,
      dataLatency: 0,
    },
  };

  changeState = changed => {
    const { toggle, interval, steps, trace, m, f, s } = changed;
    const { graphInfo } = this.state;
    if (trace) graphInfo.traceInfo[trace] = trace.type;
    if (steps) graphInfo.nSteps = steps;
    if (m || f) {
      graphInfo.traceInfo = {};
      graphInfo.revision = 0;
    }
    this.setState(prevState => ({
      streaming: toggle ? !prevState.streaming : prevState.streaming,
      updateInterval: interval ? interval : prevState.updateInterval,
      queryInfo: {
        measure: m ? m : prevState.queryInfo.measure,
        field: f ? f : m ? 0 : prevState.queryInfo.field,
        step: s ? s : prevState.queryInfo.step,
        interval: interval ? interval : prevState.queryInfo.interval,
      },
    }));
  };

  queryData = () => {
    const { queryInfo, graphInfo } = this.state;
    const start = startNOAAData.getTime() + graphInfo.revision * queryInfo.step;
    const stop = start + queryInfo.step;
    return queryNOAAMetric(queryInfo.measure, queryInfo.field, start, stop);
  };

  //   update = state => {
  //     const { streaming, updateInterval, updateLoop } = state;
  //     let loop = undefined;
  //     clearInterval(updateLoop);
  //     if (streaming) {
  //       loop = setInterval(() => {
  //         this.updateGraph();
  //       }, updateInterval);
  //     }
  //     this.setState({ updateLoop: loop });
  //   };

  //   updateTrace = line => {
  //     const { graphData, layout, maxPoints, maxStorage, chartType } = this.state;
  //     const { name, x, y } = line;
  //     if (!graphData[name]) graphData[name] = emptyTrace(name, chartType);
  //     const graph = graphData[name];
  //     const len = graph.xAll.push(x) && graph.yAll.push(y);
  //     if (len > maxStorage) graph.xAll.shift() && graph.yAll.shift();
  //     graph.x = graph.xAll.slice(-maxPoints);
  //     graph.y = graph.yAll.slice(-maxPoints);
  //     layout.datarevision = this.state.revision + 1;
  //   };

  reset = () => {
    const { graphInfo, updateLoop } = this.state;
    graphInfo.traceInfo = {};
    graphInfo.revision = 0;
    clearInterval(updateLoop);
    this.setState({
      streaming: false,
      updateLoop: undefined,
    });
  };

  fetchNOAAData = () => {
    const {
      timestep: msQueryStep,
      revision,
      layout,
      measurement,
      field,
    } = this.state;
    const start = startNOAAData.getTime() + revision * msQueryStep;
    const stop = start + msQueryStep;
    return queryNOAAMetric(measurement, field, start, stop);
  };

  //   currentTraces = () => {
  //     const { graphData } = this.state;
  //     return Object.keys(graphData).map(trace => {
  //       return {
  //         name: trace,
  //         type: graphData[trace].type,
  //       };
  //     });
  //   };

  render() {
    const { classes } = this.props;

    const { streaming, graphInfo, queryInfo } = this.state;
    return (
      <div className={classes.root}>
        <SidebarLeft
          streaming={streaming}
          queryInfo={queryInfo}
          graphInfo={graphInfo}
          reset={this.reset}
          update={this.changeState}
        ></SidebarLeft>
        <GraphContainer
          streaming={streaming}
          graphInfo={graphInfo}
          queryInfo={queryInfo}
          queryData={this.queryData}
        ></GraphContainer>
        {/* <SidebarRight></SidebarRight> */}
      </div>
    );
  }
}

MainContainer.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MainContainer);
