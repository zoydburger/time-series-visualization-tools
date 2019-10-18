import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import {
  Button,
  FormControl,
  Slider,
  Typography,
  Divider,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
} from '@material-ui/core';
import { marksQueryInterval, marksMaxPoints } from '../js/constants';
import { chartTypes } from '../js/graphs';
import { fontSize } from '@material-ui/system';
import QueryConfig from './fragments/QueryConfig';
import TraceConfig from './fragments/TraceConfig';
import { FormHeader } from './fragments/Headers';
import RenderConfig from './fragments/RenderConfig';

const styles = theme => ({
  root: { display: 'flex', width: '100%' },
  form: { margin: 10, marginTop: 20 },
  formControl: { margin: 20, width: 300, marginTop: 0 },
  requestButton: { width: '100%', height: 40, marginTop: 0, marginBottom: 10 },
  divider: { marginTop: 10, marginBottom: 10 },

  slider: { marginLeft: 20, width: '80%' },
  title: { marginTop: 30 },
  selectControls: { marginTop: 10 },
  radioControl: { marginTop: 15 },
});

const graphTypes = ['Plotly', 'Bokeh', 'Forecast'];

class SidebarLeft extends Component {
  render() {
    const { classes } = this.props;
    // time indicators
    const { queryLatency, dataLatency, lastUpdate } = this.props;
    // update functions
    const { update, reset } = this.props;
    // config
    const { traces, measurement, field, sliderVals, graphType } = this.props;

    return (
      <form className={classes.form}>
        <FormControl className={classes.formControl}>
          <FormControl className={classes.selectControls}>
            <InputLabel htmlFor="graphtype-simple">Graph Type</InputLabel>
            <Select
              value={graphType}
              onChange={e => update({ graphType: e.target.value })}
              inputProps={{
                name: 'graphtype',
                id: 'graphtype-simple',
              }}
            >
              {graphTypes.map(gType => {
                return (
                  <MenuItem key={gType} value={gType}>
                    {gType}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <FormHeader title={'Stream Settings'}></FormHeader>
          <QueryConfig
            measurement={measurement}
            field={field}
            update={update}
            sliderVals={sliderVals}
          />
          <Divider className={classes.divider}></Divider>
          <Button
            className={classes.requestButton}
            variant="contained"
            color={this.props.streaming ? 'secondary' : 'primary'}
            onClick={() => update({ toggle: true })}
          >
            {this.props.streaming ? 'Stop Stream' : 'Start Stream'}
          </Button>
          <Button
            className={classes.requestButton}
            variant="contained"
            onClick={() => reset()}
          >
            {'Reset Stream'}
          </Button>
        </FormControl>
      </form>
    );
  }
}

SidebarLeft.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SidebarLeft);
