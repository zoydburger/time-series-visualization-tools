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
} from '@material-ui/core';
import { GadgetHeader } from './Headers';
import { chartTypes } from './../../js/graphs';

const styles = theme => ({
  formControl: { width: 300, marginTop: 0 },
  divider: { marginTop: 10, marginBottom: 10 },
  selectControls: { marginTop: 10, margin: 5 },
});

class TraceConfig extends Component {
  state = {
    trace: -1,
  };

  updateTrace = (event, value) => {
    this.setState({
      trace: value.key,
    });
  };

  componentWillReceiveProps(props) {
    if (this.state.trace < 0 && props.traces.length > 0) {
      this.setState({
        trace: 0,
      });
    }
  }

  render() {
    const { classes, traces, update } = this.props;
    const { trace } = this.state;
    return (
      <FormControl className={classes.formControl}>
        <FormControl className={classes.selectControls}>
          <InputLabel htmlFor="trace-simple">Trace</InputLabel>
          <Select
            disabled={traces.length <= 0}
            value={traces.length > 0 ? traces[trace].name : -1}
            onChange={this.updateTrace}
            inputProps={{
              name: 'trace',
              id: 'trace-simple',
            }}
          >
            {traces.length > 0 ? (
              traces.map((trace, idx) => {
                return (
                  <MenuItem key={idx} value={trace.name}>
                    {trace.name}
                  </MenuItem>
                );
              })
            ) : (
              <MenuItem value={-1}>{<em>No active traces</em>}</MenuItem>
            )}
          </Select>
        </FormControl>
        <FormControl component="fieldset" className={classes.radioControl}>
          <RadioGroup
            disabled={trace < 0}
            name="chart-type"
            value={traces.length > 0 ? traces[trace].type : ''}
            onChange={(e, v) =>
              update({
                trace: { name: traces[trace].name, type: v },
              })
            }
          >
            {Object.keys(chartTypes).map(type => {
              return (
                <FormControlLabel
                  key={type}
                  value={type}
                  control={<Radio disabled={trace < 0} color="primary" />}
                  label={chartTypes[type]}
                  style={{ maxHeight: 30 }}
                />
              );
            })}
          </RadioGroup>
        </FormControl>
      </FormControl>
    );
  }
}

TraceConfig.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TraceConfig);
