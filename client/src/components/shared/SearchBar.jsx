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
import { ProjectRegion } from 'components/shared/enums/ProjectRegion';
import { Month } from 'components/shared/enums/Month';
import { VolunteerRequirementType } from 'components/shared/enums/VolunteerRequirementType';
import { IssueAddressedDisplayMapping } from './display_mappings/IssueAddressedDisplayMapping';
import { VolunteerRequirementTypeDisplayMapping } from 'components/shared/display_mappings/VolunteerRequirementTypeDisplayMapping';
import { ProjectRegionDisplayMapping } from 'components/shared/display_mappings/ProjectRegionDisplayMapping';
import { MonthDisplayMapping } from 'components/shared/display_mappings/MonthDisplayMapping';

/* Using form control */
const createMenu = (enumeration, displayMapping) => (
  field,
  firstLabel,
  classes,
  fields,
  handleChange,
  FieldName
) => {
  return (
    <FormControl className={classes.formControl}>
      <InputLabel htmlFor={field} />
      <Select
        value={fieldValue(fields, field) || ''}
        name={FieldName[field]}
        onChange={handleChange}
        style={{ marginTop: 0 }}
      >
        <MenuItem key={firstLabel} value="">
          <Typography variant="body1" className={classes.menuText}>
            {firstLabel}
          </Typography>
        </MenuItem>
        {Object.values(enumeration).map(option => {
          return (
            <MenuItem key={option} value={option}>
              <Typography variant="body1" className={classes.menuText}>
                {displayMapping[option]}
              </Typography>
            </MenuItem>
          );
        })}
        ;
      </Select>
    </FormControl>
  );
};

const createIssueAddressedMenu = createMenu(IssueAddressed, IssueAddressedDisplayMapping);
const createVolunteerRequirementTypeMenu = createMenu(VolunteerRequirementType, VolunteerRequirementTypeDisplayMapping);
const createProjectRegionMenu = createMenu(ProjectRegion, ProjectRegionDisplayMapping);
const createMonthMenu = createMenu(Month, MonthDisplayMapping);

export const _SearchBar = ({
  FieldName,
  classes,
  fields,
  handleChange,
  resetAllFieldsAndRefetch,
  filterProjects,
  isLoading,
}) => {
  return (
    <Paper className={classes.searchBox}>
      <div style={{ width: '80vw', margin: '0 auto' }}>
        <Typography variant="h6">Filter Projects</Typography>
        <Typography variant="h5">
          I am looking for projects about{' '}
          {createIssueAddressedMenu(
            FieldName.issueAddressed,
            'all categories',
            classes,
            fields,
            handleChange,
            FieldName
          )}
          in the month of{' '}
          {createMonthMenu(
            FieldName.month,
            'all months',
            classes,
            fields,
            handleChange,
            FieldName
          )}
          that requires volunteers for{' '}
          {createVolunteerRequirementTypeMenu(
            FieldName.volunteerRequirementType,
            'all roles',
            classes,
            fields,
            handleChange,
            FieldName
          )}
          near the{' '}
          {createProjectRegionMenu(
            FieldName.projectRegion,
            'all areas',
            classes,
            fields,
            handleChange,
            FieldName
          )}
          area.
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          className={classes.resetButton}
          size="small"
          onClick={filterProjects}
          disabled={isLoading}
        >
          Filter
        </Button>
        <Button
          variant="contained"
          className={classes.resetButton}
          size="small"
          onClick={resetAllFieldsAndRefetch}
          disabled={isLoading}
        >
          Reset
        </Button>
      </div>
    </Paper>
  );
};

const styles = theme => ({
  searchBox: {
    padding: '30px 0',
    width: '100%',
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
    marginRight: '30px',
  },
  menuText: {
    textTransform: 'capitalize',
  },
});

export const SearchBar = withContext(AppContext)(
  withStyles(styles)(_SearchBar)
);

export { _SearchBar as TestSearchBar };
