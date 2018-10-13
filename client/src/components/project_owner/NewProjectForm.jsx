import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { withStyles, withTheme } from '@material-ui/core/styles';
import { Grid, Button, Paper, TextField, Typography, IconButton } from '@material-ui/core';
import { AddCircle as AddCircleIcon, RemoveCircle as RemoveCircleIcon } from '@material-ui/icons';

import { AlertType } from 'components/shared/Alert';
import { ProjectOwnerDetails } from 'components/shared/ProjectOwnerDetails';
import { AppContext } from 'components/main/AppContext';
import { withContext } from 'util/context';
import { extractErrors, formatErrors } from 'util/errors';
import { fieldErrorText, fieldHasError, getFieldNameObject, withForm, fieldValue } from 'util/form';
import { VolunteerRequirementForm } from 'components/project_owner/VolunteerRequirementForm';

import { IssueAddressed } from 'components/shared/enums/IssueAddressed';
import { ProjectFrequency } from 'components/shared/enums/ProjectFrequency';
import { ProjectLocation } from 'components/shared/enums/ProjectLocation';
import { ProjectState } from 'components/shared/enums/ProjectState';
import { ProjectType } from 'components/shared/enums/ProjectType';

const FieldName = getFieldNameObject([
  'volunteerRequirementsDescription',
  'volunteerBenefitsDescription',
]);

const constraints = {
  [FieldName.volunteerRequirementsDescription]: {
    presence: { allowEmpty: true },
    length: { maximum: 500 },
  },
  [FieldName.volunteerBenefitsDescription]: {
    presence: { allowEmpty: true },
    length: { maximum: 500 },
  }, 
  
};

const PROJECT_ADDED_SUCCESS_MESSAGE = 'You have submitted this project successfully! It will now be pending admin approval.';

class _NewProjectForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      volunteerRequirementRefs: [
        React.createRef(),
      ],
      isSubmitting: false, 
      shouldRedirect: false,
    };
  }

  validateAllSubFormFields = () => {
    const { volunteerRequirementRefs } = this.state;
    return volunteerRequirementRefs.every(ref => ref.current.validateAllFields());
  }

  resetAllSubFormFields = () => {
    const { volunteerRequirementRefs } = this.state;
    volunteerRequirementRefs.forEach(ref => ref.current.resetAllFields());
  }

  valuesForAllSubFormFields = () => {
    const { volunteerRequirementRefs } = this.state;
    return volunteerRequirementRefs.map(ref => ref.current.valuesForAllFields());
  }

  handleSubmit = async (event) => {
    event.preventDefault();

    if (!this.props.validateAllFields() || !this.validateAllSubFormFields()) {
      return;
    }

    const { authenticator } = this.props.context.utils;
    const currentUser = authenticator.getCurrentUser();

    const { volunteerRequirementsDescription, 
      volunteerBenefitsDescription} = this.props.valuesForAllFields();

    const volunteerRequirements = this.valuesForAllSubFormFields();

    const newProject = {
      title: 'Save the Earth',
      coverImageUrl: 'https://s3-ap-southeast-1.amazonaws.com/ssn-app-maryana/Terra-recycling.jpg',
      description: 'Save the earth description',
      volunteerSignupUrl: 'http://www.signup.org',
      projectOwner: currentUser.id,
      issuesAddressed: [IssueAddressed.LAND_AND_NOISE_POLLUTION, IssueAddressed.WASTE],
      projectType: ProjectType.EVENT,
      time: '9 AM',
      location: ProjectLocation.CENTRAL,
      state: ProjectState.APPROVED_INACTIVE,
      startDate: new Date(2018, 12, 1),
      endDate: new Date(2018, 12, 2),
      frequency: ProjectFrequency.ONCE_A_WEEK,

      volunteerRequirements,
      volunteerRequirementsDescription,
      volunteerBenefitsDescription,
    };

    this.props.resetAllFields();
    this.resetAllSubFormFields();
    
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

    this.setState({ shouldRedirect: true});

  }

  handleAddVolunteerRequirement = () => {
    this.setState({
      volunteerRequirementRefs: [...this.state.volunteerRequirementRefs, React.createRef()],
    });
  }

  handleDeleteVolunteerRequirement = (i) => {
    const newVolunteerRequirementRefs = [ ...this.state.volunteerRequirementRefs];
    newVolunteerRequirementRefs.splice(i, 1);
    this.setState({
      volunteerRequirementRefs: newVolunteerRequirementRefs,
    });
  }

  renderVolunteerRequirements = () => {
    const { volunteerRequirementRefs } = this.state;
    const { classes } = this.props;

    return volunteerRequirementRefs.map((volunteerRequirementRef, i) => {
      return (
        <div key={i} className={classes.volunteerRow}>
          <VolunteerRequirementForm ref={volunteerRequirementRef} />
          <IconButton onClick={() => this.handleDeleteVolunteerRequirement(i)} mini className={classes.button}>
            <RemoveCircleIcon />
          </IconButton>
        </div>
      );
    });
  }

  renderVolunteerDetails() {
    const { fields, handleChange, classes } = this.props;
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
                name={FieldName.volunteerRequirementsDescription}
                id={FieldName.volunteerRequirementsDescription}
                key={FieldName.volunteerRequirementsDescription}
                value={fieldValue(fields, FieldName.volunteerRequirementsDescription)}
                error={fieldHasError(fields, FieldName.volunteerRequirementsDescription)}
                helper={fieldErrorText(fields, FieldName.volunteerRequirementsDescription)}
                onChange={handleChange}
                multiline
                className={classes.textField}
              />

              {/* <Typography variant="caption" style={{ marginBottom: '20px' }}>Type of Volunteers Needed</Typography> */}
              {this.renderVolunteerRequirements()}

              <IconButton
                onClick={this.handleAddVolunteerRequirement} 
                className={classes.button} 
              >
                <AddCircleIcon />
              </IconButton>
              
              <TextField 
                fullWidth
                InputLabelProps={{ shrink: true}}
                label='Volunteer Benefits'
                margin='normal'
                name={FieldName.volunteerBenefitsDescription}
                id={FieldName.volunteerBenefitsDescription}
                key={FieldName.volunteerBenefitsDescription}
                value={fieldValue(fields, FieldName.volunteerBenefitsDescription)}
                error={fieldHasError(fields, FieldName.volunteerBenefitsDescription)}
                helper={fieldErrorText(fields, FieldName.volunteerBenefitsDescription)}
                onChange={handleChange}
                multiline
              />
            </Typography>
          </Grid>
        </Paper>
      </React.Fragment>
    );
  }


  render() {
    const { classes } = this.props;
    if (this.state.shouldRedirect) {
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
            {this.renderVolunteerDetails()}
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
  button: {
    color: 'black',
    margin: '0px',
    marginLeft: '5px',
    transform: 'scale(0.8)',
    height: '15px',
    width: '15px',
    marginBottom: '20px',
    marginTop: '5px',
    padding: '5px',
  },
  rows: {
    margin: '0px',
  },
  textField: {
    marginBottom: '25px',
  },
  volunteerRow: {
    display: 'flex', 
    alignItems: 'center',
    marginTop: '20px',
  },
}); 


export const NewProjectForm = withContext(AppContext)(
  withStyles(styles)(
    withTheme()(
      withForm(
        FieldName, 
        constraints
      )(_NewProjectForm))));