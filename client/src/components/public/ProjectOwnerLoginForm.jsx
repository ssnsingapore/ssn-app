import React from 'react';
import { Redirect, Link } from 'react-router-dom';
import { withStyles, withTheme } from '@material-ui/core/styles';
import {
  Typography,
  Button,
  TextField,
  Paper,
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

const LOGIN_SUCCESS_MESSAGE = 'You\'ve successfully logged in!';
const LOGIN_FAILURE_MESSAGE = 'Looks like you\'ve keyed in the wrong credentials. Try again!';

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
    padding: theme.spacing.unit * 4,
  },
  standaloneRoot: {
    maxWidth: '400px',
    padding: theme.spacing.unit * 4,
    margin: `${theme.container.margin.vertical}px auto`,
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
});

class _ProjectOwnerLoginForm extends React.Component {
  state = {
    passwordResetDialogOpen: false,
    isLoading: false,
    shouldRedirect: false,
  }

  componentDidMount () {
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

    this.setState( { isLoading: true } );

    const { email, password } = this.props.valuesForAllFields();
    const response = await authenticator.loginProjectOwner(email, password);

    this.setState( { isLoading: false });

    if (response.isSuccessful) {
      this.setState( { shouldRedirect: true } );
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

  render() {
    if (this.state.shouldRedirect) {
      return <Redirect to="/project_owner/dashboard"/>;
    }

    const { classes, fields, handleChange } = this.props;
    const rootStyle = this.props.location && this.props.location.pathname === '/login' ?
      classes.standaloneRoot : classes.root;

    return (
      <Paper className={rootStyle} square>
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
            value={fieldValue(fields, FieldName.password)}
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
    );
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