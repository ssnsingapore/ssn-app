import React, { Component } from 'react';
import { IconButton } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ExitToApp as LogoutIcon } from '@material-ui/icons';

import { AppContext } from './AppContext';
import { withContext } from 'util/context';

class _Footer extends Component {
  render() {
    const { classes } = this.props;
    const { isAuthenticated, currentUser } = this.props.context;
    const { authenticator } = this.props.context.utils;

    if (!isAuthenticated || !currentUser) {
      return null;
    }

    return (
      <div className={classes.root}>
        <p>Welcome {currentUser.name}!</p>
        <IconButton
          aria-label="Logout"
          color="inherit"
          onClick={authenticator.logout}
        >
          <LogoutIcon className={classes.icon} />
        </IconButton>
      </div>
    );
  }
}

const styles = {
  root: {
    flexBasis: '10%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  icon: {
    fontSize: 40,
  },
};

export const Footer = withStyles(styles)(
  withContext(AppContext)(_Footer));
