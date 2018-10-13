import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { withStyles, withTheme } from '@material-ui/core/styles';
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardMedia,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Input,
  Chip,
  BottomNavigation,
  Button,
} from '@material-ui/core';

import { extractErrors, formatErrors } from 'util/errors';
import {
  fieldErrorText,
  fieldHasError,
  getFieldNameObject,
  withForm,
  fieldValue,
} from 'util/form';
import { AppContext } from 'components/main/AppContext';
import { withContext } from 'util/context';

import { AlertType } from 'components/shared/Alert';
import { ProjectOwnerDetails } from 'components/shared/ProjectOwnerDetails';
import { ProjectDetails } from './ProjectDetails';
import { ProjectVolunteerDetails } from './ProjectVolunteerDetails';
import { ProjectBaseDetails } from './ProjectBaseDetails';

import { ProjectType } from 'components/shared/enums/ProjectType';
import { ProjectLocation } from 'components/shared/enums/ProjectLocation';
import { ProjectState } from 'components/shared/enums/ProjectState';
import { ProjectFrequency } from 'components/shared/enums/ProjectFrequency';
import { IssueAddressed } from 'components/shared/enums/IssueAddressed';

const FieldName = getFieldNameObject([
  'title',
  'description',
  'volunteerSignupUrl',

  'volunteerRequirementsDescription',
  'volunteerBenefitsDescription',

  'projectType',
  'startDate',
  'endDate',
  'frequency',
  'time',
  'location',
  'issuesAddressed',
]);

const constraints = {
  [FieldName.title]: {
    presence: { allowEmpty: false },
    length: { maximum: 50 },
  },
  [FieldName.description]: {
    presence: { allowEmpty: false },
    length: { maximum: 5000 },
  },
  [FieldName.volunteerSignupUrl]: {
    isUrl: { allowEmpty: true },
  },

  [FieldName.volunteerRequirementsDescription]: {
    presence: { allowEmpty: true },
    length: { maximum: 500 },
  },
  [FieldName.volunteerBenefitsDescription]: {
    presence: { allowEmpty: true },
    length: { maximum: 500 },
  },

  // TODO: Maryana's constraints
};

const PROJECT_ADDED_SUCCESS_MESSAGE = 'You have submitted this project successfully! It will now be pending admin approval.';

class _ProjectOwnerNewProject extends Component {
  state = {
    volunteerRequirementRefs: [
      React.createRef(),
    ],
    isSubmitting: false,
    shouldRedirect: false,
  };

  handleAddVolunteerRequirement = () => {
    this.setState({
      volunteerRequirementRefs: [...this.state.volunteerRequirementRefs, React.createRef()],
    });
  }

  handleDeleteVolunteerRequirement = (i) => {
    const newVolunteerRequirementRefs = [...this.state.volunteerRequirementRefs];
    newVolunteerRequirementRefs.splice(i, 1);
    this.setState({
      volunteerRequirementRefs: newVolunteerRequirementRefs,
    });
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

    const { showAlert } = this.props.context.updaters;
    const { requestWithAlert } = this.props.context.utils;

    this.setState({ isSubmitting: true });
    const response = await requestWithAlert
      .post('/api/v1/projects/add', { project: newProject }, { authenticated: true });
    this.setState({ isSubmitting: false });

    if (response.isSuccessful) {
      showAlert('projectAddedSuccess', AlertType.SUCCESS, PROJECT_ADDED_SUCCESS_MESSAGE);
      this.props.resetAllFields();
      this.resetAllSubFormFields();
      this.setState({ shouldRedirect: true});
    }

    if (response.hasError) {
      const errors = await extractErrors(response);
      showAlert('projectAddedFailure', AlertType.ERROR, formatErrors(errors));
    }
  }



  handleSubmit = async event => {
    event.preventDefault();

    if (!this.props.validateAllFields()) {
      return;
    }

    const { authenticator } = this.props.context.utils;
    const currentUser = authenticator.getCurrentUser();

    const filledInProjectDetails = { ...this.props.valuesForAllFields() };
    const { title, description, volunteerSignupUrl } = filledInProjectDetails;

    const newProject = {
      title: title,
      coverImageUrl:
        'https://s3-ap-southeast-1.amazonaws.com/ssn-app-maryana/greenland.png',
      description: description,
      volunteerSignupUrl: volunteerSignupUrl,
      volunteerRequirements: '',
      projectOwner: currentUser.id,
      issuesAddressed: [],
      volunteerRequirementsDescription: '',
      volunteerBenefitsDescription: '',
      projectType: ProjectType.RECURRING,
      time: '9 AM',
      location: ProjectLocation.WEST,
      state: ProjectState.PENDING_APPROVAL,
      startDate: new Date(2018, 10, 1),
      endDate: new Date(2018, 10, 1),
      frequency: ProjectFrequency.A_FEW_TIMES_A_YEAR,
    };

    this.setState({ project: newProject });

    const { showAlert } = this.props.context.updaters;
    const { requestWithAlert } = this.props.context.utils;

    this.setState({ isSubmitting: true });
    const response = await requestWithAlert.post(
      '/api/v1/projects/new',
      { project: newProject },
      { authenticated: true }
    );
    this.setState({ isSubmitting: false });

    if (response.isSuccessful) {
      showAlert(
        'projectAddedSuccess',
        AlertType.SUCCESS,
        ADD_PROJECT_SUCCESS_MESSAGE
      );
      this.props.resetAllFields();
      this.setState({ hasSubmitted: true });
    }

    if (response.hasError) {
      const errors = await extractErrors(response);
      showAlert('projectAddedFailure', AlertType.ERROR, formatErrors(errors));
      this.setState({ hasSubmitted: false });
    }
  };

  render() {
    const { classes } = this.props;
    const { hasSubmitted } = this.state;
    if (hasSubmitted) {
      return (
        <Redirect
          to={{
            pathname: '/project_owner/dashboard',
          }}
        />
      );
    }

    return (
      <form onSubmit={this.handleSubmit}>
        <div className={classes.root}>
          <Grid container spacing={16}>
            <Grid item xs={12}>
              <ProjectBaseDetails
                fields={this.props.fields}
                FieldName={FieldName}
                handleChange={this.props.handleChange}/>
            </Grid>
            <Grid item xs={12} sm={6}>
              <ProjectVolunteerDetails
                volunteerRequirementRefs={this.state.volunteerRequirementRefs}
                FieldName={FieldName}
                fields={this.props.fields}
                handleChange={this.props.handleChange}
                handleDeleteVolunteerRequirement={this.handleDeleteVolunteerRequirement}
                handleAddVolunteerRequirement={this.handleAddVolunteerRequirement}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <ProjectDetails
                fields={this.props.fields}
                FieldName={FieldName}
                handleChange={this.props.handleChange}/>
            </Grid>
            <Grid item xs={12}>
              <ProjectOwnerDetails />
            </Grid>
          </Grid>
        </div>
        <BottomNavigation className={classes.bottomNavigation}>
          <div className={classes.buttonGroup}>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              className={classes.button}
            >
              Submit
            </Button>
            <Button
              variant="contained"
              className={classes.button}
              component={Link}
              to="/preview"
            >
              Preview
            </Button>
          </div>
        </BottomNavigation>
      </form>
    );
  }
}

const styles = theme => ({
  root: {
    flexGrow: 1,
    width: '80vw',
    margin: '0 auto',
    padding: '60px 0',
  },
  paper: {
    padding: theme.spacing.unit * 2,
  },

  textFieldGroup: {
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  formControl: {
    marginTop: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit * 3,
    minWidth: 120,
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: theme.spacing.unit / 4,
  },
  bottomNavigation: {
    backgroundColor: '#EBEBEB',
    width: '100%',
    position: 'fixed',
    bottom: 0,
    paddingBottom: theme.spacing.unit * 8,
  },
  buttonGroup: {
    width: '80vw',
  },
  button: {
    margin: theme.spacing.unit * 1.5,
    float: 'right',
  },
});

const projectType = [
  {
    value: 'Event',
    label: 'Event',
  },
  {
    value: 'Recurring',
    label: 'Recurring',
  },
];

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const issueAddressed = [
  'AIR_QUALITY',
  'AWARENESS_AND_EDUCATION',
  'BIODIVERSITY',
  'CLIMATE',
  'CONSERVATION',
  'ENERGY',
  'FOOD_AND_AGRICULTURE',
  'GREEN_LIFESTYLE',
  'LAND_AND_NOISE_POLLUTION',
  'PLANNING_AND_TRANSPORTATION',
  'PRODUCTION_AND_CONSUMPTION',
  'OTHER',
  'SPORTS_AND_RECREATION',
  'WASTE',
  'WATER',
  'GREEN_TECHNOLOGY',
];

const ADD_PROJECT_SUCCESS_MESSAGE =
  'You have successfully added a new project!';

export const ProjectOwnerNewProject = withForm(FieldName, constraints)(
  withContext(AppContext)(
    withTheme()(withStyles(styles)(_ProjectOwnerNewProject))
  )
);
