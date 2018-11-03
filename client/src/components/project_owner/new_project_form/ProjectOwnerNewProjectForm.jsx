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

export const PROJECT_IMAGE_DISPLAY_WIDTH = 480;
export const PROJECT_IMAGE_DISPLAY_HEIGHT = 480;

const DISPLAY_WIDTH = PROJECT_IMAGE_DISPLAY_WIDTH;
const DISPLAY_HEIGHT = PROJECT_IMAGE_DISPLAY_HEIGHT;

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

  getImageDimensions = image => {
    return new Promise(resolve => {
      image.addEventListener('load', () => {
        resolve({ width: image.width, height: image.height });
      });
    });
  };

  resizeImage = async () => {
    const image = new Image();

    const projectImage = this.projectImageInput.current.files[0];
    const projectImageSrc = window.URL.createObjectURL(projectImage);

    image.src = projectImageSrc;

    const { width, height } = await this.getImageDimensions(image);

    if (width < DISPLAY_WIDTH || height < DISPLAY_HEIGHT) {
      this.setState({ isImageResolutionTooLow: true });
    } else {
      this.setState({ isImageResolutionTooLow: false });
    }

    let finalWidth = width;
    let finalHeight = height;

    if (width < height && width > DISPLAY_WIDTH) {
      finalWidth = DISPLAY_WIDTH;
      finalHeight = (height / width) * DISPLAY_WIDTH;
    }

    if (height < width && height > DISPLAY_HEIGHT) {
      finalHeight = DISPLAY_HEIGHT;
      finalWidth = (width / height) * DISPLAY_HEIGHT;
    }

    const canvas = document.createElement('canvas');
    canvas.width = finalWidth;
    canvas.height = finalHeight;

    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, finalWidth, finalHeight);
    return new Promise(resolve => {
      canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.6);
    });
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

    const formData = new FormData();
    if (this.projectImageInput.current.files[0]) {
      const resizedProjectImage = await this.resizeImage();
      formData.append('projectImage', resizedProjectImage);
    }

    if (
      !this.props.validateAllFields() ||
      !this.validateAllSubFormFields() ||
      this.state.isImageResolutionTooLow
    ) {
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
    Object.keys(newProject)
      .filter(
        key => newProject[key] !== undefined && newProject[key].length !== 0
      )
      .forEach(key => formData.append(key, newProject[key]));

    const { showAlert } = this.props.context.updaters;
    const { requestWithAlert } = this.props.context.utils;

    this.setState({ isSubmitting: true });
    const response = await requestWithAlert.uploadForm(
      '/api/v1/project_owner/projects/new',
      formData,
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
