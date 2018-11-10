import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Grid, Paper, TextField, Typography, IconButton } from '@material-ui/core';
import { AddCircle as AddCircleIcon, RemoveCircle as RemoveCircleIcon } from '@material-ui/icons';

import { fieldErrorText, fieldHasError, fieldValue } from 'util/form';
import { VolunteerRequirementForm } from './VolunteerRequirementForm';
import { FieldName } from './ProjectFormFields';

const renderVolunteerRequirements = (
  volunteerRequirementRefs,
  classes,
  handleDeleteVolunteerRequirement,
  volunteerRequirements
) => {
  return volunteerRequirementRefs.map((volunteerRequirementRef, i) => {
    return (
      <div key={i} className={classes.volunteerRow}>
        <VolunteerRequirementForm
          ref={volunteerRequirementRef}
          volunteerRequirement={volunteerRequirements[i]}
        />
        <IconButton
          onClick={() => handleDeleteVolunteerRequirement(i)}
          className={classes.button}
        >
          <RemoveCircleIcon />
        </IconButton>
      </div>
    );
  });
};

const _ProjectVolunteerDetails = ({
  volunteerRequirementRefs,
  classes,
  handleDeleteVolunteerRequirement,
  fields,
  handleChange,
  handleAddVolunteerRequirement,
  volunteerRequirements,
}) => {
  return (
    <React.Fragment>
      <Paper square className={classes.paper}>
        <Typography variant="headline">Volunteer Details</Typography>
        <Grid item xs={12}>
          <TextField
            fullWidth
            InputLabelProps={{ shrink: true }}
            label="Description of Volunteers Needed"
            margin="normal"
            name={FieldName.volunteerRequirementsDescription}
            id={FieldName.volunteerRequirementsDescription}
            key={FieldName.volunteerRequirementsDescription}
            value={fieldValue(fields, FieldName.volunteerRequirementsDescription) || ''}
            error={fieldHasError(fields, FieldName.volunteerRequirementsDescription)}
            helperText={fieldErrorText(fields, FieldName.volunteerRequirementsDescription)}
            onChange={handleChange}
            multiline
            className={classes.textField}
          />

          {renderVolunteerRequirements(
            volunteerRequirementRefs,
            classes,
            handleDeleteVolunteerRequirement,
            volunteerRequirements
          )}

          <IconButton
            onClick={handleAddVolunteerRequirement}
            className={classes.button}
          >
            <AddCircleIcon />
          </IconButton>

          <TextField
            fullWidth
            InputLabelProps={{ shrink: true }}
            label="Volunteer Benefits"
            margin="normal"
            name={FieldName.volunteerBenefitsDescription}
            id={FieldName.volunteerBenefitsDescription}
            key={FieldName.volunteerBenefitsDescription}
            value={fieldValue(fields, FieldName.volunteerBenefitsDescription) || ''}
            error={fieldHasError(fields, FieldName.volunteerBenefitsDescription)}
            helperText={fieldErrorText(fields, FieldName.volunteerBenefitsDescription)}
            onChange={handleChange}
            multiline
          />
        </Grid>
      </Paper>
    </React.Fragment>
  );
};

const styles = theme => ({
  root: {
    display: 'flex',
    margin: '0 auto',
  },
  paper: {
    padding: '30px',
    height: '100%',
  },
  button: {
    color: 'black',
    margin: '0px',
    marginLeft: '5px',
    transform: 'scale(0.8)',
    height: '15px',
    width: '15px',
    marginBottom: '20px',
    marginTop: '5px',
    padding: '5px',
  },
  textField: {
    marginBottom: '25px',
  },
  volunteerRow: {
    display: 'flex',
    marginTop: '20px',
  },
});


export const ProjectVolunteerDetails = withStyles(styles)(_ProjectVolunteerDetails);
