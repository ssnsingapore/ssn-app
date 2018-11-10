import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Typography, Grid, Button } from '@material-ui/core';
import { withStyles, withTheme } from '@material-ui/core/styles';

import { ProjectListing } from 'components/shared/ProjectListing';
import { ProjectOwnerLoginForm } from './ProjectOwnerLoginForm';
import { AppContext } from 'components/main/AppContext';
import { withContext } from 'util/context';
import { AlertType } from 'components/shared/Alert';
import { Role } from 'components/shared/enums/Role';

import landingImage from 'assets/bg.jpg';

const LOGOUT_SUCCESS_MESSAGE = 'You\'ve successfully logged out!';
const LOGOUT_FAILURE_MESSAGE = 'We\'ve encountered an error logging you out. Please try again!';

class _HomePage extends Component {

  renderLoginForm() {

    const { classes } = this.props;

    return (
      <React.Fragment>
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
        <ProjectOwnerLoginForm />
      </React.Fragment>
    );
  }

  handleLogout = async (currentUser) => {

    const { authenticator } = this.props.context.utils;
    const { showAlert } = this.props.context.updaters;

    this.setState({ isLoading: true });

    const response = currentUser.role === Role.PROJECT_OWNER ?
      await authenticator.logoutProjectOwner() : await authenticator.logoutAdmin();
    if (response.isSuccessful) {
      showAlert('logoutSuccess', AlertType.SUCCESS, LOGOUT_SUCCESS_MESSAGE);
    }

    if (response.hasError) {
      showAlert('logoutFailure', AlertType.ERROR, LOGOUT_FAILURE_MESSAGE);
    }

    this.setState({ isLoading: false });
  }


  renderLoggedIn() {
    const { classes } = this.props;
    const { authenticator } = this.props.context.utils;
    const currentUser = authenticator.getCurrentUser();

    return (
      <React.Fragment>
        <Typography variant="headline2" gutterBottom>
          You are logged in as {currentUser.email}.
        </Typography>
        <Button
          variant="contained"
          color="default"
          onClick={() => this.handleLogout(currentUser)}
          className={classes.button}
        >
          Logout
        </Button>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to={currentUser.Role === Role.PROJECT_OWNER ? '/project_owner/dashboard' : '/admin/dashboard'}
          className={classes.button}
        >
          Go to Dashboard
        </Button>
      </React.Fragment>
    );

  }

  render() {
    const { classes, theme } = this.props;
    const { isAuthenticated } = this.props.context;

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
              <ProjectListing pageSize={3} projectState={'APPROVED_ACTIVE'} />
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
              {!isAuthenticated ? this.renderLoginForm() : this.renderLoggedIn()}
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
  button: {
    marginTop: '10px',
    width: '200px',
  },
});

export const HomePage = withTheme()(withStyles(styles)(withContext(AppContext)((_HomePage))));
