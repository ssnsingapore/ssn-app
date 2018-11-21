import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { Typography, Paper, Button, TextField } from '@material-ui/core';
import { withStyles, withTheme } from '@material-ui/core/styles';
import { withContext } from '../../util/context';
import { AppContext } from '../main/AppContext';
import { getFieldNameObject, withForm, fieldValue } from '../../util/form';
import { AlertType } from '../shared/Alert';
import { extractErrors, formatErrors } from '../../util/errors';
import { Role } from 'components/shared/enums/Role';

import landingImage from 'assets/bg.jpg';

const LOGIN_SUCCESS_MESSAGE = 'You\'ve successfully logged in!';
const LOGIN_FAILURE_MESSAGE = 'Looks like you\'ve keyed in the wrong credentials. Try again!';

const LOGOUT_SUCCESS_MESSAGE = 'You\'ve successfully logged out!';
const LOGOUT_FAILURE_MESSAGE = 'We\'ve encountered an error logging you out. Please try again!';

const FieldName = getFieldNameObject([
  'email',
  'hashedPassword',
]);

const constraints = {
  [FieldName.email]: {
    presence: { allowEmpty: false },
    email: true,
  },
  [FieldName.hashedPassword]: {
    presence: { allowEmpty: false },
  },
};

export class _AdminLoginForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      shouldRedirect: false,
    };
  }

  handleSubmit = async (event) => {
    event.preventDefault();

    if (!this.props.validateAllFields()) {
      return;
    }

    const { showAlert } = this.props.context.updaters;
    const { authenticator } = this.props.context.utils;

    this.setState({ isLoading: true });

    const { email, hashedPassword } = this.props.valuesForAllFields();
    const response = await authenticator.loginAdmin(email, hashedPassword);

    this.setState({ isLoading: false });

    if (response.isSuccessful) {
      this.setState({ shouldRedirect: true });
      showAlert('loginSuccess', AlertType.SUCCESS, LOGIN_SUCCESS_MESSAGE);
    }

    if (response.hasError) {
      if (response.status === 401) {
        showAlert('loginFailure', AlertType.ERROR, LOGIN_FAILURE_MESSAGE);
      } else {
        const errors = await extractErrors(response);
        showAlert('loginFailure', AlertType.ERROR, formatErrors(errors));
      }
    }
  }


  handleLogout = async () => {
    const { authenticator } = this.props.context.utils;
    const { showAlert } = this.props.context.updaters;

    this.setState({ isLoggingOut: true });
    const response = await authenticator.logoutAdmin();

    if (response.isSuccessful) {
      showAlert('logoutSuccess', AlertType.SUCCESS, LOGOUT_SUCCESS_MESSAGE);
    } else if (response.hasError) {
      showAlert('logoutFailure', AlertType.ERROR, LOGOUT_FAILURE_MESSAGE);
    }

    this.setState({ isLoggingOut: false });
  }

  getRedirectReferrer = () => {
    const locationState = this.props.location ? this.props.location.state : undefined;
    if (locationState && locationState.referrerPath) {
      return locationState.referrerPath;
    }
    return '/admin/dashboard';
  }

  renderLoggedIn() {
    const { classes } = this.props;
    const { authenticator } = this.props.context.utils;
    const currentUser = authenticator.getCurrentUser();

    return (
      <React.Fragment>
        <Typography
          variant="body1"
          gutterBottom
          style={{ overflowWrap: 'break-word', marginBottom: '20px' }}>
          You are logged in as {currentUser.email}.
        </Typography>
        <Button
          variant="contained"
          color="default"
          onClick={() => this.handleLogout(currentUser)}
          className={classes.button}
          disabled={this.state.isLoading}
        >
          Logout
        </Button>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/admin/dashboard"
          className={classes.button}
        >
          Go to Dashboard
        </Button>
      </React.Fragment>
    );
  }

  renderLoginForm() {
    const { classes, fields, handleChange } = this.props;

    return (
      <React.Fragment>
        <form onSubmit={this.handleSubmit}>
          <TextField
            name={FieldName.email}
            className={classes.textInput}
            id={FieldName.email}
            label="Username"
            required={true}
            onChange={handleChange}
            value={fieldValue(fields, FieldName.email) || ''}
            fullWidth />
          <TextField
            name={FieldName.hashedPassword}
            className={classes.textInput}
            id={FieldName.hashedPassword}
            label="Password"
            type="password"
            required={true}
            onChange={handleChange}
            value={fieldValue(fields, FieldName.hashedPassword) || ''}
            fullWidth />
          <Button
            type="submit"
            size="medium"
            className={classes.createButton}
            disabled={this.state.isLoading}
            variant="contained"
            color="secondary"
          >
            Login
          </Button>
        </form>
      </React.Fragment>
    );
  }


  render() {
    const { classes } = this.props;
    const { isAuthenticated } = this.props.context;
    const { authenticator } = this.props.context.utils;
    const currentUser = authenticator.getCurrentUser();

    if (this.state.shouldRedirect) {
      return <Redirect to={this.getRedirectReferrer()} />;
    }

    return (
      <div>
        <div className={classes.landingImage}>
          <Typography variant="display2" gutterBottom className={classes.landingHeader} >
            SSN Admin Portal
          </Typography>
        </div>
        <Paper elevation={2} className={classes.root} square={true}>
          {isAuthenticated && currentUser.role === Role.ADMIN ? this.renderLoggedIn() : this.renderLoginForm()}
        </Paper>
      </div>);
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
    maxWidth: '30%',
    margin: `${theme.container.margin.vertical * 0.5}px auto`,
    padding: theme.spacing.unit * 4,
  },
  textInput: {
    marginBottom: '10px',
  },
  createButton: {
    display: 'block',
    margin: '5px auto',
    marginTop: '20px',
  },
  headline: {
    paddingBottom: '30px',
  },
  button: {
    marginTop: '10px',
    width: '100%',
  },
});

export const AdminLoginForm = withStyles(styles)(
  withTheme()(
    withContext(AppContext)(
      withForm(
        FieldName,
        constraints,
      )(_AdminLoginForm)
    ),
  ),
);
