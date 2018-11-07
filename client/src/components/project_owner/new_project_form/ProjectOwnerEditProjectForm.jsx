import React, { Component } from 'react';
import moment from 'moment';

import { Spinner } from 'components/shared/Spinner';
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
      isLoadingProject: true,
      shouldRedirect: false,
      projectToRender: {},
    };
  }

  async componentDidMount() {
    const { requestWithAlert } = this.props.context.utils;
    const response = await requestWithAlert.get(`/api/v1/projects/${this.props.match.params.id}`);

    if (response.isSuccessful) {
      const { project } = await response.json();
      this.setState({ projectToRender: project });

      const dateFields = ['startDate', 'endDate'];
      Object.values(FieldName)
        .filter(key => !dateFields.includes(key))
        .forEach(key => this.props.setField(key, project[key]));
      dateFields
        .forEach(key =>
          this.props.setField(FieldName[key], moment.utc(project[key]).local().format('YYYY-MM-DD')));

      const { volunteerRequirements } = project;
      volunteerRequirements.forEach((_row, index) => {
        this.handleAddVolunteerRequirement();
        this.setSubFormFields(volunteerRequirements, index);
      });
    }

    if (response.hasError) {
      const { showAlert } = this.props.context.updaters;
      const errors = await extractErrors(response);
      showAlert('getProjectFailure', AlertType.ERROR, formatErrors(errors));
    }

    this.setState({ isLoadingProject: false });
  }

  setSubFormFields = (volunteerRequirements, index) => {
    Object.keys(volunteerRequirements[index]).forEach(detail =>
      this.state.volunteerRequirementRefs[index].current.setField(
        VolunteerRequirementFieldName[detail], volunteerRequirements[index][detail]
      )
    );
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
    this.setState({ volunteerRequirementRefs: newVolunteerRequirementRefs });
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

    const { projectToRender } = this.state;
    const PROJECT_EDITED_SUCCESS_MESSAGE =
      this._isProjectRejected(projectToRender) ?
        `${projectToRender.title} details have been successfully updated! It will now be pending admin approval.`
        :
        `${projectToRender.title} details have been successfully updated!`;

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
    const postContent = { project: updatedProject };
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
    if (this.props.isLoadingProject) {
      return <Spinner />;
    };

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
    />;
  }
}

export const ProjectOwnerEditProjectForm =
  withForm(FieldName, constraints)(
    withContext(AppContext)(_ProjectOwnerEditProjectForm)
  );