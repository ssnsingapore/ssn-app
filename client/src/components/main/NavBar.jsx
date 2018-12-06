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
import {
  ArrowDropDown as ArrowDropDownIcon,
  Group as GroupIcon,
} from '@material-ui/icons';

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
      isLoading: false,
    };
  }

  handleClick = event => this.setState({ anchorEl: event.currentTarget });
  handleClose = () => this.setState({ anchorEl: null });

  renderNavbarText = (pathname) => {
    const { isAuthenticated } = this.props.context;
    const { authenticator } = this.props.context.utils;
    const currentUser = authenticator.getCurrentUser();

    if (!isAuthenticated || !currentUser) {
      return null;
    }

    const isProjectOwnerPath = currentUser.role === Role.PROJECT_OWNER && pathname.includes('/project_owner/');
    const isAdminPath = currentUser.role === Role.ADMIN && pathname.includes('/admin/');
    return (isProjectOwnerPath || isAdminPath) && (
      <Typography variant="body2" color="inherit" style={{ paddingLeft: '15px' }}>
        {NavBarDisplayMapping[currentUser.role]}
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

    this.setState({ isLoading: true });
    const response = currentUser.role === Role.PROJECT_OWNER ?
      await authenticator.logoutProjectOwner() : await authenticator.logoutAdmin();

    if (response.isSuccessful) {
      showAlert('logoutSuccess', AlertType.SUCCESS, LOGOUT_SUCCESS_MESSAGE);
    } else if (response.hasError) {
      showAlert('logoutFailure', AlertType.ERROR, LOGOUT_FAILURE_MESSAGE);
    }
    this.setState({ isLoading: false, anchorEl: null });
  }

  renderRightNavbar = () => {
    const { classes } = this.props;
    const { isAuthenticated } = this.props.context;
    const { authenticator } = this.props.context.utils;
    const currentUser = authenticator.getCurrentUser();
    const isProjectPath = this.props.location.pathname === '/projects';
    const isProjectOwnersPath = this.props.location.pathname === '/project_owners';

    if (!isAuthenticated || !currentUser) {
      return (
        <React.Fragment>
          <Button
            variant="flat"
            component={Link}
            to={isProjectPath ? '/project_owners' : '/projects'}
          >
            <Typography variant="body2" color="inherit" style={{ color: 'white' }}>
              {isProjectPath ? 'View Project Owners' : 'View Projects'}
            </Typography>
          </Button>
        </React.Fragment>
      );
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
          <MenuItem
            component={Link}
            to={'/project_owners'}
            onClick={this.handleClose}
            disabled={this.state.isLoading || isProjectOwnersPath}>
            <GroupIcon style={{ paddingRight: 10 }} /> View Project Owners
          </MenuItem>
          {
            currentUser.role === Role.PROJECT_OWNER &&
            <MenuItem
              component={Link}
              to={'/project_owner/edit_profile'}
              onClick={this.handleClose}
              disabled={this.state.isLoading}>
              <EditIcon style={{ paddingRight: 10 }} /> Edit Profile
            </MenuItem>
          }
          <MenuItem
            onClick={() => this.handleLogout(currentUser)}
            disabled={this.state.isLoading}>
            <ExitToAppIcon style={{ paddingRight: 10 }} /> Logout
          </MenuItem>
        </Menu>
      </React.Fragment>
    );
  }

  renderLeftNavbar() {
    const { classes } = this.props;
    return (
      <div className={classes.leftNavBar}>
        <Button component={Link} to={this.getLink()} disabled={this.state.isLoading} >
          <img src={ssnLogo} alt="ssn-logo" className={classes.logo} />
        </Button>
        {this.renderNavbarText(this.props.location.pathname)}
      </div>

    );
  }

  render() {
    const { classes } = this.props;

    return this.props.location.pathname !== '/admin' && (
      <AppBar position="static">
        <Toolbar variant="dense" className={classes.toolBar}>
          {this.renderLeftNavbar()}
          {this.renderRightNavbar()}
        </Toolbar>
      </AppBar>
    );
  }
}

const styles = {
  toolBar: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '80vw',
    margin: '0 auto',
    padding: '0',
  },
  logo: {
    height: '25px',
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
  leftNavBar: {
    display: 'flex',
    justifyContent: 'flexStart',
    alignItems: 'center',
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