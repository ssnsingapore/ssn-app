import React from 'react';
import { Typography, Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { Warning } from '@material-ui/icons';
import { amber } from '@material-ui/core/colors';

import { Role } from 'components/shared/enums/Role';

const _RejectionReason = ({ role, rejectionReason, classes }) => {

  const preambleText = role === Role.PROJECT_OWNER ?
    'This project has been rejected. Please edit your project before it is pending approval and for admin review.' :
    'An admin has rejected this project. Project owner will have to edit the project before another round of admin approval.';

  return (
    <Grid item xs={12}>
      <Typography variant="body2">
        {preambleText}
      </Typography>
      <div className={classes.root}>
        <Typography variant="body2">
          <Warning style={{ padding: '0px', marginTop: '2px', marginBottom: '-5px', marginRight: '10px' }} />
          <strong>Rejection reason:</strong> {rejectionReason}
        </Typography>
      </div>
    </Grid>
  );

};

const styles = () => ({
  root: {
    backgroundColor: amber[100],
    padding: '10px',
    marginTop: '10px',
    borderRadius: '5px',
  },
});

export const RejectionReason = withStyles(styles)(_RejectionReason);
