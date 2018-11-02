import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { withStyles, withTheme } from '@material-ui/core/styles';
import { Grid, Button, Paper } from '@material-ui/core';
import RemoveRedEyeIcon from '@material-ui/icons/RemoveRedEye';

import { extractErrors, formatErrors } from 'util/errors';
import { getFieldNameObject, withForm } from 'util/form';
import { AppContext } from 'components/main/AppContext';
import { withContext } from 'util/context';

import { AlertType } from 'components/shared/Alert';
import { ProjectMainInfo } from 'components/shared/ProjectMainInfo';
import { ProjectOwnerDetails } from 'components/shared/ProjectOwnerDetails';
import { ProjectDetails } from './ProjectDetails';
import { ProjectVolunteerDetails } from './ProjectVolunteerDetails';
import { ProjectBaseDetails } from './ProjectBaseDetails';

import { ProjectType } from 'components/shared/enums/ProjectType';

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
    length: { maximum: 500 },
  },
  [FieldName.volunteerBenefitsDescription]: {
    length: { maximum: 500 },
  },

  [FieldName.projectType]: {
    presence: { allowEmpty: false },
  },
  [FieldName.startDate]: (value, attributes) => {
    if (attributes.projectType === ProjectType.RECURRING) return null;

    return {
      datetime: {
        dateOnly: true,
        latest: attributes.endDate,
      },
      presence: { allowEmpty: false },
    };
  },
  [FieldName.endDate]: (value, attributes) => {
    if (attributes.projectType === ProjectType.RECURRING) return null;

    return {
      datetime: {
        dateOnly: true,
        earliest: attributes.startDate,
      },
      presence: { allowEmpty: false },
    };
  },
  [FieldName.frequency]: (value, attributes) => {
    if (attributes.projectType === ProjectType.EVENT) return null;

    return {
      presence: { allowEmpty: false },
    };
  },
};

const validateGroupsMap = {
  fields: {
    [FieldName.startDate]: 'eventDate',
    [FieldName.endDate]: 'eventDate',
  },
  validateGroups: {
    eventDate: [FieldName.startDate, FieldName.endDate],
  },
};

const PROJECT_ADDED_SUCCESS_MESSAGE =
  'You have submitted this project successfully! It will now be pending admin approval.';

class _ProjectOwnerNewProjectForm extends Component {
  constructor(props) {
    super(props);

    this.projectImageInput = React.createRef();

    this.state = {
      volunteerRequirementRefs: [React.createRef()],
      isSubmitting: false,
      shouldRedirect: false,
      preview: false,
      project: {},
    };

    props.setField(FieldName.issuesAddressed, []);
  }

  handleAddVolunteerRequirement = () => {
    this.setState({
      volunteerRequirementRefs: [
        ...this.state.volunteerRequirementRefs,
        React.createRef(),
      ],
    });
  };

  handleDeleteVolunteerRequirement = i => {
    const newVolunteerRequirementRefs = [
      ...this.state.volunteerRequirementRefs,
    ];
    newVolunteerRequirementRefs.splice(i, 1);
    this.setState({
      volunteerRequirementRefs: newVolunteerRequirementRefs,
    });
  };

  validateAllSubFormFields = () => {
    const { volunteerRequirementRefs } = this.state;
    return volunteerRequirementRefs.every(ref =>
      ref.current.validateAllFields()
    );
  };

  resetAllSubFormFields = () => {
    const { volunteerRequirementRefs } = this.state;
    volunteerRequirementRefs.forEach(ref => ref.current.resetAllFields());
  };

  valuesForAllSubFormFields = () => {
    const { volunteerRequirementRefs } = this.state;
    return volunteerRequirementRefs.map(ref =>
      ref.current.valuesForAllFields()
    );
  };

  togglePreviewOn = () => {
    const { fields } = this.props;
    const project = {};

    for (const [key, valueObject] of Object.entries(fields)) {
      project[key] = valueObject.value;
    }

    this.setState({ preview: true, project });
  };

  togglePreviewOff = () => {
    this.setState({ preview: false });
  };

  handleSubmit = async event => {
    event.preventDefault();
    console.log('VALUES', this.props.valuesForAllFields());

    if (!this.props.validateAllFields() || !this.validateAllSubFormFields()) {
      return;
    }

    const { authenticator } = this.props.context.utils;
    const currentUser = authenticator.getCurrentUser();

    const volunteerRequirements = this.valuesForAllSubFormFields();

    const newProject = {
      ...this.props.valuesForAllFields(),
      volunteerRequirements,
      projectOwner: currentUser.id,
    };
    const { showAlert } = this.props.context.updaters;
    const { requestWithAlert } = this.props.context.utils;

    this.setState({ isSubmitting: true });
    const response = await requestWithAlert.post(
      '/api/v1/project_owner/projects/new',
      { project: newProject },
      { authenticated: true }
    );
    this.setState({ isSubmitting: false });

    if (response.isSuccessful) {
      showAlert(
        'projectAddedSuccess',
        AlertType.SUCCESS,
        PROJECT_ADDED_SUCCESS_MESSAGE
      );
      this.props.resetAllFields();
      this.resetAllSubFormFields();
      this.setState({ shouldRedirect: true });
    }

    if (response.hasError) {
      const errors = await extractErrors(response);
      showAlert('projectAddedFailure', AlertType.ERROR, formatErrors(errors));
    }
  };

  renderPreviewNotice = () => {
    const { classes } = this.props;

    return (
      <Paper square className={classes.previewNotice}>
        <Button disabled fullWidth>
          <RemoveRedEyeIcon className={classes.leftIcon} />
          This is a preview
        </Button>
      </Paper>
    );
  };

  renderActionBar = () => {
    const { classes } = this.props;
    const { preview } = this.state;

    return (
      <div className={classes.actionBar}>
        <div className={classes.buttonGroup}>
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            className={classes.button}
          >
            Submit
          </Button>
          {!preview ? (
            <Button
              variant="contained"
              className={classes.button}
              onClick={this.togglePreviewOn}
            >
              Preview
            </Button>
          ) : (
            <Button
              variant="contained"
              className={classes.button}
              onClick={this.togglePreviewOff}
            >
              Back to form
            </Button>
          )}
        </div>
      </div>
    );
  };

  render() {
    const { classes } = this.props;
    const { preview } = this.state;

    if (this.state.shouldRedirect) {
      return (
        <Redirect
          to={{
            pathname: '/project_owner/dashboard',
          }}
        />
      );
    }

    return (
      <form onSubmit={this.handleSubmit} className={classes.root}>
        <div className={classes.form}>
          <Grid container spacing={16}>
            {!preview ? (
              <React.Fragment>
                <Grid item xs={12} style={{ paddingTop: '56px' }} />
                <Grid item xs={12}>
                  <ProjectBaseDetails
                    fields={this.props.fields}
                    FieldName={FieldName}
                    handleChange={this.props.handleChange}
                    projectImageInput={this.projectImageInput}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ProjectVolunteerDetails
                    volunteerRequirementRefs={
                      this.state.volunteerRequirementRefs
                    }
                    FieldName={FieldName}
                    fields={this.props.fields}
                    handleChange={this.props.handleChange}
                    handleDeleteVolunteerRequirement={
                      this.handleDeleteVolunteerRequirement
                    }
                    handleAddVolunteerRequirement={
                      this.handleAddVolunteerRequirement
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ProjectDetails
                    fields={this.props.fields}
                    FieldName={FieldName}
                    handleChange={this.props.handleChange}
                    resetField={this.props.resetField}
                  />
                </Grid>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Grid item xs={12}>
                  {this.renderPreviewNotice()}
                </Grid>
                <Grid item xs={12}>
                  <ProjectMainInfo project={this.state.project} />
                </Grid>
              </React.Fragment>
            )}
            <Grid item xs={12}>
              <ProjectOwnerDetails />
            </Grid>
          </Grid>
        </div>
        {this.renderActionBar()}
      </form>
    );
  }
}

const styles = theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  form: {
    flexGrow: 1,
    width: '80vw',
    margin: '0 auto',
    padding: '0 0 60px',
  },
  previewNotice: {
    padding: theme.spacing.unit / 2,
    backgroundColor: theme.palette.grey[200],
  },
  paper: {
    padding: theme.spacing.unit * 2,
    height: '100%',
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
  buttonGroup: {
    width: '90vw',
  },
  button: {
    marginTop: theme.spacing.unit * 1.5,
    marginRight: 0,
    marginBottom: theme.spacing.unit * 1.5,
    marginLeft: theme.spacing.unit * 2,
    float: 'right',
  },
  actionBar: {
    position: 'sticky',
    bottom: 0,
    backgroundColor: theme.palette.grey[200],
  },
});

export const ProjectOwnerNewProjectForm = withForm(
  FieldName,
  constraints,
  validateGroupsMap
)(
  withContext(AppContext)(
    withTheme()(withStyles(styles)(_ProjectOwnerNewProjectForm))
  )
);
