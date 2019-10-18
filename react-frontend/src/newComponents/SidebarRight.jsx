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
  Checkbox,
} from '@material-ui/core';
import { marksQueryInterval, marksMaxPoints } from '../js/constants';
import { chartTypes } from '../js/graphs';
import { fontSize } from '@material-ui/system';
import QueryConfig from './fragments/QueryConfig';
import TraceConfig from './fragments/TraceConfig';
import { FormHeader } from './fragments/Headers';
import RenderConfig from './fragments/RenderConfig';
import PerformanceInfo from './fragments/PerformanceInfo';

const styles = theme => ({
  form: { margin: 10, marginTop: 20 },
  formControl: { margin: 20, width: 300, marginTop: 0 },
  divider: { marginTop: 10, marginBottom: 10 },
  slider: { width: '80%' },
  selectControls: { marginTop: 10 },
  radioControl: { marginTop: 15 },
});

class SidebarLeft extends Component {
  render() {
    const { classes } = this.props;
    // time indicators
    const { queryLatency, dataLatency, lastUpdate } = this.props;
    // update functions
    const { update, reset } = this.props;
    // config
    const { traces, measurement, field } = this.props;

    return (
      <form className={classes.form}>
        <FormControl className={classes.formControl}>
          <FormHeader title={'Performance'}></FormHeader>
          <PerformanceInfo
            queryLatency={queryLatency}
            dataLatency={dataLatency}
            lastUpdate={lastUpdate}
          ></PerformanceInfo>
          <FormHeader title={'Chart Settings'}></FormHeader>
          <TraceConfig traces={traces} update={update}></TraceConfig>
          <RenderConfig update={update}></RenderConfig>
        </FormControl>
      </form>
    );
  }
}

SidebarLeft.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SidebarLeft);
