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
import { GadgetHeader } from './Headers';
import { marksMaxPoints, marksQueryInterval } from './../../js/constants';

const styles = theme => ({
  formControl: {
    width: 300,
    marginTop: 10,
    display: 'flex',
    alignItems: 'center',
  },
  slider: { margin: 10, width: '90%', marginBottom: 20 },
  divider: { marginTop: 20, marginBottom: 10 },
});

class RenderConfig extends Component {
  render() {
    const { classes, update } = this.props;
    return (
      <>
        <GadgetHeader title={'Concurrent Timestamps'}></GadgetHeader>
        <FormControl className={classes.formControl}>
          <Slider
            className={classes.slider}
            defaultValue={100}
            onChangeCommitted={(e, v) => update({ points: v })}
            aria-labelledby="discrete-slider-small-steps"
            step={10}
            marks={marksMaxPoints}
            min={15}
            max={500}
            valueLabelDisplay="off"
          />
        </FormControl>
      </>
    );
  }
}

RenderConfig.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(RenderConfig);
