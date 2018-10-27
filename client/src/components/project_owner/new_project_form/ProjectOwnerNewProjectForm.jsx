import React, { Component } from 'react';

import { ProjectOwnerProjectForm } from 'components/project_owner/new_project_form/ProjectOwnerProjectForm';

export class ProjectOwnerNewProjectForm extends Component {
  render() {
    return <ProjectOwnerProjectForm formType='new'/>;
  }
}