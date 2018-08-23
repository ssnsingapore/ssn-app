import React, { Component } from 'react';
import { IconButton } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ExitToApp as LogoutIcon } from '@material-ui/icons';

import { AppContext } from './AppContext';
import { withContext } from 'util/context';
import { AlertType } from 'components/shared/Alert';

const LOGOUT_SUCCESS_MESSAGE = 'You\'ve successfully logged out!';
const LOGOUT_FAILURE_MESSAGE = 'We\'ve encountered an error loggingk you out. Please try again!';

class _Footer extends Component {
  handleLogout = async () => {
    const { showAlert } = this.props.context.updaters;
    const { authenticator } = this.props.context.utils;

    const response = await authenticator.logout();

    if (response.isSuccessful) {
      showAlert('logoutSuccess', AlertType.SUCCESS, LOGOUT_SUCCESS_MESSAGE);
    }

    if (response.hasError) {
      showAlert('logoutFailure', AlertType.ERROR, LOGOUT_FAILURE_MESSAGE);
    }
  }

  render() {
    const { classes } = this.props;
    const { authenticator } = this.props.context.utils;
    const currentUser = authenticator.getCurrentUser();

    if (!authenticator.isAuthenticated()|| !currentUser) {
      return null;
    }

    return (
      <div className={classes.root}>
        <p>Welcome {currentUser.name}!</p>
        <IconButton
          aria-label="Logout"
          color="inherit"
          onClick={this.handleLogout}
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
