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
import { Spinner } from 'components/shared/Spinner';

import {
  getFieldNameObject,
  withForm,
  fieldHasError,
  fieldErrorText,
  fieldValue,
} from 'util/form';
import { withContext } from 'util/context';
import { extractErrors, formatErrors } from '../../util/errors';

const PASSWORD_RESET_SUCCESS_MESSAGE = 'You should have received an email with a password reset link';

const FieldName = getFieldNameObject([ 'email' ]);
const constraints = {
  [FieldName.email]: {
    presence: { allowEmpty: false },
    email: true,
  },
};

class _PasswordResetDialog extends Component {
  state = {
    isLoading: false,
  }

  handlePasswordReset = async () => {
    const { showAlert } = this.props.context.updaters;
    const { requestWithAlert } = this.props.context.utils;

    const { fields } = this.props;
    const data = { email: fieldValue(fields, FieldName.email) };

    this.setState({ isLoading: true });
    const response = await requestWithAlert.post('/api/v1/project_owners/passwordReset', data);
    this.setState({ isLoading: false });

    if (response.isSuccessful) {
      this.props.handleClose();
      showAlert('passwordResetSuccess', AlertType.SUCCESS, PASSWORD_RESET_SUCCESS_MESSAGE);
    }

    if (response.hasError) {
      const errors = await extractErrors(response);
      showAlert('passwordResetSuccess', AlertType.ERROR, formatErrors(errors));
    }
  }

  renderDialogContent = () => {
    const { handleChange, fields } = this.props;

    return (
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
          disabled={this.state.isLoading}
        />
        {this.state.isLoading && <Spinner />}
      </DialogContent>
    );
  }

  render() {
    const { open, handleClose } = this.props;

    return (
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Reset your password</DialogTitle>
        {this.renderDialogContent()}
        <DialogActions>
          <Button onClick={handleClose} color="default">
            Cancel
          </Button>
          <Button onClick={this.handlePasswordReset} color="primary" disabled={this.state.isLoading}>
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