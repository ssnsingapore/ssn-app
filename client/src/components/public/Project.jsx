import React, { Component } from 'react';
import { Grid } from '@material-ui/core';
import { withStyles, withTheme } from '@material-ui/core/styles';

import { ProjectMainInfo } from 'components/shared/ProjectMainInfo';

class _Project extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { classes } = this.props;
    const { id } = this.props.match.params;

    return (
      <div className={classes.root}>
        <Grid container spacing={16}>
          <Grid item xs={12}>
            <ProjectMainInfo id={id} />
          </Grid>
        </Grid>
      </div>
    );
  }
}

const styles = theme => ({
  root: {
    flexGrow: 1,
    width: '80vw',
    margin: '0 auto',
    padding: '60px 0',
  },
});

export const Project = withTheme()(withStyles(styles)(_Project));
