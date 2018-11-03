import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Typography, Paper, Button } from '@material-ui/core';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import { AppContext } from '../main/AppContext';
import { withContext } from 'util/context';
import { fieldValue } from 'util/form';
import { IssueAddressed } from 'components/shared/enums/IssueAddressed';
import { ProjectLocation } from 'components/shared/enums/ProjectLocation';
import { Month } from 'components/shared/enums/Month';
import { VolunteerRequirementType } from 'components/shared/enums/VolunteerRequirementType';
import { IssueAddressedDisplayMapping } from './display_mappings/IssueAddressedDisplayMapping';
import { VolunteerRequirementTypeDisplayMapping } from 'components/shared/display_mappings/VolunteerRequirementTypeDisplayMapping';
import { ProjectLocationDisplayMapping } from './display_mappings/ProjectLocationDisplayMapping';
/* Using form control */
const createIssueAddressedMenu = (field, firstLabel, classes, fields, handleChange, FieldName) => {
  return (
    <FormControl className={classes.formControl}>
      <InputLabel htmlFor={field}></InputLabel>
      <Select
        value={fieldValue(fields, field) || firstLabel}
        name={FieldName[field]}
        onChange={handleChange}
      >
        <MenuItem key={firstLabel} value={firstLabel}>
          <Typography variant='body2' className={classes.menuText}>{firstLabel}</Typography>
        </MenuItem>
        {Object.values(IssueAddressed).map(option => { 
          return (
            <MenuItem key={option} value={option}>
              <Typography variant='body2' className={classes.menuText}>{IssueAddressedDisplayMapping[option]}</Typography>
            </MenuItem>
          );
        })};
      </Select>
    </FormControl>
  );
};

const createMonthMenu = (field, firstLabel, classes, fields, handleChange, FieldName) => {
  return (
    <FormControl className={classes.formControl}>
      <InputLabel htmlFor={field}></InputLabel>
      <Select
        value={fieldValue(fields, field) || firstLabel}
        name={FieldName[field]}
        onChange={handleChange}
      >
        {Object.values({firstLabel: firstLabel, ...Month}).map(option => { 
          return (
            <MenuItem key={option} value={option}>
              <Typography variant='body2' className={classes.menuText}>{option}</Typography>
            </MenuItem>
          );
        })};
      </Select>
    </FormControl>
  );
};

const createVolunteerRequirementTypeMenu = (field, firstLabel, classes, fields, handleChange, FieldName) => {
  return (
    <FormControl className={classes.formControl}>
      <InputLabel htmlFor={field}></InputLabel>
      <Select
        value={fieldValue(fields, field) || firstLabel}
        name={FieldName[field]}
        onChange={handleChange}
      >
        <MenuItem key={firstLabel} value={firstLabel}>
          <Typography variant='body2' className={classes.menuText}>{firstLabel}</Typography>
        </MenuItem>
        {Object.values(VolunteerRequirementType).map(option => { 
          return (
            <MenuItem key={option} value={option}>
              <Typography variant='body2' className={classes.menuText}>{VolunteerRequirementTypeDisplayMapping[option]}</Typography>
            </MenuItem>
          );
        })};
      </Select>
    </FormControl>
  );
};

const createProjectLocationMenu = (field, firstLabel, classes, fields, handleChange, FieldName) => {
  return (
    <FormControl className={classes.formControl}>
      <InputLabel htmlFor={field}></InputLabel>
      <Select
        value={fieldValue(fields, field) || firstLabel}
        name={FieldName[field]}
        onChange={handleChange}
      >
        <MenuItem key={firstLabel} value={firstLabel}>
          <Typography variant='body2' className={classes.menuText}>{firstLabel}</Typography>
        </MenuItem>
        {Object.values(ProjectLocation).map(option => { 
          return (
            <MenuItem key={option} value={option}>
              <Typography variant='body2' className={classes.menuText}>{ProjectLocationDisplayMapping[option]}</Typography>
            </MenuItem>
          );
        })};
      </Select>
    </FormControl>
  );
};

export const _SearchBar = ({ FieldName, classes, fields, handleChange, resetAllFields }) => {   
  return (
    <Paper className={classes.searchBox}>
      <div style={{width: '80vw', margin:'0 auto'}}>
        <Typography variant='title'>Filter projects</Typography>
        <Typography variant='headline'>
          I am looking for projects about {createIssueAddressedMenu(FieldName.issueAddressed, 'all categories', classes, fields, handleChange, FieldName)}
          in the month of {createMonthMenu(FieldName.month, 'all months', classes, fields, handleChange, FieldName)}
          that requires volunteers for {createVolunteerRequirementTypeMenu(FieldName.volunteerRequirementType, 'all roles', classes, fields, handleChange, FieldName)}
          near the {createProjectLocationMenu(FieldName.projectLocation, 'all areas', classes, fields, handleChange, FieldName)}
          area.
        </Typography>
        <Button variant="contained" color="secondary" className={classes.resetButton} size="small" onClick={resetAllFields}>
              Reset
        </Button>
        <Button variant="contained" color="secondary" className={classes.resetButton} size="small" onClick={resetAllFields}>
              Filter
        </Button>
      </div>
    </Paper>
  );
};

const styles = theme => ({
  searchBox: {
    padding: '30px 0',
    width: '100vw',
    backgroundColor: theme.palette.grey[100],
  },
  formControl: {
    minWidth: 200,
    marginLeft: theme.spacing.unit * 1.5,
    marginRight: theme.spacing.unit * 1.5,
  },
  resetButton: {
    marginTop: 20,
    textTransform: 'uppercase',
  },
  menuText: {
    textTransform: 'capitalize',
  },
});

export const SearchBar =
withContext(AppContext)(
  withStyles(styles)(
    (_SearchBar)
  )
);

export {_SearchBar as TestSearchBar};

