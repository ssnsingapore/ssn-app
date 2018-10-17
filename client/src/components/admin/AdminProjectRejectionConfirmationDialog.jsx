import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
  TextField,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';


import { AlertType } from 'components/shared/Alert';
import { AppContext } from 'components/main/AppContext';
import { withContext } from 'util/context';
import { extractErrors, formatErrors } from 'util/errors';
import {
  withForm,
  getFieldNameObject,
  fieldValue,
  fieldErrorText,
  fieldHasError } from 'util/form';
import { ProjectState } from 'components/shared/enums/ProjectState';

const PROJECT_REJECTED_SUCCESS_MESSAGE = 'The project has been successfully rejected.';

const FieldName = getFieldNameObject(['rejectionReason']);
const constraints = {
  [FieldName.rejectionReason]: {
    presence: { allowEmpty: false },
    length: { maximum: 500 },
  },
};

export class _AdminProjectRejectionConfirmationDialog extends Component {
  state = {
    isSubmitting: false,
    shouldRedirect: false,
  }

  handleReject = async (event) => {

    event.preventDefault();

    if (!this.props.validateAllFields()) {
      return;
    }

    const { rejectionReason } = this.props.valuesForAllFields();

    const { projectId } = this.props;
    const endpoint = `/api/v1/admin/projects/${projectId}`;

    const updatedProject = { 
      project: {
        state: ProjectState.REJECTED,
        rejectionReason,
      },
    };

    console.log(updatedProject);

    const { showAlert } = this.props.context.updaters;
    const { requestWithAlert } = this.props.context.utils;

    this.setState({ isSubmitting: true });
    const response = await requestWithAlert.put(endpoint, updatedProject, { authenticated: true });
    this.setState({ isSubmitting: false });

    if (response.isSuccessful) {
      showAlert('projectRejectSuccess', AlertType.SUCCESS, PROJECT_REJECTED_SUCCESS_MESSAGE);
      this.setState({ shouldRedirect: true});
    }

    if (response.hasError) {
      const errors = await extractErrors(response);
      showAlert('projectRejectFailure', AlertType.ERROR, formatErrors(errors));
    }

  };

  renderDialogContent = () => {
    const { fields, handleChange, classes } = this.props;
    return (
      <DialogContent>
        <DialogContentText>
          Are you sure you want to reject this project?
        </DialogContentText>
        <DialogContentText>
          <TextField 
            name={FieldName.rejectionReason}
            className={classes.textField}
            id={FieldName.rejectionReason}
            label="Provide reason for the project owner"
            onChange={handleChange}
            value={fieldValue(fields, FieldName.rejectionReason)}
            error={fieldHasError(fields, FieldName.rejectionReason)}
            helper={fieldErrorText(fields, FieldName.rejectionReason)}
            fullWidth
            multiline
          />
        </DialogContentText>
      </DialogContent>
    );
  }

  render() {
    const { open, handleClose } = this.props;
    if (this.state.shouldRedirect) {
      return(
        <Redirect to={{
          pathname: '/admin/dashboard' }}/>
      );
    }

    return (
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <form onSubmit={this.handleReject}>
          <DialogTitle id="form-dialog-title">Reject project</DialogTitle>
          {this.renderDialogContent()}
          <DialogActions>
            <Button onClick={handleClose} color="default">
            No
            </Button>
            <Button 
              type="submit" 
              color="primary" 
              disabled={this.state.isSubmitting}>
            Yes
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    );
  }
}


const styles = theme => ({
  textField: {
    marginTop: '10px',
  },
});


export const AdminProjectRejectionConfirmationDialog = 
  withStyles(styles)(
    withForm(FieldName, constraints)(
      withContext(AppContext)(_AdminProjectRejectionConfirmationDialog)
    )
  );