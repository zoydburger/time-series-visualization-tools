import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Slider,
  Divider,
} from '@material-ui/core';
import FormHeader from './Headers';
import { marksMaxPoints, marksQueryInterval } from './../../js/constants';

const styles = theme => ({
  formControl: { width: '100%', marginTop: 10 },
  divider: { marginTop: 10, marginBottom: 10 },
});

class PerformanceInfo extends Component {
  render() {
    const { classes } = this.props;
    const { queryLatency, dataLatency, lastUpdate } = this.props;
    const renderLatency = performance.now() - lastUpdate;
    const totalLatency = queryLatency + dataLatency + renderLatency;
    return (
      <FormControl className={classes.formControl}>
        <Typography variant="body2" gutterBottom>
          {'Query Latency: ' + Math.round(queryLatency, 4) + 'ms'}
        </Typography>
        <Typography variant="body2" gutterBottom>
          {'Data Latency: ' + Math.round(dataLatency, 4) + 'ms'}
        </Typography>
        <Typography variant="body2" gutterBottom>
          {'Render Latency: ' + Math.round(renderLatency, 4) + 'ms'}
        </Typography>
        <Typography variant="body2" gutterBottom>
          <b>{'Total Latency: ' + Math.round(totalLatency, 4) + 'ms'}</b>
        </Typography>
      </FormControl>
    );
  }
}

PerformanceInfo.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(PerformanceInfo);
