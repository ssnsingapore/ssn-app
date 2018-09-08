import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Tabs,
  Tab,
  Toolbar,
  Typography,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

import ssnLogo from 'assets/ssn-logo.png';

const TAB_PATHS = [
  'about',
  'todos',
  'image_upload',
];

class _NavBar extends Component {
  constructor(props) {
    super(props);

    const rootPath = props.location.pathname.split('/')[1];

    const selectedTab = TAB_PATHS.indexOf(rootPath);

    this.state = {
      value: selectedTab === -1 ? false : selectedTab,
    };
  }

  handleTabChange = (_event, value) => this.setState({ value })

  render() {
    const { classes, title } = this.props;

    return (
      <AppBar position="static">
        <Toolbar variang="dense" className={classes.toolBar}>
          <a href="/">
            <img src={ssnLogo} alt="ssn-logo" className={classes.logo} />
          </a>
          <Typography>
            {title}
          </Typography>
          <Tabs
            value={this.state.value}
            onChange={this.handleTabChange}
            centered
          >
            <Tab
              label="About"
              component={Link}
              to={`/${TAB_PATHS[0]}`}
            />
            <Tab
              label="Todos"
              component={Link}
              to={`/${TAB_PATHS[1]}`}
            />
            <Tab
              label="Image Upload"
              component={Link}
              to={`/${TAB_PATHS[2]}`}
            />
          </Tabs>
        </Toolbar>
      </AppBar>
    );
  }
}

_NavBar.propTypes = {
  classes: PropTypes.object,
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }),
};

const styles = {
  toolBar: {
    width: '80vw',
    margin: '0 auto',
    padding: '0',
  },
  logo: {
    height: '25px',
  },
};

export const NavBar = withStyles(styles)(_NavBar);
