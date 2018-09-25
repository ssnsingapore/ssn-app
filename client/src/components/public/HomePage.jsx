import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Typography, Grid, Paper, Button } from '@material-ui/core';
import { withStyles, withTheme } from '@material-ui/core/styles';

import { ProjectListing } from 'components/shared/ProjectListing';
import { ProjectOwnerLoginForm } from './ProjectOwnerLoginForm';

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
              <ProjectListing />
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                className={classes.button}
                component={Link}
                to="/projects"
              >
                View All Projects
              </Button>
            </Grid>
            <Grid item md={3} xs={12}>
              <Typography variant="headline" component="h3" gutterBottom>
                Have a project in mind?
              </Typography>
              <Typography
                component="p"
                gutterBottom
                className={classes.marginBottom3}
              >
                Sign up as a project owner to post a project, or login if you
                already have an account.
              </Typography>
              <Paper>
                <ProjectOwnerLoginForm />
              </Paper>
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

    width: '100vw',
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
    margin: '70px auto',
    width: '80vw',
  },
  gridItem: {
    border: '1px solid black',
  },
  marginBottom3: {
    marginBottom: theme.spacing.unit * 3,
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

export const HomePage = withTheme()(withStyles(styles)(_HomePage));
