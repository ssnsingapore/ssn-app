import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Grid, Paper, TextField, Typography, IconButton } from '@material-ui/core';
import { AddCircle as AddCircleIcon, RemoveCircle as RemoveCircleIcon } from '@material-ui/icons';

import { fieldErrorText, fieldHasError, fieldValue } from 'util/form';
import { VolunteerRequirementForm } from 'components/project_owner/VolunteerRequirementForm';

class _ProjectVolunteerDetails extends Component {


  renderVolunteerRequirements = () => {
    const { volunteerRequirementRefs, classes } = this.props;

    return volunteerRequirementRefs.map((volunteerRequirementRef, i) => {
      return (
        <div key={i} className={classes.volunteerRow}>
          <VolunteerRequirementForm ref={volunteerRequirementRef} />
          <IconButton onClick={() => this.props.handleDeleteVolunteerRequirement(i)} className={classes.button}>
            <RemoveCircleIcon />
          </IconButton>
        </div>
      );
    });
  }

  render() {
    const { FieldName, fields, handleChange, classes } = this.props;
    return (
      <React.Fragment>
        <Paper square className={classes.paper}>
          <Typography variant="headline">Volunteer Details</Typography>
          <Grid item xs={12}>
            <TextField
              fullWidth
              InputLabelProps={{ shrink: true}}
              label='Description of Volunteers Needed'
              margin='normal'
              name={FieldName.volunteerRequirementsDescription}
              id={FieldName.volunteerRequirementsDescription}
              key={FieldName.volunteerRequirementsDescription}
              value={fieldValue(fields, FieldName.volunteerRequirementsDescription)}
              error={fieldHasError(fields, FieldName.volunteerRequirementsDescription)}
              helper={fieldErrorText(fields, FieldName.volunteerRequirementsDescription)}
              onChange={handleChange}
              multiline
              className={classes.textField}
            />

            {this.renderVolunteerRequirements()}

            <IconButton
              onClick={this.props.handleAddVolunteerRequirement}
              className={classes.button}
            >
              <AddCircleIcon />
            </IconButton>

            <TextField
              fullWidth
              InputLabelProps={{ shrink: true}}
              label='Volunteer Benefits'
              margin='normal'
              name={FieldName.volunteerBenefitsDescription}
              id={FieldName.volunteerBenefitsDescription}
              key={FieldName.volunteerBenefitsDescription}
              value={fieldValue(fields, FieldName.volunteerBenefitsDescription)}
              error={fieldHasError(fields, FieldName.volunteerBenefitsDescription)}
              helper={fieldErrorText(fields, FieldName.volunteerBenefitsDescription)}
              onChange={handleChange}
              multiline
            />
          </Grid>
        </Paper>
      </React.Fragment>
    );
  }
}

const styles = theme => ({
  root: {
    display: 'flex',
    width: '80vw',
    margin: '0 auto',
  },
  submitButton: {
    padding: '2px',
    margin: '2px',
    width: '100px',
  },
  img: {
    marginTop: '6px',
    marginBottom: '6px',
    marginLeft: '0px',
    padding: '30px',
  },
  paper: {
    marginTop: '6px',
    marginBottom: '6px',
    padding: '30px',
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
  rows: {
    margin: '0px',
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