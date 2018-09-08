import React, { Component }  from 'react';
import { Typography, Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

import { ProjectListing } from 'components/ProjectListing';

import landingImage from 'assets/bg.jpg';

class _HomePage extends Component {
  render() {
    const { classes } = this.props;

    return (
      <div>
        <div className={classes.landingImage}>
          <Typography variant="headline" gutterBottom className={classes.landingHeader}>
          SSN Project Portal
          </Typography>
          <Typography variant="subheading">
            SSN Project Portal aims to match volunteers and organisers in the Singapore Sustainability Space
          </Typography>
        </div>

        <Grid container className={classes.root}>
          <Grid item md={9} xs={12}>
            <Typography variant="body2">
            Find a Sustainability Project to volunteer for:
            </Typography>
            <ProjectListing />
          </Grid>
          <Grid item md={3} xs={12} className={classes.gridItem}>
            Item 2
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
    height: '460px',

    backgroundImage: `url(${landingImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',

    textAlign: 'center',
  },
  landingHeader: {
    textTransform: 'uppercase',
    letterSpacking: '0.25em',
  },
  root: {
    margin: '20px auto',
    width: '80vw',
  },
  gridItem: {
    border: '1px solid black',
  },
};


export const HomePage = withStyles(styles)(_HomePage);