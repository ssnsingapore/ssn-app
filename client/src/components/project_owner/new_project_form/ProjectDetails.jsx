import { Paper, TextField, Typography, MenuItem, Grid, Checkbox, ListItemText, Chip, Select, Input, InputLabel } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import React from 'react';
import { fieldErrorText, fieldHasError, fieldValue } from 'util/form';

import { ProjectType } from 'components/shared/enums/ProjectType';
import { ProjectTypeDisplayMapping } from 'components/shared/display_mappings/ProjectTypeDisplayMapping';
import { ProjectFrequency } from 'components/shared/enums/ProjectFrequency';
import { ProjectLocation } from 'components/shared/enums/ProjectLocation';
import { ProjectLocationDisplayMapping } from 'components/shared/display_mappings/ProjectLocationDisplayMapping';
import { ProjectFrequencyDisplayMapping } from 'components/shared/display_mappings/ProjectFrequencyDisplayMapping';
import { IssueAddressed } from 'components/shared/enums/IssueAddressed';
import { IssuesAddressedDisplayMapping } from 'components/shared/display_mappings/IssuesAddressedDisplayMapping';

const isSelectedBefore = (issuesAddressed = [], data) => !!issuesAddressed.find(issue => issue === data);

const renderFrequency = (FieldName, classes, handleChange, fields) => {
  return fields[FieldName.projectType].value === ProjectType.RECURRING &&
  <TextField
    required
    select
    label="Frequency"
    value={fieldValue(fields, FieldName.frequency)}
    error={fieldHasError(fields, FieldName.frequency)}
    helperText={fieldErrorText(fields, FieldName.frequency)}
    onChange={handleChange}
    name={FieldName.frequency}
    InputLabelProps={{ shrink: true }}
    fullWidth
  >
    <MenuItem value={ProjectFrequency.EVERY_DAY}>{ProjectFrequencyDisplayMapping[ProjectFrequency.EVERY_DAY]}</MenuItem>
    <MenuItem value={ProjectFrequency.A_FEW_TIMES_A_WEEK}>{ProjectFrequencyDisplayMapping[ProjectFrequency.A_FEW_TIMES_A_WEEK]}</MenuItem>
    <MenuItem value={ProjectFrequency.ONCE_A_WEEK}>{ProjectFrequencyDisplayMapping[ProjectFrequency.ONCE_A_WEEK]}</MenuItem>
    <MenuItem value={ProjectFrequency.FORTNIGHTLY}>{ProjectFrequencyDisplayMapping[ProjectFrequency.FORTNIGHTLY]}</MenuItem>
    <MenuItem value={ProjectFrequency.A_FEW_TIMES_A_MONTH}>{ProjectFrequencyDisplayMapping[ProjectFrequency.A_FEW_TIMES_A_MONTH]}</MenuItem>
    <MenuItem value={ProjectFrequency.ONCE_A_MONTH}>{ProjectFrequencyDisplayMapping[ProjectFrequency.ONCE_A_MONTH]}</MenuItem>
    <MenuItem value={ProjectFrequency.A_FEW_TIMES_A_YEAR}>{ProjectFrequencyDisplayMapping[ProjectFrequency.A_FEW_TIMES_A_YEAR]}</MenuItem>
    <MenuItem value={ProjectFrequency.ONCE_A_YEAR}>{ProjectFrequencyDisplayMapping[ProjectFrequency.ONCE_A_YEAR]}</MenuItem>
  </TextField>;
};

const renderStartEndDate = (FieldName, classes, handleChange, fields) => {
  return fields[FieldName.projectType].value === ProjectType.EVENT &&
  <div className={classes.sharedRow}>
    <TextField
      type="date"
      name={FieldName.startDate}
      id={FieldName.startDate}
      label="Start Date"
      onChange={handleChange}
      value={fieldValue(fields, FieldName.startDate)}
      InputLabelProps={{ shrink: true}}
      error={fieldHasError(fields, FieldName.startDate)}
      helperText={fieldErrorText(fields, FieldName.startDate)}
      required
      fullWidth
      className={classes.columnInRow}
    />
    <TextField
      type="date"
      name={FieldName.endDate}
      id={FieldName.endDate}
      label="End Date"
      onChange={handleChange}
      value={fieldValue(fields, FieldName.endDate)}
      InputLabelProps={{ shrink: true}}
      error={fieldHasError(fields, FieldName.endDate)}
      helperText={fieldErrorText(fields, FieldName.endDate)}
      required
      fullWidth
    />
  </div>;
};

export const _ProjectDetails = ({ FieldName, classes, fields, handleChange }) => {

  return (
    <div>
      <React.Fragment>
        <Paper square className={classes.paper}>
          <Typography variant="headline">Project Details</Typography>
          <Grid item xs={12}>
            <div className={classes.sharedRow}>
              <TextField
                required
                select
                label="Project Type"
                fullWidth
                value={fieldValue(fields, FieldName.projectType)}
                onChange={handleChange}
                name={FieldName.projectType}
                className={classes.columnInRow}
                InputLabelProps={{ shrink: true }}
                error={fieldHasError(fields, FieldName.projectType)}
                helperText={fieldErrorText(fields, FieldName.projectType)}
              >
                <MenuItem value={ProjectType.EVENT}>
                  {ProjectTypeDisplayMapping[ProjectType.EVENT]}
                </MenuItem>
                <MenuItem value={ProjectType.RECURRING}>
                  {ProjectTypeDisplayMapping[ProjectType.RECURRING]}
                </MenuItem>
              </TextField>
              {renderFrequency(FieldName, classes, handleChange, fields)}
            </div>
            {renderStartEndDate(FieldName, classes, handleChange, fields)}
            <TextField
              type="time"
              name={FieldName.time}
              className={classes.textField}
              id={FieldName.time}
              label="Time"
              InputLabelProps={{ shrink: true }}
              onChange={handleChange}
              value={fieldValue(fields, FieldName.time)}
              fullWidth
              defaultValue="12:00"
              inputProps={{
                step: 1800, // 30mins
              }}
            />
            <TextField
              select
              label="Location"
              className={classes.textField}
              value={fieldValue(fields, FieldName.location)}
              onChange={handleChange}
              name={FieldName.location}
              InputLabelProps={{ shrink: true }}
              fullWidth
            >
              <MenuItem value="">
                <em>Undecided</em>
              </MenuItem>
              <MenuItem value={ProjectLocation.CENTRAL}>{ProjectLocationDisplayMapping[ProjectLocation.CENTRAL]}</MenuItem>
              <MenuItem value={ProjectLocation.NORTH}>{ProjectLocationDisplayMapping[ProjectLocation.NORTH]}</MenuItem>
              <MenuItem value={ProjectLocation.SOUTH}>{ProjectLocationDisplayMapping[ProjectLocation.SOUTH]}</MenuItem>
              <MenuItem value={ProjectLocation.EAST}>{ProjectLocationDisplayMapping[ProjectLocation.EAST]}</MenuItem>
              <MenuItem value={ProjectLocation.WEST}>{ProjectLocationDisplayMapping[ProjectLocation.WEST]}</MenuItem>
            </TextField>
            <div className={classes.textField}>
              <InputLabel htmlFor="issues-addressed-select" style={{fontSize: 12}}>Issues Addressed</InputLabel>
              <Select
                multiple
                value={fieldValue(fields, FieldName.issuesAddressed) || []}
                onChange={handleChange}
                name={FieldName.issuesAddressed}
                input={<Input id="issues-addressed-select"/>}
                fullWidth
                renderValue={selected => (
                  <div className={classes.chips}>
                    {selected.map(value => (
                      <Chip key={value} label={IssuesAddressedDisplayMapping[value]}/>
                    ))}
                  </div>
                )}
              >
                {Object.keys(IssueAddressed).map(data => {
                  return (
                    <MenuItem value={data} key={data}>
                      <Checkbox checked={isSelectedBefore(fields.issuesAddressed.value, data)} />
                      <ListItemText primary={IssuesAddressedDisplayMapping[data]} />
                    </MenuItem>
                  );
                })}
              </Select>
            </div>
          </Grid>
        </Paper>
      </React.Fragment>
    </div>
  );

};

const styles = theme => ({
  root: {
    display: 'flex',
    margin: '0 auto',
  },
  paper: {
    marginTop: '6px',
    marginBottom: '6px',
    padding: '30px',
  },
  textField: {
    marginTop: '20px',
    marginBottom: '20px',
  },
  sharedRow: {
    display: 'flex',
    marginTop: '20px',
    marginBottom: '20px',
  },
  columnInRow: {
    marginRight: '6px',
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    margin: '6px',
  },
});

export const ProjectDetails = withStyles(styles)(_ProjectDetails);

// export const TestProjectOwnerNewProjectForm = withForm(
//   FieldName,
// )(_ProjectOwnerNewProjectForm);