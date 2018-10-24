import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Typography, Paper, Button } from '@material-ui/core';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';


import { AppContext } from '../main/AppContext';
import { withContext } from 'util/context';
import { getFieldNameObject, withForm, fieldValue } from 'util/form';
import { IssueAddressed } from 'components/shared/enums/IssueAddressed';
import { ProjectLocation } from 'components/shared/enums/ProjectLocation';
import { Month } from 'components/shared/enums/Month';
import { VolunteerRequirementType } from 'components/shared/enums/VolunteerRequirementType';

const FieldName = getFieldNameObject([
  'issueAddressed',
  'projectLocation',
  'month',
  'volunteerRequirementType',
]);

const constraints = {
  [FieldName.issueAddressed]: {
    inclusion: Object.values(IssueAddressed),
  },
  [FieldName.projectLocation]: {
    inclusion: Object.values(ProjectLocation),
  },
  [FieldName.month]: {
    inclusion: Object.values(Month),
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
          value={fieldValue(fields, field) === undefined ? firstLabel : fieldValue(fields, field)}
          name={FieldName[field]}
          onChange={handleChange}
        >
          {this.renderOptions({firstLabel, ...options})}
        </Select>
      </FormControl>
    );
  }

  renderOptions = (options) => {
    const { classes } = this.props;

    return Object.values(options).map(option => (
      <MenuItem key={option} value={option}>
        <Typography variant='body2' className={classes.menuText}>{option}</Typography>
      </MenuItem>
    ));
  }
   
  render() {
    const { classes, resetAllFields } = this.props;
    return (
      <Paper className={classes.searchBox}>
        <div style={{width: '80vw', margin:'0 auto'}}>
          <Typography variant='title'>Filter projects</Typography>
          <Typography variant='headline'>
          I am looking for projects about {this.createDropdownMenu(FieldName.issueAddressed, IssueAddressed, 'all categories')}
          in the month of {this.createDropdownMenu(FieldName.month, Month, 'all months')}
          that requires volunteers for {this.createDropdownMenu(FieldName.volunteerRequirementType, VolunteerRequirementType, 'all roles')}
          near the {this.createDropdownMenu(FieldName.projectLocation, ProjectLocation, 'all areas')}
          area.
          </Typography>
          <Button variant="contained" color="secondary" className={classes.resetButton} size="small" onClick={resetAllFields}>
              Reset
          </Button>
        </div>
      </Paper>
    );
  }
}

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
    withForm(FieldName, constraints)(
      (_SearchBar)
    )
  )
);

export {_SearchBar as TestSearchBar};

