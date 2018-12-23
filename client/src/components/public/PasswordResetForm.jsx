import React, { Component } from 'react';
import { Paper, Typography, TextField, Button } from '@material-ui/core';
import { Redirect } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Cookie from 'js-cookie';
import qs from 'qs';

import { AppContext } from 'components/main/AppContext';
import { AlertType } from 'components/shared/Alert';
import { Spinner } from 'components/shared/Spinner';

import {
  withForm,
  fieldHasError,
  fieldErrorText,
  fieldValue,
  getFieldNameObject,
} from 'util/form';
import { MESSAGE_COOKIE_NAME } from 'util/constants';
import { withContext } from 'util/context';
import { PASSWORD_RESET_CSRF_COOKIE_NAME } from 'util/constants';
import { CSRF_TOKEN_KEY } from 'util/storage_keys';
import { formatErrors, extractErrors } from 'util/errors';

const FieldName = getFieldNameObject(['password', 'passwordConfirmation']);
const constraints = {
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

const validateGroupsMap = {
  fields: {
    [FieldName.password]: 'password',
    [FieldName.passwordConfirmation]: 'password',
  },
  validateGroups: {
    password: [FieldName.password, FieldName.passwordConfirmation],
  },
};

const PASSWORD_RESET_SUCCESS_MESSAGE = 'You have successully reset your password. Please try logging in.';

class _PasswordResetForm extends Component {
  state = {
    isLoading: false,
    redirectToLogin: false,
  }

  componentDidMount() {
    this.showPasswordResetMessage();
  }

  showPasswordResetMessage = () => {
    if (Cookie.get(MESSAGE_COOKIE_NAME)) {
      const { showAlert } = this.props.context.updaters;
      const paramsWithoutHash = this.props.location.hash.substring(1);
      const { message, type } = qs.parse(paramsWithoutHash);
      showAlert('passwordResetMessage', type, message);

      Cookie.remove(MESSAGE_COOKIE_NAME);
    }
  }

  handleSubmit = async (event) => {
    event.preventDefault();

    if (!this.props.validateAllFields()) {
      return;
    }

    const csrfToken = Cookie.get(PASSWORD_RESET_CSRF_COOKIE_NAME);
    localStorage.setItem(CSRF_TOKEN_KEY, csrfToken);
    Cookie.remove(PASSWORD_RESET_CSRF_COOKIE_NAME);

    this.setState({ isLoading: true });
    const { requestWithAlert } = this.props.context.utils;
    const { password } = this.props.valuesForAllFields();
    const response = await requestWithAlert
      .put('/api/v1/project_owners/password/reset', { password }, { authenticated: true });

    this.setState({ isLoading: false });

    const { showAlert } = this.props.context.updaters;

    if (response.isSuccessful) {
      showAlert('passwordResetSuccess', AlertType.SUCCESS, PASSWORD_RESET_SUCCESS_MESSAGE);
    }

    if (response.hasError) {
      const errors = await extractErrors(response);
      showAlert('passwordResetError', AlertType.ERROR, formatErrors(errors));
    }

    this.setState({ redirectToLogin: true });
  }

  render() {
    if (this.state.redirectToLogin) {
      return <Redirect to='/login' />;
    }

    const { classes, fields, handleChange } = this.props;

    return (<Paper square={true} className={classes.root} >
      <Typography variant="headline">Reset your password</Typography>
      <form onSubmit={this.handleSubmit}>
        <TextField
          name={FieldName.password}
          id={FieldName.password}
          label="Password"
          required={true}
          type="password"
          onChange={handleChange}
          value={fieldValue(fields, FieldName.password)}
          error={fieldHasError(fields, FieldName.password)}
          helperText={fieldErrorText(fields, FieldName.password)}
          fullWidth
          margin="normal"
        />
        <TextField
          name={FieldName.passwordConfirmation}
          id={FieldName.passwordConfirmation}
          label="Password confirmation"
          required={true}
          type="password"
          onChange={handleChange}
          value={fieldValue(fields, FieldName.passwordConfirmation)}
          error={fieldHasError(fields, FieldName.passwordConfirmation)}
          helperText={fieldErrorText(fields, FieldName.passwordConfirmation)}
          fullWidth
          margin="normal"
        />
        {this.state.isLoading && <Spinner />}
        <Button
          type="submit"
          size="medium"
          variant="contained"
          color="secondary"
          className={classes.resetButton}
          disabled={this.state.isLoading}
        >
          Reset Password
        </Button>
      </form>
    </Paper>
    );
  }
}

const styles = theme => ({
  root: {
    maxWidth: '450px',
    margin: `${theme.container.margin.vertical}px auto`,
    padding: `${theme.container.padding.vertical}px ${theme.container.padding.horizontal}px`,
  },
  resetButton: {
    display: 'block',
    margin: '30px auto',
    marginBottom: 0,
    color: '#FFFFFF',
  },
});

export const PasswordResetForm = withForm(
  FieldName,
  constraints,
  validateGroupsMap,
)(
  withStyles(styles)(
    withContext(AppContext)(
      _PasswordResetForm)
  )
);

export const _testExports = {
  PasswordResetForm: withForm(
    FieldName,
    constraints,
    validateGroupsMap,
  )(
    withStyles({})(
      _PasswordResetForm
    )),
};