import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import {
  FormControl,
  Slider,
  Divider,
  InputLabel,
  Select,
  MenuItem,
} from '@material-ui/core';
import {
  measurementsNOAA,
  marksQueryInterval,
  marksQueryStart,
  marksQueryStep,
} from './../../js/constants';
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
  handleChange = event => {
    this.props.updateSettings({ [event.target.name]: event.target.value });
  };

  render() {
    const { classes, settings, updateSettings } = this.props;
    return (
      <FormControl className={classes.formControl}>
        <GadgetHeader title={'Data Source'}></GadgetHeader>
        <FormControl className={classes.selectControls}>
          <InputLabel htmlFor="measurement-simple">Measurement</InputLabel>
          <Select
            value={settings.measure}
            onChange={this.handleChange}
            inputProps={{
              name: 'measure',
              id: 'measurement-simple',
            }}
          >
            {measurementsNOAA.map((descr, idx) => {
              return (
                <MenuItem key={idx} value={descr.measurement}>
                  {descr.label}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        <FormControl className={classes.selectControls}>
          <InputLabel htmlFor="field-simple">Field</InputLabel>
          <Select
            value={settings.field}
            onChange={this.handleChange}
            inputProps={{
              name: 'field',
              id: 'field-simple',
            }}
          >
            {measurementsNOAA[settings.measure].fields.map((field, idx) => {
              return (
                <MenuItem key={idx} value={field.name}>
                  {field.label}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        <Divider className={classes.divider}></Divider>
        <GadgetHeader title={'Start'} info={''}></GadgetHeader>
        <FormControl className={classes.sliderFormControl}>
          <Slider
            className={classes.slider}
            defaultValue={settings.start}
            onChangeCommitted={(e, v) => updateSettings({ start: v })}
            aria-labelledby="discrete-slider-small-steps"
            step={360}
            marks={marksQueryStart}
            min={settings.start}
            max={settings.end}
            valueLabelDisplay="off"
          />
        </FormControl>
        <Divider className={classes.divider}></Divider>
        <GadgetHeader title={'Timeframe'} info={' start /  sec'}></GadgetHeader>
        <FormControl className={classes.sliderFormControl}>
          <Slider
            className={classes.slider}
            defaultValue={settings.step}
            onChangeCommitted={(e, v) => updateSettings({ step: v })}
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
          info={' Requests / sec'}
        ></GadgetHeader>
        <FormControl className={classes.sliderFormControl}>
          <Slider
            className={classes.slider}
            defaultValue={settings.freq}
            onChangeCommitted={(e, v) => updateSettings({ step: v })}
            aria-labelledby="discrete-slider-small-steps"
            step={50}
            marks={marksQueryInterval}
            min={50}
            max={3000}
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
