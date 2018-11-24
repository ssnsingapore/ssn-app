
import { Role } from 'components/shared/enums/Role';
import React from 'react';
import { Typography, Grid } from '@material-ui/core';
import { Warning } from '@material-ui/icons';

export const RejectionReason = ({ role, rejectionReason }) => {

  const preambleText = role === Role.PROJECT_OWNER ?
    'This project has been rejected. Please edit your project before it is pending approval and for admin review.' :
    'An admin has rejected this project. Project owner will have to edit the project before another round of admin approval.';

  return (
    <Grid item xs={12}>
      <Typography variant="body2">
        {preambleText}
      </Typography>
      <Typography variant="body1">
        <Warning style={{ marginRight: '10px' }} />
        <strong>Rejection reason:</strong> {rejectionReason}
      </Typography>
    </Grid>
  );
};