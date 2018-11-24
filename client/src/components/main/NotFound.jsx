import React from 'react';
import { Avatar, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

const styles = {
  root: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '600px',
    margin: '0 auto',
  },
  avatar: {
    width: '400px',
    height: '400px',
    marginBottom: '50px',
  },
};

export const NotFound = withStyles(styles)(({ classes }) => (
  <div className={classes.root}>
    <Avatar
      alt="Crying kitten"
      src="https://s3-ap-southeast-1.amazonaws.com/ssn-app-test/Other.jpg"
      className={classes.avatar}
    />
    <Typography variant="display1" align="center">
      Oops. We couldn't find the page you're looking for!
    </Typography>
  </div>
));
