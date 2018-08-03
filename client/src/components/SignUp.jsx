import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { Grid, TextField, Button } from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';

import { AppContext } from './AppContext';
import { AlertType } from './Alert';
import { withContext } from 'util/context';
import { extractErrors, formatErrors } from 'util/errors';
import {
  getFieldNameObject,
  fieldValue,
  fieldHasError,
  fieldErrorText,
  withForm,
} from 'util/form';

const SIGNUP_SUCCESS_MESSAGE = 'You\'ve successfully created a new account!';
const FieldName = getFieldNameObject([
  'email',
  'name',
  'password',
  'passwordConfirmation',
]);
const constraints = {
  [FieldName.name]: {
    presence: { allowEmpty: false },
    length: { maximum: 50 },
  },
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
  [FieldName.passwordConfirmation]: {
    presence: { allowEmpty: false },
    sameValueAs: {
      other: FieldName.password,
    },
  },
};

class _SignUp extends Component {
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

    const { requestWithAlert } = this.props.context.utils;
    const { showAlert } = this.props.context.updaters;

    const { email, name, password } = this.props.valuesForAllFields();
    const data = {
      user: { email, name, password },
    };
    const response = await requestWithAlert
      .post('/api/v1/users', data);

    if (response.isSuccessful) {
      this.setState({ shouldRedirect: true });
      showAlert('signupSuccess', AlertType.SUCCESS, SIGNUP_SUCCESS_MESSAGE);
    }

    if (response.hasError) {
      const errors = await extractErrors(response);
      showAlert('signupFailure', AlertType.ERROR, formatErrors(errors));
    }
  }

  render() {
    const { theme, classes, fields, handleChange } = this.props;

    if (this.state.shouldRedirect) {
      return <Redirect to={'/todos'} />;
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
                fullWidth
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Name"
                type="text"
                name={FieldName.name}
                id={FieldName.name}
                placeholder="Your name"
                value={fieldValue(fields, FieldName.name)}
                onChange={handleChange}
                error={fieldHasError(fields, FieldName.name)}
                helperText={fieldErrorText(fields, FieldName.name)}
                fullWidth
              />
            </Grid>
          </Grid>

          <Grid
            container
            justify="center"
            spacing={2 * theme.spacing.unit}
            className={classes.root}
          >
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
                fullWidth
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Password confirmation"
                type="password"
                name={FieldName.passwordConfirmation}
                id={FieldName.passwordConfirmation}
                placeholder="Confirm you password"
                value={fieldValue(fields, FieldName.passwordConfirmation)}
                onChange={handleChange}
                error={fieldHasError(fields, FieldName.passwordConfirmation)}
                helperText={fieldErrorText(fields, FieldName.passwordConfirmation)}
                fullWidth
              />
            </Grid>
          </Grid>

          <Grid
            item
            className={classes.fullWidthRow}
          >
            <Button
              type="submit"
              variant="contained"
              fullWidth
            >Sign up</Button>
          </Grid>

          <Grid item>
            or
          </Grid>
          <Grid item>
            <Button
              color="primary"
              variant="outlined"
              component={Link}
              to="/todos/login"
            >
              Log in
            </Button>
          </Grid>
        </Grid>
      </form>
    );
  }
}

const styles = {
  root: {
    maxWidth: '500px',
    margin: '0 auto',
  },
  fullWidthRow: {
    width: '100%',
  },
};

export const SignUp = withStyles(styles)(
  withTheme()(
    withContext(AppContext,
      withForm(
        FieldName,
        constraints,
      )(_SignUp)
    ),
  ),
);
