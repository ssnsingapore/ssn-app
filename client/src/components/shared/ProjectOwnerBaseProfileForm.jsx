import { withStyles } from '@material-ui/core/styles';
import React from 'react';
import {
  Grid,
  Paper,
  TextField,
  Typography,
  RadioGroup,
  Radio,
  FormControlLabel,
  Button,
} from '@material-ui/core';
import { fieldErrorText, fieldHasError, fieldValue } from 'util/form';

import { AccountType } from 'components/shared/enums/AccountType';
import { Spinner } from 'components/shared/Spinner';
import { ProjectOwnerProfilePhotoUpload } from './ProjectOwnerProfilePhotoUpload';

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

const renderPassword = (classes, FieldName, fields, handleChange, isEditProfileForm) => {
  return !isEditProfileForm && (
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


const handleAccountTypeChange = (event, handleChange, resetField, FieldName) => {
  if (event.target.value === AccountType.ORGANISATION) {
    resetField(FieldName.personalBio);
  } else if (event.target.value === AccountType.INDIVIDUAL) {
    resetField(FieldName.organisationName);
    resetField(FieldName.description);
  }
  handleChange(event);
};

const _ProjectOwnerBaseProfileForm = ({
  FieldName,
  classes,
  fields,
  handleChange,
  handleSubmit,
  isSubmitting,
  isEditProfileForm,
  profilePhotoInput,
  resetField,
  handleShowPasswordChange,
  shouldShowPasswordChange }) => {
  return (
    <Grid container style={{ justifyContent: 'center' }}>
      <Grid item xs={9} md={4}>
        <Paper elevation={2} className={classes.root} square={true}>
          <Typography variant="h5">Project Owner Details</Typography>
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
            {
              isEditProfileForm &&
              <Button
                color="primary"
                size="medium"
                variant="contained"
                className={classes.buttons}
                component="span"
                onClick={handleShowPasswordChange}
              >
                Change my password
              </Button>
            }
            {
              (isEditProfileForm && shouldShowPasswordChange) &&
              <React.Fragment>
                <TextField
                  name={FieldName.password}
                  className={classes.textInput}
                  id={FieldName.password}
                  label="New Password"
                  required={true}
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
                  label="New Password Confirmation"
                  required={true}
                  onChange={handleChange}
                  value={fieldValue(fields, FieldName.passwordConfirmation) || ''}
                  error={fieldHasError(fields, FieldName.passwordConfirmation)}
                  helperText={fieldErrorText(fields, FieldName.passwordConfirmation)}
                  type="password"
                  fullWidth
                  margin="normal"
                />
              </React.Fragment>
            }
            <RadioGroup
              name={FieldName.accountType}
              value={fieldValue(fields, FieldName.accountType) || ''}
              onChange={event => handleAccountTypeChange(event, handleChange, resetField, FieldName)}
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
            {renderPassword(classes, FieldName, fields, handleChange, isEditProfileForm)}
            <ProjectOwnerProfilePhotoUpload
              profilePhotoInput={profilePhotoInput}
              profilePhotoUrl={fields.profilePhotoUrl}
            />
            <Button
              type="submit"
              size="medium"
              className={classes.buttons}
              disabled={isSubmitting}
              variant="contained"
              color="secondary"
            >
              {isEditProfileForm ? 'Update Account' : 'Create Account'}
            </Button>
          </form>
          {isSubmitting && <Spinner />}
        </Paper>
      </Grid>
    </Grid >
  );
};

const styles = theme => ({
  root: {
    margin: `${theme.container.margin.vertical}px auto`,
    padding: `${theme.container.padding.vertical}px ${theme.container.padding.horizontal}px`,
  },
  radioGroup: {
    marginTop: `${2 * theme.formInput.margin.vertical}px`,
  },
  buttons: {
    marginTop: theme.spacing.unit * 2,
  },
});

export const ProjectOwnerBaseProfileForm = withStyles(styles)(_ProjectOwnerBaseProfileForm);

ProjectOwnerBaseProfileForm.displayName = 'ProjectOwnerBaseProfileForm';

export const _testExports = {
  ProjectOwnerBaseProfileForm: _ProjectOwnerBaseProfileForm,
};