import React, { Component } from 'react';

import { AppContext } from 'components/main/AppContext';
import { withContext } from 'util/context';
import { withForm } from 'util/form';
import { extractErrors, formatErrors } from 'util/errors';
import { ProjectOwnerProjectForm } from 'components/project_owner/new_project_form/ProjectOwnerProjectForm';
import { FieldName, constraints } from './ProjectFormFields';
import { AlertType } from 'components/shared/Alert';
import { ProjectState } from 'components/shared/enums/ProjectState';
import { VolunteerRequirementFieldName } from './VolunteerRequirementForm';

class _ProjectOwnerEditProjectForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      volunteerRequirementRefs: [],
      isSubmitting: false,
      isProjectLoading: true,
      shouldRedirect: false,
      preview: false,
      projectToRender: {},
      isProjectSame: false,
    };

  }

  async componentDidMount() {
    const { requestWithAlert } = this.props.context.utils;
    const response = await requestWithAlert.get(`/api/v1/projects/${this.props.match.params.id}`);
    
    if (response.isSuccessful) {
      const { project } = await response.json();
      this.setState({ projectToRender: project });

      const { projectToRender } = this.state;
      Object.keys(projectToRender)
        .filter(key => key !== 'state' || key !== 'volunteerRequirements')
        .forEach(key => this.props.setField(FieldName[key], projectToRender[key]));

      const { volunteerRequirements } = projectToRender;
      Object.keys(volunteerRequirements).forEach( row => 
      {
        // add volunteer requirement ref
        this.handleAddVolunteerRequirement();
        // set state on volunteer requirement ref details
        Object.keys(volunteerRequirements[row]).forEach(detail =>
          this.state.volunteerRequirementRefs[row].current.setField(
            VolunteerRequirementFieldName[detail], volunteerRequirements[row][detail]
          )
        );
      }
      );
    }
  
    if (response.hasError) {
      const { showAlert } = this.props.context.updaters;
      const errors = await extractErrors(response);
      showAlert('getProjectFailure', AlertType.ERROR, formatErrors(errors));
    }
  
    this.setState({ isLoadingProject: false });
  }

  _isProjectRejected = (project) => project.state === ProjectState.REJECTED;

  handleAddVolunteerRequirement = () => {
    this.setState({
      volunteerRequirementRefs: [
        ...this.state.volunteerRequirementRefs,
        React.createRef(),
      ],
    });
  };

  handleDeleteVolunteerRequirement = i => {
    const newVolunteerRequirementRefs = [...this.state.volunteerRequirementRefs];
    newVolunteerRequirementRefs.splice(i, 1);
    this.setState({volunteerRequirementRefs: newVolunteerRequirementRefs});
  };

  validateAllSubFormFields = () => {
    const { volunteerRequirementRefs } = this.state;
    return volunteerRequirementRefs.every(ref => ref.current.validateAllFields());
  };

  resetAllSubFormFields = () => {
    const { volunteerRequirementRefs } = this.state;
    volunteerRequirementRefs.forEach(ref => ref.current.resetAllFields());
  };

  valuesForAllSubFormFields = () => {
    const { volunteerRequirementRefs } = this.state;
    return volunteerRequirementRefs.map(ref => ref.current.valuesForAllFields());
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

    const { projectToRender } = this.state; 
    const PROJECT_EDITED_SUCCESS_MESSAGE = 
    this._isProjectRejected(projectToRender) ? 
      `${projectToRender.title} details have been successfully updated! It will now be pending admin approval.`
      :
      `${projectToRender.title} details have been successfully updated!` ;

    const volunteerRequirements = this.valuesForAllSubFormFields();
    let updatedProject = {
      ...this.props.valuesForAllFields(),
      volunteerRequirements,
    };

    if (this._isProjectRejected(projectToRender)) {
      updatedProject = {
        ...updatedProject,
        state: ProjectState.PENDING_APPROVAL,
      }; 
    }

    this.setState({ isSubmitting: true });
    const submitEndpoint = `/api/v1/project_owner/projects/${this.props.match.params.id}`;
    const postContent = { project: updatedProject, projectOwner: currentUser.id };
    const response = await requestWithAlert.put(submitEndpoint, postContent, { authenticated: true });
    this.setState({ isSubmitting: false });

    if (response.isSuccessful) {
      showAlert('projectEditedSuccess', AlertType.SUCCESS, PROJECT_EDITED_SUCCESS_MESSAGE);
      this.props.resetAllFields();
      this.resetAllSubFormFields();
      this.setState({ shouldRedirect: true });
    }

    if (response.hasError) {
      const errors = await extractErrors(response);
      showAlert('projectEditedFailure', AlertType.ERROR, formatErrors(errors));
    }
  };

  render() {
    return <ProjectOwnerProjectForm 
      formType='edit' 
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
      isProjectSame={this.state.isProjectSame}
    />;
  }
}

export const ProjectOwnerEditProjectForm = 
withForm(FieldName, constraints)(
  withContext(AppContext)(_ProjectOwnerEditProjectForm)
);