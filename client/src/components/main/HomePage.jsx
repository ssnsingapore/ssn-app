import React, { Component }  from 'react';
import { Typography, Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

import { ProjectListing } from 'components/ProjectListing';

import defaultImage from 'assets/image-placeholder.svg';

class _HomePage extends Component {
  render() {
    const { classes } = this.props;

    return (
      <div>
        <div className={classes.landingImage}>
          <Typography variant="display3">
          SSN Project Portal
          </Typography>
          <Typography variant="headline">
            SSN Project Portal aims to match volunteers and organisers in the Singapore Sustainability Space
          </Typography>
        </div>

        <Grid container className={classes.root}>
          <Grid item md={9} xs={12}>
            <Typography variant="headline">
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

    width: '100vw',
    height: '400px',

    backgroundImage: `url(${defaultImage})`,
    backgroundSize: 'cover',
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