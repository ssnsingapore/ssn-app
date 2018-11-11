import React, { Component } from 'react';
import { Typography, Grid } from '@material-ui/core';
import { withStyles, withTheme } from '@material-ui/core/styles';

import { HomepageProjectListing } from 'components/public/HomepageProjectListing';
import { ProjectOwnerLoginForm } from './ProjectOwnerLoginForm';
import { AppContext } from 'components/main/AppContext';
import { withContext } from 'util/context';

import landingImage from 'assets/bg.jpg';

class _HomePage extends Component {

  render() {
    const { classes, theme } = this.props;

    return (
      <div>
        <div className={classes.landingImage}>
          <Typography
            variant="display2"
            gutterBottom
            className={classes.landingHeader}
          >
            SSN Project Portal
          </Typography>
          <Typography variant="headline">
            SSN Project Portal aims to match volunteers and organisers in the
            Singapore Sustainability Space
          </Typography>
        </div>

        <Grid
          container
          spacing={4 * theme.spacing.unit}
          className={classes.root}
        >
          <Typography
            variant="headline"
            gutterBottom
            className={classes.marginBottom3}
          >
            Find a Sustainability Project to Volunteer for:
          </Typography>
          <Grid container spacing={4 * theme.spacing.unit}>
            <Grid item md={9} xs={12}>
              <HomepageProjectListing />

            </Grid>
            <Grid item md={3} xs={12}>
              <ProjectOwnerLoginForm />
            </Grid>
          </Grid>
        </Grid>
      </div>
    );
  }
}

const styles = theme => ({
  landingImage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    [theme.breakpoints.down('sm')]: {
      paddingTop: '60px',
      justifyContent: 'flex-start',
    },

    width: '100%',
    height: '600px',

    backgroundImage: `url(${landingImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',

    padding: '30px',

    textAlign: 'center',
  },
  landingHeader: {
    textTransform: 'uppercase',
    letterSpacing: '0.25em',
  },
  root: {
    margin: '50px auto',
    width: '80vw',
  },
  gridItem: {
    border: '1px solid black',
  },

  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
  },
  menu: {
    width: 200,
  },

});

export const HomePage = withTheme()(withStyles(styles)(withContext(AppContext)((_HomePage))));
