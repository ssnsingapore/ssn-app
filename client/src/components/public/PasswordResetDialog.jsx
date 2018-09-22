import React, { Component } from 'react';

import {
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
  TextField,
} from '@material-ui/core';

import { AppContext } from 'components/main/AppContext';
import { AlertType } from 'components/shared/Alert';
import { getFieldNameObject, withForm, fieldHasError, fieldErrorText } from 'util/form';
import { withContext } from 'util/context';

const PASSWORD_RESET_ERROR_MESSAGE = 'There was a problem resetting your password. Please try again!';
const PASSWORD_RESET_SUCCESS_MESSAGE = 'You should have received an email with a password reset link';

const FieldName = getFieldNameObject([ 'email' ]);
const constraints = {
  [FieldName.email]: {
    presence: { allowEmpty: false },
    email: true,
  },
};

class _PasswordResetDialog extends Component {
  handlePasswordReset = async () => {
    const { showAlert } = this.props.context.updaters;
    const { requestWithAlert } = this.props.context.utils;

    const response = await requestWithAlert.post('/api/v1/passwordReset', {});

    if (response.isSuccessful) {
      this.handlePasswordResetDialogClose();
      showAlert('passwordResetSuccess', AlertType.SUCCESS, PASSWORD_RESET_SUCCESS_MESSAGE);
    }

    if (response.hasError) {
      showAlert('passwordResetSuccess', AlertType.ERROR, PASSWORD_RESET_ERROR_MESSAGE);
    }
  }

  render() {
    const { open, handleClose, handleChange, fields } = this.props;

    return (
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Reset your password</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter your email address below and you will receive an email with a password reset link. The link will expire in 1 hour.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            id={FieldName.email}
            name={FieldName.email}
            label="Email Address"
            type="email"
            onChange={handleChange}
            error={fieldHasError(fields, FieldName.email)}
            helperText={fieldErrorText(fields, FieldName.email)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="default">
            Cancel
          </Button>
          <Button onClick={this.handlePasswordReset} color="primary">
            Reset password
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export const PasswordResetDialog = withForm(FieldName, constraints)(
  withContext(AppContext)(
    _PasswordResetDialog
  )
);