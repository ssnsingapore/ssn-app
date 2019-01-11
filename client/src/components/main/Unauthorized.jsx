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

export const Unauthorized = withStyles(styles)(({ classes }) => (
  <div className={classes.root}>
    <Avatar
      alt="Screaming cat"
      src="https://s3-ap-southeast-1.amazonaws.com/ssn-app-test/Waste.jpg"
      className={classes.avatar}
    />
    <Typography variant="h4" align="center">
      Are you sure you're supposed to be poking around this page? Did you forget to log in?
    </Typography>
  </div>
));
