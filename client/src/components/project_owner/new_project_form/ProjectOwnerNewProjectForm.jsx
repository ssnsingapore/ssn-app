import React, { Component } from 'react';

import { AppContext } from 'components/main/AppContext';
import { AlertType } from 'components/shared/Alert';
import { withContext } from 'util/context';
import { withForm } from 'util/form';
import { extractErrors, formatErrors } from 'util/errors';

import { ProjectOwnerProjectForm } from './ProjectOwnerProjectForm';
import { FieldName, constraints, validateGroupsMap } from './ProjectFormFields';
import {
  addVolunteerRequirementRef,
  deleteVolunteerRequirementRef,
  validateFormFields,
  resetAllFields,
  valuesForAllFields,
} from './VolunteerRequirementForm';

const PROJECT_ADDED_SUCCESS_MESSAGE =
  'You have submitted this project successfully! It will now be pending admin approval.';

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

  handleSubmit = async event => {
    event.preventDefault();

    const formData = new FormData();
    const image = this.projectImageInput.current.state.image;
    if (image) {
      formData.append('projectImage', image);
    }

    if (
      !this.props.validateAllFields() ||
      !this.validateAllSubFormFields()
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
  withForm(FieldName, constraints, validateGroupsMap)(
    withContext(AppContext)(_ProjectOwnerNewProjectForm)
  );
