import { withStyles } from '@material-ui/core/styles';
import React from 'react';
import { Paper, TextField, Typography, RadioGroup, Radio, FormControlLabel, Button } from '@material-ui/core';
import { fieldErrorText, fieldHasError, fieldValue } from 'util/form';

import { AccountType } from 'components/shared/enums/AccountType';
import { Spinner } from 'components/shared/Spinner';

const renderOrganisationName = (classes, FieldName, fields, handleChange) => {
  return fields[FieldName.accountType].value === AccountType.ORGANISATION &&
    <TextField
      required
      name={FieldName.organisationName}
      className={classes.textInput}
      id={FieldName.organisationName}
      label="Organisation Name"
      onChange={handleChange}
      value={fieldValue(fields, FieldName.organisationName) || ''}
      error={fieldHasError(fields, FieldName.organisationName)}
      helperText={fieldErrorText(fields, FieldName.organisationName)}
      fullWidth />;
};

const renderDescriptionOrBio = (classes, FieldName, fields, handleChange) => {
  if (fieldValue(fields, FieldName.accountType) === AccountType.ORGANISATION) {
    return (
      <TextField
        name={FieldName.description}
        className={classes.textInput}
        id={FieldName.description}
        label="Description"
        onChange={handleChange}
        value={fieldValue(fields, FieldName.description) || ''}
        error={fieldHasError(fields, FieldName.description)}
        helperText={fieldErrorText(fields, FieldName.description)}
        fullWidth
        margin="normal"
      />
    );
  }
  return (
    <TextField
      name={FieldName.personalBio}
      className={classes.textInput}
      id={FieldName.personalBio}
      label="Personal bio"
      onChange={handleChange}
      value={fieldValue(fields, FieldName.personalBio) || ''}
      error={fieldHasError(fields, FieldName.personalBio)}
      helperText={fieldErrorText(fields, FieldName.personalBio)}
      fullWidth
      margin="normal"
    />
  );
};

const renderPassword = (classes, FieldName, fields, handleChange) => {
  return !!fields[FieldName.password] && (
    <React.Fragment>
      <TextField
        name={FieldName.password}
        className={classes.textInput}
        id={FieldName.password}
        label="Password" required={true}
        onChange={handleChange}
        value={fieldValue(fields, FieldName.password) || ''}
        error={fieldHasError(fields, FieldName.password)}
        helperText={fieldErrorText(fields, FieldName.password)}
        type="password"
        fullWidth
        margin="normal"
      />
      <TextField
        name={FieldName.passwordConfirmation}
        className={classes.textInput}
        id={FieldName.passwordConfirmation}
        required={true}
        label="Password Confirmation"
        onChange={handleChange}
        value={fieldValue(fields, FieldName.passwordConfirmation) || ''}
        error={fieldHasError(fields, FieldName.passwordConfirmation)}
        helperText={fieldErrorText(fields, FieldName.passwordConfirmation)}
        type="password"
        fullWidth
        margin="normal"
      />
    </React.Fragment>
  );
};

const _ProjectOwnerBaseProfileForm = ({ FieldName, classes, fields, handleChange, handleSubmit, isSubmitting, isEditProfileForm }) => {
  return (
    <Paper elevation={2} className={classes.root} square={true}>
      <Typography variant="headline">Project Owner Details</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          name={FieldName.name}
          className={classes.textInput}
          id={FieldName.name}
          label="Name"
          required={true}
          onChange={handleChange}
          value={fieldValue(fields, FieldName.name) || ''}
          error={fieldHasError(fields, FieldName.name)}
          helperText={fieldErrorText(fields, FieldName.name)}
          fullWidth
          margin="normal"
        />
        <TextField
          name={FieldName.email}
          className={classes.textInput}
          id={FieldName.email}
          label="Email"
          required={true}
          onChange={handleChange}
          value={fieldValue(fields, FieldName.email) || ''}
          error={fieldHasError(fields, FieldName.email)}
          helperText={fieldErrorText(fields, FieldName.email)}
          fullWidth
          margin="normal"
        />
        <RadioGroup
          name={FieldName.accountType}
          value={fieldValue(fields, FieldName.accountType) || ''}
          onChange={handleChange}
          className={classes.radioGroup}
        >
          <FormControlLabel
            value={AccountType.ORGANISATION}
            control={<Radio color="primary" />}
            label="I am creating an account on behalf of an organisation" />
          <FormControlLabel
            value={AccountType.INDIVIDUAL}
            control={<Radio color="primary" />}
            label="I am an individual" />
        </RadioGroup>
        {renderOrganisationName(classes, FieldName, fields, handleChange)}
        <TextField
          name={FieldName.websiteUrl}
          className={classes.textInput}
          id={FieldName.websiteUrl}
          label="Web URL"
          onChange={handleChange}
          value={fieldValue(fields, FieldName.websiteUrl) || ''}
          error={fieldHasError(fields, FieldName.websiteUrl)}
          helperText={fieldErrorText(fields, FieldName.websiteUrl)}
          fullWidth
          margin="normal"
        />
        <TextField
          name={FieldName.socialMediaLink}
          className={classes.textInput}
          id={FieldName.socialMediaLink}
          label="Social Media"
          onChange={handleChange}
          value={fieldValue(fields, FieldName.socialMediaLink) || ''}
          error={fieldHasError(fields, FieldName.socialMediaLink)}
          helperText={fieldErrorText(fields, FieldName.socialMediaLink)}
          fullWidth
          margin="normal"
        />
        {renderDescriptionOrBio(classes, FieldName, fields, handleChange)}
        {renderPassword(classes, FieldName, fields, handleChange)}

        <Button
          type="submit"
          size="medium"
          className={classes.createButton}
          disabled={isSubmitting}
          variant="contained"
          color="secondary"
        >
          {isEditProfileForm ? 'Update Account' : 'Create Account'}
        </Button>
      </form>

      {isSubmitting && <Spinner />}
    </Paper>
  );
};

const styles = theme => ({
  root: {
    maxWidth: '450px',
    margin: `${theme.container.margin.vertical}px auto`,
    padding: `${theme.container.padding.vertical}px ${theme.container.padding.horizontal}px`,
  },
  radioGroup: {
    marginTop: `${2 * theme.formInput.margin.vertical}px`,
  },
  createButton: {
    display: 'block',
    margin: '30px auto',
    marginBottom: 0,
    color: '#FFFFFF',
  },
});

export const ProjectOwnerBaseProfileForm = withStyles(styles)(_ProjectOwnerBaseProfileForm);