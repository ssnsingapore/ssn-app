import React, { Component } from 'react';

import { AppContext } from 'components/main/AppContext';
import { withContext } from 'util/context';
import { withForm } from 'util/form';
import { extractErrors, formatErrors } from 'util/errors';
import { ProjectOwnerProjectForm } from 'components/project_owner/new_project_form/ProjectOwnerProjectForm';
import { FieldName, constraints } from './ProjectFormFields';
import { AlertType } from 'components/shared/Alert';

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
      projectToRender: {},
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

    const { showAlert } = this.props.context.updaters;
    const { requestWithAlert } = this.props.context.utils;
    const { authenticator } = this.props.context.utils;

    const currentUser = authenticator.getCurrentUser();

    const volunteerRequirements = this.valuesForAllSubFormFields();
    const newProject = {
      ...this.props.valuesForAllFields(),
      volunteerRequirements,
      projectOwner: currentUser.id,
    };

    const fieldsToStringify = ['volunteerRequirements', 'issuesAddressed'];
    Object.keys(newProject)
      .filter(key =>
        newProject[key] !== undefined &&
        newProject[key].length !== 0 &&
        !fieldsToStringify.includes(key)
      )
      .forEach(key => formData.append(key, newProject[key]));

    Object.keys(newProject)
      .filter(key => fieldsToStringify.includes(key))
      .forEach(key => formData.append(key, JSON.stringify(newProject[key])));

    this.setState({ isSubmitting: true });
    const response = await requestWithAlert.uploadForm(
      '/api/v1/project_owner/projects/new',
      formData,
      { authenticated: true }
    );
    this.setState({ isSubmitting: false });

    if (response.isSuccessful) {
      showAlert('projectAddedSuccess', AlertType.SUCCESS, PROJECT_ADDED_SUCCESS_MESSAGE);
      this.props.resetAllFields();
      this.resetAllSubFormFields();
      this.setState({ shouldRedirect: true });
    }

    if (response.hasError) {
      const errors = await extractErrors(response);
      showAlert('projectAddedFailure', AlertType.ERROR, formatErrors(errors));
    }
  };


  render() {
    return <ProjectOwnerProjectForm
      handleSubmit={this.handleSubmit}
      handleChange={this.props.handleChange}
      fields={this.props.fields}
      volunteerRequirementRefs={this.state.volunteerRequirementRefs}
      handleAddVolunteerRequirement={this.handleAddVolunteerRequirement}
      handleDeleteVolunteerRequirement={this.handleDeleteVolunteerRequirement}
      resetField={this.props.resetField}
      shouldRedirect={this.state.shouldRedirect}
      isSubmitting={this.state.isSubmitting}
      projectImageInput={this.projectImageInput}
      formType='new'
    />;
  }
}

export const ProjectOwnerNewProjectForm =
  withForm(FieldName, constraints)(
    withContext(AppContext)(_ProjectOwnerNewProjectForm)
  );
