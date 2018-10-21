import React, { Component } from 'react';

import {
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@material-ui/core';

import { extractErrors, formatErrors } from 'util/errors';
import { AlertType } from 'components/shared/Alert';
import { Role } from 'components/shared/enums/Role';
import { ProjectState } from 'components/shared/enums/ProjectState';
import { AppContext } from '../main/AppContext';
import { withContext } from 'util/context';

const PROJECT_DEACTIVATE_SUCCESS_MESSAGE = 'The project has been successfully deactivated.';

class _ProjectDeactivateConfirmationDialog extends Component {
  state = {
    isSubmitting: false,
    shouldRefreshPage: false,
  }

  renderDialogContent = () => {
    return (
      <DialogContent>
        <DialogContentText>
          Are you sure you want to deactivate this project?
        </DialogContentText>
      </DialogContent>
    );
  }

  handleDeactivateProject = async (event) => {
    event.preventDefault();

    const { dashboardRole, project, handleClose } = this.props;
    const id = project._id;
  
    let endpoint = '';
    switch(dashboardRole) {
    case Role.PROJECT_OWNER:
      endpoint = `/api/v1/project_owner/projects/${id}`;
      break;
    case Role.ADMIN:
      endpoint = `/api/v1/admin/projects/${id}`;
      break;
    default:
      endpoint = '';
    }

    const { showAlert } = this.props.context.updaters;
    const { requestWithAlert } = this.props.context.utils;

    const updatedProject = { 
      project: {
        state: ProjectState.APPROVED_INACTIVE,
      }, 
    };

    this.setState({ isSubmitting: true });
    const response = await requestWithAlert.put(endpoint, updatedProject, { authenticated: true });
    this.setState({ isSubmitting: false });

    if (response.isSuccessful) {
      showAlert('projectDeactivateSuccess', AlertType.SUCCESS, PROJECT_DEACTIVATE_SUCCESS_MESSAGE);
      handleClose();
      this.setState({ shouldRefreshPage: true});
    }

    if (response.hasError) {
      const errors = await extractErrors(response);
      showAlert('projectDeactivateFailure', AlertType.ERROR, formatErrors(errors));
      handleClose();
    }

  }

  render() {
    const { open, handleClose } = this.props;
    if (this.state.shouldRefreshPage) {
      window.location.reload();
    }

    return (
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Deactivate project</DialogTitle>
        {this.renderDialogContent()}
        <DialogActions>
          <Button 
            onClick={handleClose} 
            color="default">
            No
          </Button>
          <Button 
            onClick={this.handleDeactivateProject} 
            color="primary" 
            disabled={this.state.isSubmitting}>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export const ProjectDeactivateConfirmationDialog = withContext(
  AppContext)(_ProjectDeactivateConfirmationDialog);