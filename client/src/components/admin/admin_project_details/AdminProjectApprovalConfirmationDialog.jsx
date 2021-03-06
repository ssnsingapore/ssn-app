import React, { Component } from 'react';

import {
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@material-ui/core';

export class AdminProjectApprovalConfirmationDialog extends Component {
  state = {
  }

  renderDialogContent = () => {
    return (
      <DialogContent>
        <DialogContentText>
          Are you sure you want to approve this project?
        </DialogContentText>
      </DialogContent>
    );
  }

  render() {
    const { open, handleClose, handleApprove, isSubmitting, isLoading } = this.props;
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Approve Project</DialogTitle>
        {this.renderDialogContent()}
        <DialogActions>
          <Button
            onClick={handleClose}
            disabled={isSubmitting || isLoading}
            color="default">
            No
          </Button>
          <Button
            onClick={handleApprove}
            color="primary"
            disabled={isSubmitting || isLoading}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

