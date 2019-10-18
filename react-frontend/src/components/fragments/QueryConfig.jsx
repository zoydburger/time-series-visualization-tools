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
import {
  measurementsNOAA,
  startNOAAData,
  marksQueryInterval,
  marksQueryStart,
  marksQueryStep,
  endNOAAData,
} from './../../js/constants';
import { dateToPlotlyTimestamp } from './../../js/helper';
import { GadgetHeader } from './Headers';

const styles = theme => ({
  formControl: { width: 300, marginTop: 0, marginBottom: 20 },
  sliderFormControl: {
    width: 300,
    marginTop: 10,
    display: 'flex',
    alignItems: 'center',
  },
  slider: {
    margin: 10,
    width: '90%',
    height: '80%',
    marginBottom: 20,
    marginTop: 0,
  },
  divider: { marginTop: 10, marginBottom: 10 },
  selectControls: { marginTop: 10, margin: 5 },
});

class QueryConfig extends Component {
  render() {
    const { classes } = this.props;
    const { measurement, field, update, sliderVals } = this.props;
    const { startTime, msQueryInterval, msQueryStep } = sliderVals;
    return (
      <FormControl className={classes.formControl}>
        <GadgetHeader title={'Data Source'}></GadgetHeader>
        <FormControl className={classes.selectControls}>
          <InputLabel htmlFor="measurement-simple">Measurement</InputLabel>
          <Select
            value={measurement}
            onChange={e => update({ m: e.target.value })}
            inputProps={{
              name: 'measurement',
              id: 'measurement-simple',
            }}
          >
            {measurementsNOAA.map((descr, idx) => {
              return (
                <MenuItem key={descr.measurement} value={idx}>
                  {descr.label}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        <FormControl className={classes.selectControls}>
          <InputLabel htmlFor="measurement-simple">Field</InputLabel>
          <Select
            value={field}
            onChange={e => update({ f: e.target.value })}
            inputProps={{
              name: 'field',
              id: 'measurement-simple',
            }}
          >
            {measurementsNOAA[measurement].fields.map((field, idx) => {
              return (
                <MenuItem key={field.name} value={idx}>
                  {field.label}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        <Divider className={classes.divider}></Divider>
        <GadgetHeader
          title={'Start'}
          info={dateToPlotlyTimestamp(new Date(startTime)).split('.')[0]}
        ></GadgetHeader>
        <FormControl className={classes.sliderFormControl}>
          <Slider
            className={classes.slider}
            defaultValue={startTime / 1000}
            onChangeCommitted={(e, v) => update({ start: v * 1000 })}
            aria-labelledby="discrete-slider-small-steps"
            step={60 * 60}
            marks={marksQueryStart}
            min={startNOAAData.getTime() / 1000}
            max={endNOAAData.getTime() / 1000}
            valueLabelDisplay="off"
          />
        </FormControl>
        <Divider className={classes.divider}></Divider>
        <GadgetHeader
          title={'Timeframe'}
          info={' start + ' + Math.round(msQueryStep / 1000, 2) + ' sec'}
        ></GadgetHeader>
        <FormControl className={classes.sliderFormControl}>
          <Slider
            className={classes.slider}
            defaultValue={msQueryStep / 1000}
            onChangeCommitted={(e, v) => update({ step: v * 1000 })}
            aria-labelledby="discrete-slider-small-steps"
            step={60}
            marks={marksQueryStep}
            min={60}
            max={60 * 60}
            valueLabelDisplay="off"
          />
        </FormControl>
        <Divider className={classes.divider}></Divider>
        <GadgetHeader
          title={'Frequency'}
          info={Math.round(1000 / msQueryInterval, 2) + ' Requests / sec'}
        ></GadgetHeader>
        <FormControl className={classes.sliderFormControl}>
          <Slider
            className={classes.slider}
            defaultValue={msQueryInterval}
            onChangeCommitted={(e, v) => update({ interval: v })}
            aria-labelledby="discrete-slider-small-steps"
            step={50}
            marks={marksQueryInterval}
            min={10}
            max={1000}
            valueLabelDisplay="off"
          />
        </FormControl>
      </FormControl>
    );
  }
}

QueryConfig.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(QueryConfig);
