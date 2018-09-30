import React, { Component } from 'react';
import { Typography, Paper } from '@material-ui/core';
import { withStyles, withTheme } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import { SearchBar } from 'components/shared/SearchBar';
import { ProjectListing } from 'components/shared/ProjectListing';

function TabContainer(props) {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  );
}

class _Projects extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: 0,
    };
  }

  handleChange = (event, value) => {
    this.setState({ value });
  };

  renderSearchBar = () => {
    return (
      <React.Fragment>
        <SearchBar />
      </React.Fragment>
    );
  };

  renderProjectListings = () => {
    const { value } = this.state;
    const { classes } = this.props;

    // Tutorial from https://material-ui.com/demos/tabs/
    return (
      <div className={classes.tabs}>
        <Paper className={classes.body} square='false'>
          <Paper square='false'>
            <Typography variant='headline' className={classes.title}>List of projects</Typography>
            <Tabs
              value={value}
              onChange={this.handleChange}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="Active projects" />
              <Tab label="Past projects" />
            </Tabs>
          </Paper>
          <Paper className={classes.innerbox}>
            {value === 0 && <TabContainer><ProjectListing projectState={'APPROVED_ACTIVE'}/></TabContainer>}
            {value === 1 && <TabContainer><ProjectListing projectState={'APPROVED_INACTIVE'}/></TabContainer>}</Paper></Paper>
      </div>
    );
  };

  render() {
    return (
      <div>
        {this.renderSearchBar()}
        {this.renderProjectListings()}
      </div>
    );
  }
}

const styles = theme => ({
  landingHeader: {
    textTransform: 'uppercase',
  },
  tabs: {
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    padding: '30px',
  },
  body: {
    width: '85%',
  },
  innerbox: {
    marginTop: '1px',
  },
});

export const Projects = withTheme()(withStyles(styles)(_Projects));
