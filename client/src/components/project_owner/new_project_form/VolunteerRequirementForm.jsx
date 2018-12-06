import React from 'react';
import { withStyles, withTheme } from '@material-ui/core/styles';

import {
  withForm,
  getFieldNameObject,
  fieldValue,
  fieldErrorText,
  fieldHasError,
} from 'util/form';

import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import { TextField } from '@material-ui/core';

import { VolunteerRequirementType } from 'components/shared/enums/VolunteerRequirementType';
import { VolunteerRequirementTypeDisplayMapping } from 'components/shared/display_mappings/VolunteerRequirementTypeDisplayMapping';

export const VolunteerRequirementFieldName = getFieldNameObject([
  'type',
  'commitmentLevel',
  'number',
]);

const isNotEmptyRow = attributes =>
  Object.values(attributes).some(field => !!field);

export const volunteerRequirementConstraints = {
  [VolunteerRequirementFieldName.type]: (_value, attributes) => {
    if (isNotEmptyRow(attributes)) {
      return {
        presence: true,
        inclusion: Object.values(VolunteerRequirementType),
      };
    }
  },
  [VolunteerRequirementFieldName.number]: (_value, attributes) => {
    if (isNotEmptyRow(attributes)) {
      return {
        presence: true,
        numericality: true,
      };
    }
  },
  [VolunteerRequirementFieldName.commitmentLevel]: (_value, attributes) => {
    if (isNotEmptyRow(attributes)) {
      return {
        presence: true,
      };
    }
  },
};

export const addVolunteerRequirementRef = (volunteerRequirementRefs) => {
  const rowIndexes = Object.keys(volunteerRequirementRefs);
  const isEmpty = rowIndexes.length === 0;
  const index = isEmpty ? 0 : Math.max(...rowIndexes) + 1;
  return {
    ...volunteerRequirementRefs,
    [index]: React.createRef(),
  };
};

export const deleteVolunteerRequirementRef = (volunteerRequirementRefs, index) => {
  const newVolunteerRequirementRefs = { ...volunteerRequirementRefs };
  delete newVolunteerRequirementRefs[index];
  return newVolunteerRequirementRefs;
};

export const validateFormFields = (volunteerRequirementRefs) => 
  Object.values(volunteerRequirementRefs)
    .every(ref => ref.current.validateAllFields());

export const resetAllFields = (volunteerRequirementRefs) => {
  Object.values(volunteerRequirementRefs).forEach(ref => ref.current.resetAllFields());
};

export const valuesForAllFields = (volunteerRequirementRefs) => {
  if (Object.keys(volunteerRequirementRefs).length === 0) return [];
  
  return Object.values(volunteerRequirementRefs).reduce((values, ref) => {
    const fields = ref.current.valuesForAllFields();
    const isEmptyRow = Object.values(fields).every(field => !field);
    if (isEmptyRow) return values;
    return [...values, fields];
  }, []);
};

export const setFields = (ref, volunteerRequirements) => 
  Object.keys(volunteerRequirements).forEach(field =>
    ref.current.setField(
      VolunteerRequirementFieldName[field], volunteerRequirements[field]
    )
  );

class _VolunteerRequirementForm extends React.Component {
  
  render() {
    const { fields, handleChange, classes } = this.props;
    return (
      <React.Fragment>
        <FormControl className={classes.volTypeDropdown}>
          <InputLabel htmlFor={VolunteerRequirementFieldName.type} shrink>
            Type of Volunteer
          </InputLabel>
          <Select
            name={VolunteerRequirementFieldName.type}
            id={VolunteerRequirementFieldName.type}
            key={VolunteerRequirementFieldName.type}
            value={fieldValue(fields, VolunteerRequirementFieldName.type) || ''}
            error={fieldHasError(fields, VolunteerRequirementFieldName.type)}
            onChange={handleChange}
          >
            {Object.values(VolunteerRequirementType).map(option => {
              return (
                <MenuItem key={option} value={option}>
                  {VolunteerRequirementTypeDisplayMapping[option]}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        <TextField
          InputLabelProps={{ shrink: true }}
          label="No. of Volunteers"
          type="number"
          inputProps={{ min: '1' }}
          margin="normal"
          name={VolunteerRequirementFieldName.number}
          id={VolunteerRequirementFieldName.number}
          key={VolunteerRequirementFieldName.number}
          value={fieldValue(fields, VolunteerRequirementFieldName.number) || ''}
          error={fieldHasError(fields, VolunteerRequirementFieldName.number)}
          helperText={fieldErrorText(
            fields,
            VolunteerRequirementFieldName.number
          )}
          onChange={handleChange}
          className={classes.textfield}
        />
        <TextField
          InputLabelProps={{ shrink: true }}
          label="Commitment Level"
          margin="normal"
          name={VolunteerRequirementFieldName.commitmentLevel}
          id={VolunteerRequirementFieldName.commitmentLevel}
          key={VolunteerRequirementFieldName.commitmentLevel}
          value={
            fieldValue(fields, VolunteerRequirementFieldName.commitmentLevel) ||
            ''
          }
          error={fieldHasError(
            fields,
            VolunteerRequirementFieldName.commitmentLevel
          )}
          helperText={fieldErrorText(
            fields,
            VolunteerRequirementFieldName.commitmentLevel
          )}
          onChange={handleChange}
          className={classes.textfield}
        />
      </React.Fragment>
    );
  }
}

const styles = theme => ({
  volTypeDropdown: {
    marginTop: '0px',
    marginBottom: '0px',
    width: '33%',
    marginRight: theme.spacing.unit,
  },
  textfield: {
    marginTop: '0px',
    marginBottom: '0px',
    width: '32%',
    marginRight: theme.spacing.unit,
  },
});

export const VolunteerRequirementForm = withForm(
  VolunteerRequirementFieldName,
  volunteerRequirementConstraints
)(withStyles(styles)(withTheme()(_VolunteerRequirementForm)));
