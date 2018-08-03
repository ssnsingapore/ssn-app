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
      src="http://i0.kym-cdn.com/photos/images/original/001/384/532/161.jpg"
      className={classes.avatar}
    />
    <Typography variant="display1" align="center">
      I am sad because I couldn't find what you're looking for
    </Typography>
  </div>
));
