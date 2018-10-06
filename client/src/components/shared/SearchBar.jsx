import React, { Component } from 'react';
import { withStyles, withTheme } from '@material-ui/core/styles';
import { Typography, Paper, Button } from '@material-ui/core';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';


import { AppContext } from '../main/AppContext';
import { withContext } from 'util/context';
import { getFieldNameObject, withForm, fieldValue } from 'util/form';

export const IssueAddressed = {
  AIR_QUALITY: 'AIR_QUALITY',
  AWARENESS_AND_EDUCATION: 'AWARENESS_AND_EDUCATION',
  BIODIVERSITY: 'BIODIVERSITY',
  CLIMATE: 'CLIMATE',
  CONSERVATION: 'CONSERVATION',
  ENERGY: 'ENERGY',
  FOOD_AND_AGRICULTURE: 'FOOD_AND_AGRICULTURE',
  GREEN_LIFESTYLE: 'GREEN_LIFESTYLE',
  LAND_AND_NOISE_POLLUTION: 'LAND_AND_NOISE_POLLUTION',
  PLANNING_AND_TRANSPORTATION: 'PLANNING_AND_TRANSPORTATION',
  PRODUCTION_AND_CONSUMPTION: 'PRODUCTION_AND_CONSUMPTION',
  OTHER: 'OTHER',
  SPORTS_AND_RECREATION: 'SPORTS_AND_RECREATION',
  WASTE: 'WASTE',
  WATER: 'WATER',
  GREEN_TECHNOLOGY: 'GREEN_TECHNOLOGY',
};

const ProjectLocations = {
  CENTRAL: 'CENTRAL',
  NORTH: 'NORTH',
  SOUTH: 'SOUTH',
  EAST: 'EAST',
  WEST: 'WEST',
};

const Months = {
  1: 'JANUARY',
  2: 'FEBRUARY',
  3: 'MARCH',
  4: 'APRIL',
  5: 'MAY',
  6: 'JUNE',
  7: 'JULY',
  8: 'AUGUST',
  9: 'SEPTEMBER',
  10: 'OCTOBER',
  11: 'NOVEMBER',
  12: 'DECEMBER',
};

const VolunteerRequirementType = {
  INTERACTION: 'INTERACTION',
  CONTENT_CREATION: 'CONTENT_CREATION',
  EVENT_PLANNING: 'EVENT_PLANNING',
  MEDIA_AND_SOCIAL_MEDIA: 'MEDIA_AND_SOCIAL_MEDIA',
  EXPERT_VOLUNTEERS: 'EXPERT_VOLUNTEERS',
  ADHOC_MANPOWER_SUPPORT: 'ADHOC_MANPOWER_SUPPORT',
  OTHERS_SKILLED: 'OTHERS_SKILLED',
  OTHERS_ADHOC: 'OTHERS_ADHOC',
};

const FieldName = getFieldNameObject([
  'issueAddressed',
  'projectLocations',
  'months',
  'volunteerRequirementType',
]);

const constraints = {
  [FieldName.issueAddressed]: {
    inclusion: Object.values(IssueAddressed),
  },
  [FieldName.projectLocations]: {
    inclusion: Object.values(ProjectLocations),
  },
  [FieldName.months]: {
    inclusion: Object.values(Months),
  },
  [FieldName.volunteerRequirementType]: {
    inclusion: Object.values(VolunteerRequirementType),
  },
};

class _SearchBar extends Component {

  /* Using form control */
  createDropdownMenu = (field, options, firstLabel) => {
    const { classes, fields, handleChange } = this.props;

    return (
      <FormControl className={classes.formControl}>
        <InputLabel htmlFor={field}></InputLabel>
        <Select
          value={fieldValue(fields, field) === '' ? firstLabel : fieldValue(fields, field)}
          name={FieldName[field]}
          onChange={handleChange}
        >
          <MenuItem key={firstLabel} value={firstLabel}><Typography variant='body2' className={classes.menuText}>{firstLabel}</Typography></MenuItem>
          {Object.values(options).map(option => (
            <MenuItem key={option} value={option}>
              <Typography variant='body2' className={classes.menuText}>{option}</Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  render() {
    const { classes, resetAllFields } = this.props;

    return (
      <Paper className={classes.searchBox}>
        <Typography variant='title'>Filter projects</Typography>
        <Typography variant='headline'>
        I am looking for projects about {this.createDropdownMenu(FieldName.issueAddressed, IssueAddressed, 'all categories')}
        in the month of {this.createDropdownMenu(FieldName.months, Months, 'all months')} 
        that requires volunteers for {this.createDropdownMenu(FieldName.volunteerRequirementType, VolunteerRequirementType, 'all roles')} 
        near the {this.createDropdownMenu(FieldName.projectLocations, ProjectLocations, 'all areas')} 
        area.
        </Typography>
        <Button variant="contained" color="secondary" className={classes.resetButton} size="small" onClick={resetAllFields}>
            Reset
        </Button>
      </Paper>
    );
  }
}

const styles = theme => ({
  searchBox: {
    paddingLeft: 100,
    paddingRight: 100,
    paddingTop: 30,
    paddingBottom: 30,
    width: '100%',
    backgroundColor: '#F8F8F8',

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
  withTheme()(
    withStyles(styles)(
      withForm(FieldName, constraints)(
        (_SearchBar)
      )
    )
  )
);

export const _TestSearchBar =  withStyles(styles)(
  (_SearchBar)
);
