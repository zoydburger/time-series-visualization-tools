import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { FormControl, Divider, Paper } from '@material-ui/core';
import QueryConfig from './fragments/QueryConfig';
import { FormHeader } from './fragments/Headers';

const styles = theme => ({
  paperRoot: { padding: 10, marginRight: 10 },
});

class StreamSettings extends Component {
  render() {
    const { classes, settings, updateSettings } = this.props;

    return (
      <Paper className={classes.paperRoot}>
        <form className={classes.form}>
          <FormControl className={classes.formControl}>
            <FormHeader title={'Stream Settings'}></FormHeader>
            <QueryConfig settings={settings} updateSettings={updateSettings} />
            <Divider className={classes.divider}></Divider>
          </FormControl>
        </form>
      </Paper>
    );
  }
}

StreamSettings.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(StreamSettings);
