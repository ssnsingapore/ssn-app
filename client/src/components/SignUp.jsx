import { FormControlLabel, Paper, Radio, RadioGroup, TextField, Typography, Button } from '@material-ui/core';
import { withStyles, withTheme } from '@material-ui/core/styles';
import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { withContext } from 'util/context';
import { extractErrors, formatErrors } from 'util/errors';
import { fieldErrorText, fieldHasError, getFieldNameObject, withForm } from 'util/form';
import { AppContext } from './main/AppContext';
import { AlertType } from './shared/Alert';


const SIGNUP_SUCCESS_MESSAGE = 'You\'ve successfully created a new account!';
const FieldName = getFieldNameObject([
  'email',
  'name',
  'accountType',
  'organisationName',
  'webUrl',
  'socialMedia',
  'description',
  'personalBio',
  'password',
  'passwordConfirmation',
]);

const AccountType = {
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
    presence: { allowEmpty: false },
    inclusion: Object.values(AccountType),
  },
  [FieldName.webUrl]: {
    isUrl: { allowEmpty: true },
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
          accountType: AccountType.ORGANIZATION,
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

  radioButton = () => {
    const { classes } = this.props;
    return <Radio classes={{ root: classes.radioButton, checked: classes.checked }} />;
  }

  renderOrganizationName = () => {
    const { classes, handleChange, fields } = this.props;

    return fields[FieldName.accountType].value === AccountType.ORGANIZATION &&
      <TextField
        name={FieldName.organisationName}
        className={classes.textInput}
        id={FieldName.organisationName}
        label="Organisation Name"
        onChange={handleChange}
        error={fieldHasError(fields, FieldName.organisationName)}
        helperText={fieldErrorText(fields, FieldName.organisationName)}
        fullWidth />;
  }

  renderDescriptionOrBio = () => {
    const { classes, handleChange, fields } = this.props;

    if (fields[FieldName.accountType].value === AccountType.ORGANIZATION) {
      return (
        <TextField name={FieldName.description}
          className={classes.textInput}
          id={FieldName.description}
          label="Description" onChange={handleChange}
          error={fieldHasError(fields, FieldName.description)}
          helperText={fieldErrorText(fields, FieldName.description)}
          fullWidth />
      );
    }

    return (
      <TextField name={FieldName.personalBio}
        className={classes.textInput}
        id={FieldName.personalBio}
        label="Personal bio" onChange={handleChange}
        error={fieldHasError(fields, FieldName.personalBio)}
        helperText={fieldErrorText(fields, FieldName.personalBio)}
        fullWidth />
    );
  }

  render() {
    const { classes, fields, handleChange } = this.props;

    if (this.state.createdUser) {
      return <Redirect to={{
        pathname: '/signup/confirmation',
        state: { projectOwner: this.state.createdUser },
      }} />;
    }

    return (
      <form onSubmit={this.handleSubmit}>
        <Paper elevation={2} className={classes.root} square={true}>
          <Typography variant="headline">Project Owner Details</Typography>
          <TextField
            name={FieldName.name}
            className={classes.textInput}
            id={FieldName.name}
            label="Name"
            required={true}
            onChange={handleChange}
            error={fieldHasError(fields, FieldName.name)}
            helperText={fieldErrorText(fields, FieldName.name)}
            fullWidth />
          <TextField
            name={FieldName.email}
            className={classes.textInput}
            id={FieldName.email}
            label="Email"
            required={true}
            onChange={handleChange}
            error={fieldHasError(fields, FieldName.email)}
            helperText={fieldErrorText(fields, FieldName.email)}
            fullWidth />
          <RadioGroup
            name={FieldName.accountType}
            value={fields[FieldName.accountType].value}
            onChange={handleChange}>
            <FormControlLabel checked={true}
              value={AccountType.ORGANIZATION}
              control={this.radioButton()}
              label="I am creating an account on behalf of an organisation" />
            <FormControlLabel value={AccountType.INDIVIDUAL}
              control={this.radioButton()}
              label="I am an individual" />
          </RadioGroup>
          {this.renderOrganizationName()}
          <TextField
            name={FieldName.webUrl}
            className={classes.textInput}
            id={FieldName.webUrl}
            label="Web URL"
            onChange={handleChange}
            error={fieldHasError(fields, FieldName.webUrl)}
            helperText={fieldErrorText(fields, FieldName.webUrl)}
            fullWidth />
          <TextField
            name={FieldName.socialMedia}
            className={classes.textInput}
            id={FieldName.socialMedia}
            label="Social Media"
            onChange={handleChange}
            error={fieldHasError(fields, FieldName.socialMedia)}
            helperText={fieldErrorText(fields, FieldName.socialMedia)} fullWidth />
          { this.renderDescriptionOrBio() }
          <TextField name={FieldName.password}
            className={classes.textInput}
            id={FieldName.password}
            label="Password" required={true}
            onChange={handleChange}
            error={fieldHasError(fields, FieldName.password)}
            helperText={fieldErrorText(fields, FieldName.password)}
            type="password" fullWidth />
          <TextField name={FieldName.passwordConfirmation}
            className={classes.textInput}
            id={FieldName.passwordConfirmation}
            required={true}
            label="Password Confirmation" onChange={handleChange}
            error={fieldHasError(fields, FieldName.passwordConfirmation)}
            helperText={fieldErrorText(fields, FieldName.passwordConfirmation)}
            type="password" fullWidth />

          <Button
            type="submit"
            size="medium"
            className={classes.createButton}
            disabled={this.state.isSubmitting}
            variant="contained"
            color="secondary"
          >
          Create Account
          </Button>
        </Paper>
      </form>
    );
  }
}

const styles = theme => ({
  root: {
    maxWidth: '500px',
    margin: '3% auto',
    padding: '2%',
  },
  textInput: {
    marginBottom: '5%',
  },
  radioButton: {
    '&$checked': {
      color: '#3E9992',
    },
  },
  checked: {},
  createButton: {
    display: 'block',
    margin: '30px auto',
  },
});

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
