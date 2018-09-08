import React, { Component } from 'react';
import { Typography, Grid } from '@material-ui/core';
import { withStyles, withTheme } from '@material-ui/core/styles';

import { ProjectListing } from 'components/ProjectListing';

import landingImage from 'assets/bg.jpg';

class _HomePage extends Component {
  render() {
    const { classes, theme } = this.props;

    return (
      <div>
        <div className={classes.landingImage}>
          <Typography variant="display1" gutterBottom className={classes.landingHeader}>
            SSN Project Portal
          </Typography>
          <Typography variant="headline">
            SSN Project Portal aims to match volunteers and organisers in the Singapore Sustainability Space
          </Typography>
        </div>

        <Grid container spacing={4 * theme.spacing.unit} className={classes.root}>
          <Typography variant="headline" gutterBottom>
              Find a Sustainability Project to volunteer for:
          </Typography>
          <Grid container spacing={4 * theme.spacing.unit}>
            <Grid item md={8} xs={12}>
              <ProjectListing />
            </Grid>
            <Grid item md={3} xs={12} className={classes.gridItem}>
              Item 2
            </Grid>
          </Grid>
        </Grid>
      </div>
    );
  }
}

const styles = {
  landingImage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',

    width: '100vw',
    height: '600px',

    backgroundImage: `url(${landingImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',

    textAlign: 'center',
  },
  landingHeader: {
    textTransform: 'uppercase',
    letterSpacing: '0.25em',
  },
  root: {
    margin: '70px auto',
    width: '80vw',
  },
  gridItem: {
    border: '1px solid black',
  },
};


export const HomePage = withTheme()(
  withStyles(styles)(_HomePage)
);