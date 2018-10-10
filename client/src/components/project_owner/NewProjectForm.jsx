import { Grid, Button, Paper, TextField, Typography } from '@material-ui/core';
import { Redirect } from 'react-router-dom';
import { withStyles, withTheme } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import React, { Component } from 'react';
import Select from '@material-ui/core/Select';

import { AlertType } from 'components/shared/Alert';
import { AppContext } from 'components/main/AppContext';
import { extractErrors, formatErrors } from 'util/errors';
import { fieldErrorText, fieldHasError, getFieldNameObject, withForm, fieldValue } from 'util/form';
import { IssueAddressed } from 'components/shared/enums/IssueAddressed';
import { ProjectFrequency } from 'components/shared/enums/ProjectFrequency';
import { ProjectLocation } from 'components/shared/enums/ProjectLocation';
import { ProjectOwnerDetails } from 'components/shared/ProjectOwnerDetails';
import { ProjectState } from 'components/shared/enums/ProjectState';
import { ProjectType } from 'components/shared/enums/ProjectType';
import { VolunteerRequirementType } from 'components/shared/enums/VolunteerRequirementType';
import { VolunteerRequirementTypeDisplayMapping } from 'components/shared/display_mappings/VolunteerRequirementTypeDisplayMapping';
import { withContext } from 'util/context';

const PROJECT_ADDED_SUCCESS_MESSAGE = 'Your project has been added!';

const FieldNameMainForm = getFieldNameObject([
  'volunteerRequirementsDescription',
  'volunteerBenefitsDescription',
]);

const FieldNameSubform = getFieldNameObject([  
  'volunteerRequirementType',
  'volunteerRequirementCommitmentLevel',
  'volunteerRequirementNumber',
]);


const constraintsMainForm = {
  [FieldNameMainForm.volunteerRequirementsDescription]: {
    presence: { allowEmpty: true },
    length: { maximum: 10000 },
  },
  [FieldNameMainForm.volunteerBenefitsDescription]: {
    presence: { allowEmpty: true },
    length: { maximum: 10000 },
  }, 
};

// # TODO: Need to add validation to the fields. Validation is removed in the interim.
// const constraintsSubform = {
//   
//   [FieldNameSubform.volunteerRequirementType]: {
//     inclusion: Object.values(VolunteerRequirementType),
//   },
//   [FieldNameSubform.volunteerRequirementCommitmentLevel]: {
//     presence: { allowEmpty: true },
//   },
//   [FieldNameSubform.volunteerRequirementNumber]: {
//     presence: { allowEmpty: true },
//     numericality: true,
//   },
// };

class _NewProjectForm extends Component {
  
  constructor(props) {
    super(props);

    this.state = {
      project: {
      },
      projectVolunteerRequirements: {
        1: {
          volunteerRequirementType: '',
          volunteerRequirementCommitmentLevel: '',
          volunteerRequirementNumber: null,
        },
        2: {
          volunteerRequirementType: '',
          volunteerRequirementCommitmentLevel: '',
          volunteerRequirementNumber: null,
        },
      },
      isSubmitting: false, 
      hasSubmitted: false,
    };
  }

  handleChange = id => event => {
    const { name, value } = event.target;
    this.setState({ 
      projectVolunteerRequirements: {
        ...this.state.projectVolunteerRequirements,
        [id]: 
        {
          ...this.state.projectVolunteerRequirements[id], 
          [name]: value,
        },
      },
    });
  };

  renderVolunteerRequirement(id) {
    const { classes } = this.props;
    return(
      <React.Fragment>
        <FormControl className={classes.volTypeDropdown}>
          <InputLabel htmlFor={FieldNameSubform.volunteerRequirementType}>
          Type of Volunteer
          </InputLabel>
          <Select
            id={`${FieldNameSubform.volunteerRequirementType}-${id}`}
            key={`${FieldNameSubform.volunteerRequirementType}-${id}`}
            value={this.state.projectVolunteerRequirements[id].volunteerRequirementType}
            name={FieldNameSubform.volunteerRequirementType}
            onChange={this.handleChange(id)}
            defaultValue={Object.values(VolunteerRequirementType)[0]}
          >
            {Object.values(VolunteerRequirementType).map(
              (option) => {
                return(
                  <MenuItem key={`${option}-${id}`} value={option}>
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
          name={FieldNameSubform.volunteerRequirementNumber}
          id={`${FieldNameSubform.volunteerRequirementNumber}-${id}`}
          key={`${FieldNameSubform.volunteerRequirementNumber}-${id}`}
          value={this.state.projectVolunteerRequirements[id].volunteerRequirementNumber}
          // error={fieldHasError(fields, FieldNameSubform.volunteerRequirementNumber)}
          // helper={fieldErrorText(fields, FieldNameSubform.volunteerRequirementNumber)}
          onChange={this.handleChange(id)}
          className={classes.textfield}/>
        <TextField 
          InputLabelProps={{ shrink: true}}
          label='Commitment Level'
          margin='normal'
          name={FieldNameSubform.volunteerRequirementCommitmentLevel}
          id={`${FieldNameSubform.volunteerRequirementCommitmentLevel}-${id}`}
          key={`${FieldNameSubform.volunteerRequirementCommitmentLevel}-${id}`}
          value={this.state.projectVolunteerRequirements[id].volunteerRequirementCommitmentLevel}
          // error={fieldHasError(fields, FieldNameSubform.volunteerRequirementCommitmentLevel)}
          // helper={fieldErrorText(fields, FieldNameSubform.volunteerRequirementCommitmentLevel)}
          onChange={this.handleChange(id)}
          className={classes.textfield}/>
        <Button
          key={`minimizeButton-${id}`}
          variant="fab"
          aria-label="Minimize"
          className={classes.button}
          onClick={() => this.handleRemoveRow(id)}
          mini
        >
          -
        </Button>
      </React.Fragment>
    );
  }

  handleRemoveRow(id) {
    const rows = { ...this.state.projectVolunteerRequirements };
    delete rows[id];
    this.setState({projectVolunteerRequirements: rows});
  }

  handleAddRow() {
    const { projectVolunteerRequirements } = this.state;
    const rowNumbers = Object.keys(projectVolunteerRequirements).map(no => Number(no));
    const tempId = rowNumbers.length === 0 ? 1: Math.max(...rowNumbers) + 1;
  
    this.setState({ 
      projectVolunteerRequirements: {
        ...this.state.projectVolunteerRequirements,
        [tempId]: 
        {
          volunteerRequirementType: '',
          volunteerRequirementCommitmentLevel: '',
          volunteerRequirementNumber: null,
        },
      },
    });

  }

  renderVolunteerRequirementsRows() {
    const { classes } = this.props;
    const { projectVolunteerRequirements } = this.state;
    return(
      <Grid item xs={12} className={classes.rows}>
        <Typography variant="caption">Type of Volunteers Needed</Typography>
        {Object.keys(projectVolunteerRequirements).map(row => {
          return(
            this.renderVolunteerRequirement(row)
          );

        })}
        <Button
          key='addButton'
          variant="fab"
          aria-label="Add"
          className={classes.addButton}
          onClick={() => this.handleAddRow()}
          size="medium"
        >
          <AddIcon/>
        </Button>
      </Grid>
    );
  }
  
  renderVolunteerDetailsSection() {
    const { classes, fields, handleChange } = this.props;
    return ( 
      <React.Fragment>
        <Paper square className={classes.paper}>
          <Typography variant="headline">Volunteer Details</Typography>
          <Grid item xs={12}>
            <Typography>
              <TextField 
                fullWidth
                InputLabelProps={{ shrink: true}}
                label='Description of Volunteers Needed'
                margin='normal'
                name={FieldNameMainForm.volunteerRequirementsDescription}
                id={FieldNameMainForm.volunteerRequirementsDescription}
                key={FieldNameMainForm.volunteerRequirementsDescription}
                value={fieldValue(fields, FieldNameMainForm.volunteerRequirementsDescription)}
                error={fieldHasError(fields, FieldNameMainForm.volunteerRequirementsDescription)}
                helper={fieldErrorText(fields, FieldNameMainForm.volunteerRequirementsDescription)}
                onChange={handleChange}/>

              {this.renderVolunteerRequirementsRows()}
              
              <TextField 
                fullWidth
                InputLabelProps={{ shrink: true}}
                label='Volunteer Benefits'
                margin='normal'
                name={FieldNameMainForm.volunteerBenefitsDescription}
                id={FieldNameMainForm.volunteerBenefitsDescription}
                key={FieldNameMainForm.volunteerBenefitsDescription}
                value={fieldValue(fields, FieldNameMainForm.volunteerBenefitsDescription)}
                error={fieldHasError(fields, FieldNameMainForm.volunteerBenefitsDescription)}
                helper={fieldErrorText(fields, FieldNameMainForm.volunteerBenefitsDescription)}
                onChange={handleChange}/>
            </Typography>
          </Grid>
        </Paper>
      </React.Fragment>

      
    );
  }

  renderSubmitButton() {
    const { classes } = this.props;
    return( 
      <div className={classes.submitButtonBox}>
        <Button 
          key='submitButton'
          type="submit"
          size="medium"
          className={classes.submitButton}
          disabled={this.state.isSubmitting}
          variant="contained"
          color="secondary"
        >
      Submit
        </Button>
      </div>);
  }

  handleSubmit = async (event) => {
    event.preventDefault();

    if (!this.props.validateAllFields()) {
      return;
    }

    const { authenticator } = this.props.context.utils;
    const currentUser = authenticator.getCurrentUser();

    const { volunteerRequirementsDescription, volunteerBenefitsDescription  } = this.state;

    const newProject = {
      title: 'Save the Earth',
      coverImageUrl: 'https://s3-ap-southeast-1.amazonaws.com/ssn-app-maryana/Terra-recycling.jpg',
      description: 'Save the earth description',
      volunteerSignupUrl: 'http://www.signup.org',
      volunteerRequirements: this.state.projectVolunteerRequirementRows, // state will be changed
      projectOwner: currentUser.id,
      issuesAddressed: [IssueAddressed.LAND_AND_NOISE_POLLUTION, IssueAddressed.WASTE],
      volunteerRequirementsDescription: volunteerRequirementsDescription, // state will be changed
      volunteerBenefitsDescription: volunteerBenefitsDescription, // state will be changed
      projectType: ProjectType.EVENT,
      time: '9 AM',
      location: ProjectLocation.CENTRAL,
      state: ProjectState.APPROVED_INACTIVE,
      startDate: new Date(2018, 12, 1),
      endDate: new Date(2018, 12, 2),
      frequency: ProjectFrequency.ONCE_A_WEEK,
    };

    this.setState({project: newProject});

    this.props.resetAllFields();
    
    const { showAlert } = this.props.context.updaters;
    const { requestWithAlert } = this.props.context.utils;

    this.setState({ isSubmitting: true });
    const response = await requestWithAlert    
      .post('/api/v1/projects/add', { project: newProject }, { authenticated: true });
    this.setState({ isSubmitting: false });

    if (response.isSuccessful) {
      showAlert('projectAddedSuccess', AlertType.SUCCESS, PROJECT_ADDED_SUCCESS_MESSAGE);
    }

    if (response.hasError) {
      const errors = await extractErrors(response);
      showAlert('projectAddedFailure', AlertType.ERROR, formatErrors(errors));
    }

    this.setState({ hasSubmitted: true});
  }

  render() {
    const { classes } = this.props;
    const { hasSubmitted } = this.state;
    if (hasSubmitted) {
      return <Redirect to={{
        pathname: '/project_owner/dashboard',
      }} />;
    }
    return (
      <form onSubmit={this.handleSubmit}>
        <Grid container className={classes.root}>
          <Grid item xs={4}>
            <Paper square className={classes.paper}>
              <Typography variant="headline">
              Add a New Project
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={8}>
            <Paper square className={classes.img}>
              <Typography variant="headline">
              Upload image
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            {this.renderVolunteerDetailsSection()}
          </Grid>
          <Grid item xs={6}>
            <Paper square className={classes.paper}>
              <Typography variant="headline">Project Details</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12}> 
            <ProjectOwnerDetails />
          </Grid>
          <Grid item xs={12}>
            {this.renderSubmitButton()}
          </Grid>
        </Grid>
      </form>


      
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
  submitButtonBox: {
    display: 'flex',
    flexDirection: 'row-reverse',
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
  label: {
    marginTop: '6px',
    marginBottom: '6px',
  },
  form: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textfield: {
    width: '28%',
    marginRight: '4px',
  },
  volTypeDropdown: {
    width: '32%',
    marginRight: '4px',
  },
  button: {
    backgroundColor: 'black',
    color: 'white',
    marginLeft: '5px',
    marginBottom: '15px',
  },
  addButton: {
    backgroundColor: 'black',
    color: 'white',
    marginLeft: '5px',
    marginBottom: '15px',
  },
  rows: {
    margin: '0px',
  },
}); 

export const NewProjectForm = 
  withForm(FieldNameMainForm, constraintsMainForm)(
    withContext(AppContext)(
      withTheme()(
        withStyles(styles)(_NewProjectForm))
    ));


