import React, { Component } from 'react';
import { withStyles, withTheme } from '@material-ui/core/styles';
import { Typography, Paper, Button } from '@material-ui/core';
// import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';


import { AppContext } from '../main/AppContext';
import { withContext } from 'util/context';

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


class _SearchBar extends Component {

  
  constructor(props) {
    super(props);
  
    this.state = {
      issues_addressed: 'all categories',
      project_location: 'all areas',
      month: 'all months',
      volunteer_recruitment_type: 'all roles',
    };

    this.baseState = this.state; 

  }


  resetForm = () => {
    this.setState(this.baseState);
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  /* Using form control */
  createDropdownMenu(field, options, first_label){
    const { classes } = this.props;
    return (
      <FormControl className={classes.formControl}>
        <InputLabel htmlFor={field}></InputLabel>
        <Select
          displayEmpty
          value={this.state[field]}
          onChange={this.handleChange(field)}
          inputProps={{name: {field}, id: {field}}}
        >
          <MenuItem key={first_label} value={first_label}><Typography variant='body2' className={classes.menuText}>{first_label}</Typography></MenuItem>
          {Object.values(options).map(option => (
            <MenuItem key={option} value={option}>
              <Typography variant='body2' className={classes.menuText}>{option}</Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );    
  }

  /* Using text field */
  // createDropdownMenu(field, options, label) {
  //   const { classes } = this.props;

  //   return (
  //     <TextField
  //       select
  //       className={classes.textField}
  //       value={this.state[field]}
  //       onChange={this.handleChange(field)}
  //       SelectProps={{
  //         native: true,
  //       }}
  //       margin="normal"
  //       label={label}
  //     >
  //       {Object.values(options).map(option => (
  //         <option key={option} value={option}>
  //           {option}
  //         </option>
  //       ))}
  //     </TextField>
  //   );
  // }

  render() {
    const { classes } = this.props;
    return (
      
      <Paper className={classes.searchBox}>
        <Typography variant='title'>Filter projects</Typography>
        <Typography variant='headline'>
        I am looking for projects about {this.createDropdownMenu('issues_addressed', IssueAddressed, this.baseState.issues_addressed)}
        in the month of {this.createDropdownMenu('month', Months, this.baseState.month)} that requires volunteers for {this.createDropdownMenu('volunteer_recruitment_type', VolunteerRequirementType, this.baseState.volunteer_recruitment_type)} near the {this.createDropdownMenu('project_location', ProjectLocations, this.baseState.project_location)} area.
        </Typography>
        <Button variant="contained" color="secondary" className={classes.resetButton} size="small" onClick={this.resetForm}>
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

  }, 
  // textField: {
  //   marginLeft: theme.spacing.unit * 1.5,
  //   marginRight: theme.spacing.unit * 1.5,
    
  // },
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

export const SearchBar = withContext(AppContext)(
  withTheme()(withStyles(styles)(_SearchBar))
);
