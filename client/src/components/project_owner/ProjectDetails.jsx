import { Paper, TextField, Typography, Input, InputLabel, Select, MenuItem, FormControl  } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import React from 'react';
import { fieldErrorText, fieldHasError, fieldValue } from 'util/form';

import { ProjectType } from 'components/shared/enums/ProjectType';
import { ProjectFrequency } from 'components/shared/enums/ProjectFrequency';
import { ProjectLocation } from 'components/shared/enums/ProjectLocation';
import { ProjectLocationDisplayMapping } from 'components/shared/display_mappings/ProjectLocationDisplayMapping';
import { ProjectFrequencyDisplayMapping } from 'components/shared/display_mappings/ProjectFrequencyDisplayMapping';

const renderFrequency = (FieldName, classes, handleChange, fields) => {
  return fields[FieldName.projectType].value === ProjectType.RECURRING &&
  <FormControl className={classes.formControl}>
    <InputLabel htmlFor="frequency-label-placeholder" shrink>
      Frequency
    </InputLabel>
    <Select
      value={fieldValue(fields, FieldName.frequency)}
      onChange={handleChange}
      input={<Input name="frequency" id="frequency-label-placeholder" />}
      name={FieldName.frequency}
    >
      <MenuItem value="">
        None
      </MenuItem>
      <MenuItem value={ProjectFrequency.EVERY_DAY}>{ProjectFrequencyDisplayMapping[ProjectFrequency.EVERY_DAY]}</MenuItem>
    </Select>
  </FormControl>;
};

const renderStartDate = (FieldName, classes, handleChange, fields) => {
  return fields[FieldName.projectType].value === ProjectType.EVENT &&
  <TextField
    type="date"
    name={FieldName.startDate}
    className={classes.textField}
    id="date"
    label="Start Date"
    onChange={handleChange}
    value={fieldValue(fields, FieldName.startDate)}
  />;
};

const renderEndDate = (FieldName, classes, handleChange, fields) => {
  return fields[FieldName.projectType].value === ProjectType.EVENT &&
  <TextField
    type="date"
    name={FieldName.endDate}
    className={classes.textField}
    id="date"
    label="End Date"
    onChange={handleChange}
    minDate={new Date()}
    value={fieldValue(fields, FieldName.endDate)}
  />;
};


export const _ProjectDetails = ({ FieldName, classes, fields, handleChange }) => {

  return (
    <div>
      <Paper square={true}>
        <Typography variant="headline">Project Details</Typography>
        <FormControl className={classes.formControl}>
          <InputLabel htmlFor={FieldName.projectType} shrink>
                Project Type
          </InputLabel>
          <Select
            value={fieldValue(fields, FieldName.projectType)}
            onChange={handleChange}
            name={FieldName.projectType}
          >
            <MenuItem value={ProjectType.EVENT}>Event</MenuItem>
            <MenuItem value={ProjectType.RECURRING}>Recurring</MenuItem>
          </Select>
        </FormControl>
        {renderStartDate(FieldName, classes, handleChange, fields)}
        {renderEndDate(FieldName, classes, handleChange, fields)}
        {renderFrequency(FieldName, classes, handleChange, fields)}
        <TextField
          type="time"
          name={FieldName.time}
          className={classes.textInput}
          id={FieldName.time}
          label="Time"
          InputLabelProps={{ shrink: true }}
          onChange={handleChange}
          value={fieldValue(fields, FieldName.time)}
          error={fieldHasError(fields, FieldName.time)}
          helperText={fieldErrorText(fields, FieldName.time)}
          fullWidth
          margin="normal"
        />
        <FormControl className={classes.formControl}>
          <InputLabel htmlFor="location-label-placeholder" shrink>
                Location
          </InputLabel>
          <Select
            value={fieldValue(fields, FieldName.location)}
            onChange={handleChange}
            input={<Input name="location" id="location-label-placeholder" />}
            name='location'
          >
            <MenuItem value="">
                  None
            </MenuItem>
            <MenuItem value={ProjectLocation.CENTRAL}>{ProjectLocationDisplayMapping[ProjectLocation.CENTRAL]}</MenuItem>
            <MenuItem value={ProjectLocation.NORTH}>{ProjectLocationDisplayMapping[ProjectLocation.NORTH]}</MenuItem>
            <MenuItem value={ProjectLocation.SOUTH}>{ProjectLocationDisplayMapping[ProjectLocation.SOUTH]}</MenuItem>
            <MenuItem value={ProjectLocation.EAST}>{ProjectLocationDisplayMapping[ProjectLocation.EAST]}</MenuItem>
            <MenuItem value={ProjectLocation.WEST}>{ProjectLocationDisplayMapping[ProjectLocation.WEST]}</MenuItem>
          </Select>
        </FormControl>
      </Paper>
    </div>
  );

};

const styles = theme => ({
  root: {
    display: 'flex',
    margin: `${theme.container.margin.vertical}px auto`,
    padding: `${theme.container.padding.vertical}px ${theme.container.padding.horizontal}px`,
    minHeight: '200px',
  },
  formControl: {
    width: '50%',
  },
});

export const ProjectDetails = withStyles(styles)(_ProjectDetails);

// export const TestProjectOwnerNewProjectForm = withForm(
//   FieldName,
// )(_ProjectOwnerNewProjectForm);
