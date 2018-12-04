import React, { Component } from 'react';

import { AppContext } from 'components/main/AppContext';
import { withContext } from 'util/context';
import { withForm } from 'util/form';
import { extractErrors, formatErrors } from 'util/errors';
import { ProjectOwnerProjectForm } from 'components/project_owner/new_project_form/ProjectOwnerProjectForm';
import { FieldName, constraints } from 'components/project_owner/new_project_form/ProjectFormFields';
import { AlertType } from 'components/shared/Alert';
import {
  addVolunteerRequirementRef,
  deleteVolunteerRequirementRef,
  validateFormFields,
  resetAllFields,
  valuesForAllFields,
} from 'components/project_owner/new_project_form/VolunteerRequirementForm';

const PROJECT_ADDED_SUCCESS_MESSAGE =
  'You have submitted this project successfully! It will now be pending admin approval.';

export const PROJECT_IMAGE_DISPLAY_WIDTH = 480;
export const PROJECT_IMAGE_DISPLAY_HEIGHT = 480;

const DISPLAY_WIDTH = PROJECT_IMAGE_DISPLAY_WIDTH;
const DISPLAY_HEIGHT = PROJECT_IMAGE_DISPLAY_HEIGHT;

export class _ProjectOwnerNewProjectForm extends Component {
  constructor(props) {
    super(props);

    this.projectImageInput = React.createRef();

    this.state = {
      volunteerRequirementRefs: { 0: React.createRef() },
      isSubmitting: false,
      shouldRedirect: false,
    };

    props.setField(FieldName.issuesAddressed, []);
  }

  handleAddVolunteerRequirement = () => {
    this.setState({
      volunteerRequirementRefs: addVolunteerRequirementRef(this.state.volunteerRequirementRefs),
    });
  };

  handleDeleteVolunteerRequirement = index => {
    this.setState({
      volunteerRequirementRefs: deleteVolunteerRequirementRef(this.state.volunteerRequirementRefs, index),
    });
  };

  validateAllSubFormFields = () => {
    return validateFormFields(this.state.volunteerRequirementRefs);
  };

  resetAllSubFormFields = () => {
    resetAllFields(this.state.volunteerRequirementRefs);
  };

  valuesForAllSubFormFields = () => {
    return valuesForAllFields(this.state.volunteerRequirementRefs);
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
    const newProject = {
      ...this.props.valuesForAllFields(),
      volunteerRequirements: this.valuesForAllSubFormFields(),
      projectOwner: currentUser.id,
    };

    formData.append('project', JSON.stringify(newProject));

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
