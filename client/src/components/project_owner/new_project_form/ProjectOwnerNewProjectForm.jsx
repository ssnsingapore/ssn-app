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

export class _ProjectOwnerNewProjectForm extends Component {

  constructor(props) {
    super(props);

    this.state = {
      volunteerRequirementRefs: [React.createRef()],
      isSubmitting: false,
      isProjectLoading: true,
      shouldRedirect: false,
      preview: false,
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

  handleSubmit = async event => {
    event.preventDefault();

    if (!this.props.validateAllFields() || !this.validateAllSubFormFields()) {
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

    this.setState({ isSubmitting: true });
    const submitEndpoint = '/api/v1/project_owner/projects/new';
    const postContent = { project: newProject };
    const response = await requestWithAlert.post(submitEndpoint, postContent, {authenticated: true});
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
      formType='new' 
      handleSubmit={this.handleSubmit}
      handleChange={this.props.handleChange}
      fields={this.props.fields}
      volunteerRequirementRefs={this.state.volunteerRequirementRefs}
      handleAddVolunteerRequirement={this.handleAddVolunteerRequirement}
      handleDeleteVolunteerRequirement={this.handleDeleteVolunteerRequirement}
      resetField={this.props.resetField}
      isLoadingProject={this.state.isLoadingProject}
      shouldRedirect={this.state.shouldRedirect}
      isSubmitting={this.state.isSubmitting}
    />;
  }
}

export const ProjectOwnerNewProjectForm = 
withForm(FieldName, constraints)(
  withContext(AppContext)(_ProjectOwnerNewProjectForm)
);