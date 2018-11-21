import React from 'react';
import { Redirect, Link } from 'react-router-dom';
import { withStyles, withTheme } from '@material-ui/core/styles';
import {
  Typography,
  Button,
  TextField,
  Paper,
  Grid,
} from '@material-ui/core';
import Cookie from 'js-cookie';
import qs from 'qs';

import { PasswordResetDialog } from './PasswordResetDialog';
import { AlertType } from 'components/shared/Alert';
import { withContext } from 'util/context';
import { AppContext } from 'components/main/AppContext';
import { extractErrors, formatErrors } from 'util/errors';
import { MESSAGE_COOKIE_NAME } from 'util/constants';
import {
  getFieldNameObject,
  fieldValue,
  fieldHasError,
  fieldErrorText,
  withForm,
} from 'util/form';
import { Role } from 'components/shared/enums/Role';

const LOGIN_SUCCESS_MESSAGE = 'You\'ve successfully logged in!';
const LOGIN_FAILURE_MESSAGE = 'Looks like you\'ve keyed in the wrong credentials. Try again!';

const LOGOUT_SUCCESS_MESSAGE = 'You\'ve successfully logged out!';
const LOGOUT_FAILURE_MESSAGE = 'We\'ve encountered an error logging you out. Please try again!';

const FieldName = getFieldNameObject(['email', 'password']);
const constraints = {
  [FieldName.email]: {
    presence: { allowEmpty: false },
    email: true,
  },
  [FieldName.password]: {
    presence: { allowEmpty: false },
    length: {
      minimum: 6,
    },
  },
};

const styles = theme => ({
  root: {
  },
  standaloneRoot: {
    maxWidth: '400px',
    padding: theme.spacing.unit * 2,
    margin: `${theme.container.margin.vertical * 0.5}px auto`,
  },
  rootLoggedIn: {
    padding: theme.spacing.unit * 4,
  },
  standaloneRootLoggedIn: {
    maxWidth: '400px',
    margin: `${theme.container.margin.vertical}px auto`,
    padding: theme.spacing.unit * 4,
  },

  form: {
    marginTop: '10px',
    padding: theme.spacing.unit * 4,
  },
  loginButton: {
    marginTop: theme.spacing.unit * 6,
    marginBottom: theme.spacing.unit * 1,
  },
  signupButton: {
    marginTop: theme.spacing.unit * 1,
    marginBottom: theme.spacing.unit * 4,
  },
  forgotPasswordButton: {
    textTransform: 'none',
    fontWeight: 'normal',
  },
  margin3: {
    margin: theme.spacing.unit * 3,
  },
  button: {
    margin: '0 auto',
    marginTop: '10px',
    width: '100%',
  },
  marginBottom3: {
    marginBottom: theme.spacing.unit * 1,
  },
});

class _ProjectOwnerLoginForm extends React.Component {

  state = {
    passwordResetDialogOpen: false,
    isLoading: false,
    shouldRedirect: false,
  }

  componentDidMount() {
    this.showAccountConfirmationMessage();
  }

  handlePasswordResetDialog = () => {
    this.setState({ passwordResetDialogOpen: true });
  }

  handlePasswordResetDialogClose = () => {
    this.setState({ passwordResetDialogOpen: false });
  }

  handleSubmit = async (event) => {
    event.preventDefault();

    if (!this.props.validateAllFields()) {
      return;
    }

    const { showAlert } = this.props.context.updaters;
    const { authenticator } = this.props.context.utils;

    this.setState({ isLoading: true });

    const { email, password } = this.props.valuesForAllFields();
    const response = await authenticator.loginProjectOwner(email, password);

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

  showAccountConfirmationMessage = () => {
    const { showAlert } = this.props.context.updaters;

    if (Cookie.get(MESSAGE_COOKIE_NAME)) {
      const paramsWithoutHash = this.props.location.hash.substring(1);
      const { message, type } = qs.parse(paramsWithoutHash);
      showAlert('confirmationMessage', type, message);

      Cookie.remove(MESSAGE_COOKIE_NAME);
    }
  }


  handleLogout = async (currentUser) => {

    const { authenticator } = this.props.context.utils;
    const { showAlert } = this.props.context.updaters;

    this.setState({ isLoggingOut: true });

    const response = currentUser.role === Role.PROJECT_OWNER ?
      await authenticator.logoutProjectOwner() : await authenticator.logoutAdmin();

    if (response.isSuccessful) {
      showAlert('logoutSuccess', AlertType.SUCCESS, LOGOUT_SUCCESS_MESSAGE);
    }
    if (response.hasError) {
      showAlert('logoutFailure', AlertType.ERROR, LOGOUT_FAILURE_MESSAGE);
    }
    this.setState({ isLoggingOut: false });
  }


  renderLoggedIn() {
    const { classes } = this.props;
    const { authenticator } = this.props.context.utils;
    const currentUser = authenticator.getCurrentUser();

    const rootStyle = this.props.location && this.props.location.pathname === '/login' ?
      classes.standaloneRootLoggedIn : classes.rootLoggedIn;

    return (
      <Paper className={rootStyle} square>
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
        >
          Logout
        </Button>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to={currentUser.role === Role.PROJECT_OWNER ? '/project_owner/dashboard' : '/admin/dashboard'}
          className={classes.button}
        >
          Go to Dashboard
        </Button>
      </Paper>
    );

  }

  renderLoginForm() {
    const { classes, fields, handleChange } = this.props;
    const rootStyle = this.props.location && this.props.location.pathname === '/login' ?
      classes.standaloneRoot : classes.root;

    return (
      <Grid container className={rootStyle}>
        <Grid item xs={12}>
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
        </Grid>
        <Grid item xs={12}>
          <Paper className={classes.form} square>
            <PasswordResetDialog
              open={this.state.passwordResetDialogOpen}
              handleClose={this.handlePasswordResetDialogClose}
            />
            <form className={classes.container} onSubmit={this.handleSubmit}>
              <TextField
                InputLabelProps={{ shrink: true }}
                placeholder="Email"
                margin="normal"
                name={FieldName.email}
                value={fieldValue(fields, FieldName.email) || ''}
                error={fieldHasError(fields, FieldName.email)}
                helperText={fieldErrorText(fields, FieldName.email)}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                InputLabelProps={{ shrink: true }}
                placeholder="Password"
                margin="normal"
                fullWidth
                name={FieldName.password}
                value={fieldValue(fields, FieldName.password) || ''}
                error={fieldHasError(fields, FieldName.password)}
                helperText={fieldErrorText(fields, FieldName.password)}
                onChange={handleChange}
                type="password"
              />
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                size="large"
                fullWidth
                disabled={this.state.isLoading}
                className={classes.loginButton}
              >
                Login
              </Button>
              <Button
                size="small"
                fullWidth
                onClick={this.handlePasswordResetDialog}
                className={classes.forgotPasswordButton}
              >
                Forgot password?
              </Button>
              <Typography
                gutterBottom
                align="center"
                className={classes.margin3}
              >
                or
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                className={classes.signupButton}
                component={Link}
                to="/signup"
              >
                Sign Up
              </Button>
            </form>
          </Paper>
        </Grid>
      </Grid>
    );
  }

  getRedirectReferrer = () => {
    const locationState = this.props.location.state;
    if (locationState && locationState.referrerPath) {
      return locationState.referrerPath;
    }
    return '/project_owner/dashboard';
  }

  render() {
    const { isAuthenticated } = this.props.context;

    if (this.state.shouldRedirect) {
      return <Redirect to={this.getRedirectReferrer()} />;
    }

    return isAuthenticated ? this.renderLoggedIn() : this.renderLoginForm();
  }

}



export const ProjectOwnerLoginForm =
  withTheme()(
    withStyles(styles)(
      withContext(AppContext)(
        withForm(
          FieldName,
          constraints,
        )(_ProjectOwnerLoginForm),
      ),
    ),
  );

export const TestProjectOwnerLoginForm = withForm(
  FieldName,
  constraints,
)(_ProjectOwnerLoginForm);