import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { initSettings } from '../js/const/defaultSettings';
import StreamSettings from './StreamSettings';
import GraphContainer from './GraphContainer';

const styles = theme => ({
  root: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    padding: 10,
  },
});

class BaseContainer extends Component {
  state = {
    settings: initSettings(),
  };

  updateSettings = update => this.setState({ ...update });

  render() {
    const { classes } = this.props;
    const { settings } = this.state;
    console.log(settings);
    return (
      <div className={classes.root}>
        <StreamSettings
          settings={settings}
          updateSettings={this.updateSettings}
        ></StreamSettings>
        <GraphContainer></GraphContainer>
      </div>
    );
  }
}

BaseContainer.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(BaseContainer);
