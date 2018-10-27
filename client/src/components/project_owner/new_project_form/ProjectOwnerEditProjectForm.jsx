import React, { Component } from 'react';

import { AppContext } from 'components/main/AppContext';
import { withContext } from 'util/context';

import { ProjectOwnerProjectForm } from 'components/project_owner/new_project_form/ProjectOwnerProjectForm';

class _ProjectOwnerEditProjectForm extends Component {
  render() {
    return <ProjectOwnerProjectForm formType='edit' projectId={this.props.match.params.id}/>;
  }
}

export const ProjectOwnerEditProjectForm = withContext(AppContext)(_ProjectOwnerEditProjectForm);