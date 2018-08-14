import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Tabs,
  Tab,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

const TAB_PATHS = [
  'about',
  'todos',
  'image_upload',
];

class _NavBar extends Component {
  constructor(props) {
    super(props);

    const rootPath = props.location.pathname.split('/')[1];

    this.state = {
      value: TAB_PATHS.indexOf(rootPath),
    };
  }

  handleTabChange = (_event, value) => this.setState({ value })

  render() {
    const { classes } = this.props;

    return (
      <AppBar position="static" className={classes.appBar}>
        <Tabs
          value={this.state.value}
          onChange={this.handleTabChange}
          centered
        >
          <Tab
            label="About"
            component={Link}
            to={`/${TAB_PATHS[0]}}`}
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
  appBar: {
    marginBottom: '20px',
  },
};

export const NavBar = withStyles(styles)(_NavBar);
