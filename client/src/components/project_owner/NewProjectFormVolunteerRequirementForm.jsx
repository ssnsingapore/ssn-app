import React from 'react';
import { withStyles, withTheme } from '@material-ui/core/styles';

import {
  withForm, getFieldNameObject, fieldValue, fieldErrorText, fieldHasError } from 'util/form';

import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import { TextField } from '@material-ui/core';

import { VolunteerRequirementType } from 'components/shared/enums/VolunteerRequirementType';
import { VolunteerRequirementTypeDisplayMapping } from 'components/shared/display_mappings/VolunteerRequirementTypeDisplayMapping';

const VolunteerRequirementFieldName = getFieldNameObject([
  'type',
  'commitmentLevel',
  'number']);

const volunteerRequirementConstraints = {
  [VolunteerRequirementFieldName.type]: {
    inclusion: Object.values(VolunteerRequirementType),
  },
  [VolunteerRequirementFieldName.commitmentLevel]: {
    presence: { allowEmpty: true },
  },
  [VolunteerRequirementFieldName.number]: {
    presence: { allowEmpty: true },
    numericality: true,
  },
};

class _NewProjectFormVolunteerRequirementForm extends React.Component {

  render() {
    const { fields, handleChange, classes } = this.props;
    return (
      <div>
        <FormControl className={classes.volTypeDropdown}>
          <InputLabel htmlFor={VolunteerRequirementFieldName.type}>
          Type of Volunteer
          </InputLabel>
          <Select
            name={VolunteerRequirementFieldName.type}
            id={VolunteerRequirementFieldName.type}
            key={VolunteerRequirementFieldName.type}
            value={fieldValue(fields, VolunteerRequirementFieldName.type)}
            error={fieldHasError(fields, VolunteerRequirementFieldName.type)}
            helperText={fieldErrorText(fields, VolunteerRequirementFieldName.type)}
            onChange={handleChange}
          >
            {Object.values(VolunteerRequirementType).map(
              (option) => {
                return(
                  <MenuItem key={option} value={option}>
                    {VolunteerRequirementTypeDisplayMapping[option]}
                  </MenuItem>
                );
              })}
          </Select>
        </FormControl>
        <TextField 
          InputLabelProps={{ shrink: true}}
          label='No. of Volunteers'
          margin='normal'
          name={VolunteerRequirementFieldName.number}
          id={VolunteerRequirementFieldName.number}
          key={VolunteerRequirementFieldName.number}
          value={fieldValue(fields, VolunteerRequirementFieldName.number)}
          error={fieldHasError(fields, VolunteerRequirementFieldName.number)}
          helperText={fieldErrorText(fields, VolunteerRequirementFieldName.number)}
          onChange={handleChange}
          className={classes.textfield}
        />
        <TextField 
          InputLabelProps={{ shrink: true}}
          label='Commitment Level'
          margin='normal'
          name={VolunteerRequirementFieldName.commitmentLevel}
          id={VolunteerRequirementFieldName.commitmentLevel}
          key={VolunteerRequirementFieldName.commitmentLevel}
          value={fieldValue(fields, VolunteerRequirementFieldName.commitmentLevel)}
          error={fieldHasError(fields, VolunteerRequirementFieldName.commitmentLevel)}
          helperText={fieldErrorText(fields, VolunteerRequirementFieldName.commitmentLevel)}
          onChange={handleChange}
          className={classes.textfield}
        />
      </div>
    );
  }
}



const styles = theme => ({
  volTypeDropdown: {
    marginTop: '0px',
    marginBottom: '0px',
    width: '33%',
    marginRight: '4px',
    height: '44px',
  },
  textfield: {
    marginTop: '0px',
    marginBottom: '0px',
    width: '32%',
    marginRight: '4px',
    height: '40px',
  },
}); 


export const NewProjectFormVolunteerRequirementForm = withStyles(styles)(
  withTheme()(
    withForm(
      VolunteerRequirementFieldName,
      volunteerRequirementConstraints
    )(_NewProjectFormVolunteerRequirementForm)));
