import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { Grid, TextField, Button, Paper, Typography, RadioGroup, FormControlLabel, Radio } from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';

import { AppContext } from './main/AppContext';
import { AlertType } from './shared/Alert';
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
  'accountType',
  'password',
  'passwordConfirmation',
]);

export const AccountType = {
  ORGANIZATION: 'ORGANIZATION',
  INDIVIDUAL: 'INDIVIDUAL',
};

const constraints = {
  [FieldName.name]: {
    presence: { allowEmpty: false },
    length: { maximum: 50 },
  },
  [FieldName.email]: {
    presence: { allowEmpty: false },
    email: true,
  },
  [FieldName.accountType]: {
    inclusion: Object.values(AccountType), 
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
      isSubmitting: false,
      createdUser: null,
    };
  }

  handleSubmit = async (event) => {
    event.preventDefault();

    if (!this.props.validateAllFields()) {
      return;
    }

    const { authenticator } = this.props.context.utils;
    const { showAlert } = this.props.context.updaters;

    const { email, name, password } = this.props.valuesForAllFields();
    const user = {
      name,
      email,
      password,
    };

    this.setState({ isSubmitting: true });
    const response = await authenticator.signUp(user);
    this.setState({ isSubmitting: false });

    if (response.isSuccessful) {
      const createdUser = (await response.json()).user;
      this.setState({
        createdUser: {
          // temporary to stub fields for projectOwner but not on user
          ...createdUser,
          accountType: 'organization',
          organizationName: 'Earth Society',
        },
      });
      showAlert('signupSuccess', AlertType.SUCCESS, SIGNUP_SUCCESS_MESSAGE);
    }

    if (response.hasError) {
      const errors = await extractErrors(response);
      showAlert('signupFailure', AlertType.ERROR, formatErrors(errors));
    }
  }

  render() {
    const { theme, classes, fields, handleChange } = this.props;

    if (this.state.createdUser) {
      return <Redirect to={{
        pathname: '/signup/confirmation',
        state: { projectOwner: this.state.createdUser },
      }} />;
    }

    return (
      <form onSubmit={this.handleSubmit}>
        <Paper className={classes.root}>
          <Typography variant="headline">Project Owner Details</Typography>
          <TextField label="Name" 
            required={true} 
            onChange={handleChange}
            name={FieldName.name}
            value={fieldValue(fields, FieldName.name)}
            error={fieldHasError(fields, FieldName.name)} 
            helperText={fieldErrorText(fields, FieldName.name)} fullWidth />
          <TextField label="Email" required={true}
            onChange={handleChange}
            name={FieldName.email}
            value={fieldValue(fields, FieldName.email)}
            error={fieldHasError(fields, FieldName.email)}
            helperText={fieldErrorText(fields, FieldName.email)} fullWidth />
          <RadioGroup
            aria-label={FieldName.accountType}
            name={FieldName.accountType}
            value={fieldValue(fields, FieldName.accountType)}
            onChange={handleChange}
          >
            <FormControlLabel value={AccountType.ORGANIZATION} control={<Radio />} label="I am creating an account on behalf of an organisation" />
            <FormControlLabel value={AccountType.INDIVIDUAL} control={<Radio />} label="I am an individual" />
          </RadioGroup>
        </Paper>
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
    withContext(AppContext)(
      withForm(
        FieldName,
        constraints,
      )(_SignUp)
    ),
  ),
);
