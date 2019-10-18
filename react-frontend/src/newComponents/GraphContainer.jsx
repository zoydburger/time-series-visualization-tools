import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Paper } from '@material-ui/core';
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js/dist/plotly-cartesian';
import { emptyGraph } from '../js/const/graphDummies';

const PlotlyComponent = createPlotlyComponent(Plotly);

const styles = theme => ({
  rootPaper: { display: 'flex', width: '100%' },
});

class GraphContainer extends Component {
  state = emptyGraph();

  render() {
    const { classes } = this.props;
    const { data, layout, revision } = this.state;
    return (
      <Paper className={classes.rootPaper}>
        <PlotlyComponent
          divId="graph"
          data={data}
          layout={layout}
          revision={revision}
        ></PlotlyComponent>
      </Paper>
    );
  }
}

GraphContainer.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(GraphContainer);
