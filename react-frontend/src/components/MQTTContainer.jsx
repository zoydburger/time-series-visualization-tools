import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import {
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Divider,
} from '@material-ui/core';
import createPlotlyComponent from 'react-plotlyjs';
import Plotly from 'plotly.js/dist/plotly-cartesian';
import {
  graphTypes,
  getGraph,
  standardLayout,
  forecastGraph,
} from './../js/plotlyGraphs';
import {
  streamRequest,
  isStreaming,
  getGraphData,
  foreCastData,
} from './../js/mqttClient';
const PlotlyComponent = createPlotlyComponent(Plotly);

const styles = theme => ({
  root: { display: 'flex', width: '100%' },
  form: { margin: 10, marginTop: 20 },
  formControl: { width: 300, marginBottom: 20 },
  requestButton: { width: '100%', height: 50, marginTop: 20 },
  divider: { marginTop: 10, marginBottom: 20 },
});

class MQTTContainer extends Component {
  state = {
    streaming: false,
    table: 'job_events',
    type: 'accumulate',
    lines: {},
    layout: standardLayout,
    revision: 0,
    interval: 500,
  };

  updateGraph = () => {
    const { lines } = this.state;
    if (this.state.streaming) {
      if (this.state.type === 'forecasts') {
        const data = foreCastData;
        if (Object.keys(lines) == 0) {
          const graph = forecastGraph(
            data.time,
            data.values,
            data.forecasts,
            data.timeForecasts,
          );
          this.setState({
            lines: graph.lines,
            layout: graph.layout,
          });
        } else {
          lines['values'].y = data.values;
          lines['values'].x = data.time;
          lines['forecasts'].x = data.timeForecasts;
          lines['forecasts'].y = data.forecasts;
        }
      } else {
        const data = getGraphData(this.state.table, this.state.type);
        if (data) {
          if (Object.keys(lines) == 0) {
            this.createGraph(data);
          } else {
            for (let line in lines) {
              lines[line].x = data.x;
              if (!Number.isNaN(data.y)) {
                lines[line].y = data.y;
              } else {
                lines[line].y = data.y[line];
              }
              lines[line].y = data.y[line];
            }
            this.setState({
              lines: lines,
              revision: this.state.revision + 1,
            });
          }
        }
      }
    }
  };

  createGraph = data => {
    const { revision } = this.state;
    const newGraph = getGraph(this.state.table, this.state.type, data);
    newGraph.layout.datarevision = revision;
    this.setState({
      lines: newGraph.lines,
      layout: newGraph.layout,
      revision: this.state.revision + 1,
    });
  };

  startStream = () => {
    streamRequest('start', this.state.table, this.state.type);
    this.setState({
      streaming: true,
    });
    setInterval(
      function() {
        this.updateGraph();
      }.bind(this),
      this.state.interval,
    );
  };

  stopStream = () => {
    streamRequest('stop', this.state.table, this.state.type);
    this.setState({
      streaming: false,
    });
  };

  resetStream = () => {
    streamRequest('reset', this.state.table, this.state.type);
    this.setState({
      lines: {},
      layout: standardLayout,
    });
  };

  componentDidMount() {}

  handleTableChange = event => {
    this.setState({
      table: event.target.value,
    });
  };

  handleTypeChange = event => {
    this.setState({
      type: event.target.value,
    });
  };

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <form className={classes.form}>
          <Typography variant="overline">Select your Stream</Typography>
          <Divider className={classes.divider}></Divider>
          <FormControl variant="filled" className={classes.formControl}>
            <FormControl variant="filled" className={classes.formControl}>
              <InputLabel htmlFor="filled-table">Table</InputLabel>
              <Select
                className={classes.tableSelect}
                value={this.state.table}
                onChange={this.handleTableChange}
                inputProps={{
                  name: 'table',
                  id: 'filled-table',
                }}
              >
                {Object.keys(graphTypes).map(table => (
                  <MenuItem
                    className={classes.menuItem}
                    key={table}
                    value={table}
                  >
                    {table === '' ? <em>None</em> : table}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl variant="filled" className={classes.formControl}>
              <InputLabel htmlFor="filled-type">Streamtype</InputLabel>
              <Select
                disabled={this.state.table == ''}
                className={classes.typeSelect}
                value={this.state.type}
                onChange={this.handleTypeChange}
                inputProps={{
                  name: 'type',
                  id: 'filled-type',
                }}
              >
                <MenuItem className={classes.menuItem} value="">
                  <em>None</em>
                </MenuItem>
                {graphTypes[this.state.table].map(type => (
                  <MenuItem
                    className={classes.menuItem}
                    key={type}
                    value={type}
                  >
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              disabled={this.state.type == ''}
              className={classes.requestButton}
              variant="contained"
              color={this.state.streaming ? 'secondary' : 'primary'}
              onClick={
                this.state.streaming
                  ? () => this.stopStream()
                  : () => this.startStream()
              }
            >
              {this.state.streaming ? 'Stop Stream' : 'Start Stream'}
            </Button>
            <Button
              disabled={this.state.streaming}
              className={classes.requestButton}
              variant="contained"
              onClick={() => this.resetStream()}
            >
              {'Reset Stream'}
            </Button>
          </FormControl>
        </form>
        <PlotlyComponent
          data={Object.values(this.state.lines)}
          layout={this.state.layout}
          revision={this.state.revision}
        ></PlotlyComponent>
      </div>
    );
  }
}

MQTTContainer.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MQTTContainer);
