import React, { Component } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  MenuItem,
  Menu,
  Avatar,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ArrowDropDown as ArrowDropDownIcon } from '@material-ui/icons';

import ssnLogo from 'assets/ssn-logo.png';
import defaultAvatar from 'assets/placeholder-avatar.jpg';
import { withContext } from 'util/context';
import { AppContext } from 'components/main/AppContext';
import { Role } from 'components/shared/enums/Role';
import { AlertType } from 'components/shared/Alert';
import { Link } from 'react-router-dom';
import EditIcon from '@material-ui/icons/Edit';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

const NavBarDisplayMapping = {
  [Role.ADMIN]: 'SSN ADMIN',
  [Role.PROJECT_OWNER]: 'PROJECT OWNER',
};

const LOGOUT_SUCCESS_MESSAGE = 'You\'ve successfully logged out!';
const LOGOUT_FAILURE_MESSAGE = 'We\'ve encountered an error logging you out. Please try again!';

class _NavBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      anchorEl: null,
    };
  }


  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  renderNavbarText = (pathname) => {
    const { isAuthenticated } = this.props.context;
    const { authenticator } = this.props.context.utils;
    const currentUser = authenticator.getCurrentUser();

    if (!isAuthenticated || !currentUser) {
      return null;
    }

    const userMatchPathname = (currentUser.role === Role.PROJECT_OWNER && pathname.includes('/project_owner')) ||
      (currentUser.role === Role.ADMIN && pathname.includes('/admin'));
    return userMatchPathname && (
      <Typography variant="body2" color="inherit" className={this.props.classes.barTitle}>
        {NavBarDisplayMapping[currentUser.role]} DASHBOARD
      </Typography>
    );
  }

  getLink = () => {
    const { isAuthenticated } = this.props.context;
    const { authenticator } = this.props.context.utils;
    const currentUser = authenticator.getCurrentUser();

    if (!isAuthenticated || !currentUser)
      return '/';

    if (currentUser.role === Role.ADMIN)
      return '/admin/dashboard';

    return '/project_owner/dashboard';
  }

  handleLogout = async (currentUser) => {

    const { authenticator } = this.props.context.utils;
    const { showAlert } = this.props.context.updaters;

    const response = currentUser.role === Role.PROJECT_OWNER ?
      await authenticator.logoutProjectOwner() : await authenticator.logoutAdmin();
    if (response.isSuccessful) {
      showAlert('logoutSuccess', AlertType.SUCCESS, LOGOUT_SUCCESS_MESSAGE);
    }

    if (response.hasError) {
      showAlert('logoutFailure', AlertType.ERROR, LOGOUT_FAILURE_MESSAGE);
    }
  }

  renderAvatar = () => {
    const { classes } = this.props;
    const { isAuthenticated } = this.props.context;
    const { authenticator } = this.props.context.utils;
    const currentUser = authenticator.getCurrentUser();

    if (!isAuthenticated || !currentUser) {
      return null;
    }

    const avatarSrc = currentUser.profilePhotoUrl ? currentUser.profilePhotoUrl : defaultAvatar;

    return currentUser && (
      <React.Fragment>
        <Button
          aria-owns={this.state.anchorEl ? 'simple-menu' : null}
          aria-haspopup="true"
          onClick={this.handleClick}
          color="inherit"
          className={classes.logout}
        >
          <Avatar alt="Admin photo" src={avatarSrc} className={classes.avatar} />
          {currentUser.email}
          <ArrowDropDownIcon />
        </Button>
        <Menu
          id="simple-menu"
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          getContentAnchorEl={null}
        >
          {currentUser.role === Role.PROJECT_OWNER &&
            <MenuItem component={Link} to={'/project_owner/edit_profile'} onClick={this.handleClose}>
              <EditIcon style={{ paddingRight: 10 }} /> Edit Profile
            </MenuItem>
          }
          <MenuItem onClick={() => this.handleLogout(currentUser)}>
            <ExitToAppIcon style={{ paddingRight: 10 }} /> Logout
          </MenuItem>
        </Menu>
      </React.Fragment>
    );
  }

  render() {
    const { classes } = this.props;

    return this.props.location.pathname !== '/admin' && (
      <AppBar position="static">
        <Toolbar variant="dense" className={classes.toolBar}>
          <Button
            component={Link}
            to={this.getLink()}
          >
            <img src={ssnLogo} alt="ssn-logo" className={classes.logo} />
          </Button>
          {this.renderNavbarText(this.props.location.pathname)}
          {this.renderAvatar()}
        </Toolbar>
      </AppBar>
    );
  }
}

const styles = {
  toolBar: {
    width: '80vw',
    margin: '0 auto',
    padding: '0',
  },
  logo: {
    height: '25px',
  },
  barTitle: {
    paddingLeft: '15px',
  },
  logout: {
    position: 'absolute',
    right: '0',
  },
  avatar: {
    margin: '0 15px',
    width: '30px',
    height: '30px',
  },
};

export const NavBar = withStyles(styles)(
  withContext(AppContext)(
    (_NavBar)
  ),
);

export const _testExports = {
  NavBar: withStyles(styles)(_NavBar),
};