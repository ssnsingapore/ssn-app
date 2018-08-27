import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { Grid, TextField, Button } from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';

import { AppContext } from './main/AppContext';
import { AlertType } from './shared/Alert';
import { withContext } from 'util/context';
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

class _Login extends Component {
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

    const { email, password } = this.props.valuesForAllFields();
    const response = await authenticator.login(email, password);

    this.setState({ isLoading: false });

    if (response.isSuccessful) {
      this.setState({ shouldRedirect: true });
      showAlert('loginSuccess', AlertType.SUCCESS, LOGIN_SUCCESS_MESSAGE);
    }

    if (response.hasError) {
      showAlert('loginFailure', AlertType.ERROR, LOGIN_FAILURE_MESSAGE);
    }
  }

  getRedirectReferer = () => {
    const locationState = this.props.location.state;
    if (locationState && locationState.from) {
      return locationState.from.pathname;
    }

    return '/todos';
  }

  render() {
    const { theme, classes, fields, handleChange } = this.props;

    if (this.state.shouldRedirect) {
      return <Redirect to={this.getRedirectReferer()} />;
    }

    return (
      <form onSubmit={this.handleSubmit}>
        <Grid
          container
          alignItems="center"
          alignContent="stretch"
          direction="column"
          spacing={2 * theme.spacing.unit}
          className={classes.root}
        >
          <Grid
            container
            justify="center"
            spacing={2 * theme.spacing.unit}
            item
          >
            <Grid item xs={6}>
              <TextField
                label="Email"
                type="email"
                name={FieldName.email}
                id={FieldName.email}
                placeholder="Your email"
                value={fieldValue(fields, FieldName.email)}
                onChange={handleChange}
                error={fieldHasError(fields, FieldName.email)}
                helperText={fieldErrorText(fields, FieldName.email)}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Password"
                type="password"
                name={FieldName.password}
                id={FieldName.password}
                placeholder="Your password"
                value={fieldValue(fields, FieldName.password)}
                onChange={handleChange}
                error={fieldHasError(fields, FieldName.password)}
                helperText={fieldErrorText(fields, FieldName.password)}
              />
            </Grid>
          </Grid>

          <Grid
            item
            className={classes.fullWidthRow}
          >
            <Button
              disabled={this.state.isLoading}
              type="submit"
              variant="contained"
              fullWidth
            >Log in</Button>
          </Grid>

          <Grid item>
            or
          </Grid>
          <Grid item>
            <Button
              color="primary"
              variant="outlined"
              component={Link}
              to="/signup"
            >
              Sign up
            </Button>
          </Grid>

        </Grid>
      </form>
    );
  }
};

const styles = {
  root: {
    maxWidth: '500px',
    margin: '0 auto',
  },
  fullWidthRow: {
    width: '100%',
  },
};

export const Login =
  withStyles(styles)(
    withTheme()(
      withContext(AppContext)(
        withForm(
          FieldName,
          constraints,
        )(_Login),
      ),
    ),
  );
