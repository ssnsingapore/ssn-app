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
      src="https://i.kym-cdn.com/photos/images/newsfeed/001/384/545/7b9.jpg"
      className={classes.avatar}
    />
    <Typography variant="display1" align="center">
      You're not authorized to access this page!
    </Typography>
  </div>
));
