import React, { Component } from 'react';
import { Typography, Paper } from '@material-ui/core';
import { withStyles, withTheme } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import { AppContext } from 'components/main/AppContext';
import { SearchBar } from 'components/shared/SearchBar';
import { Spinner } from 'components/shared/Spinner';
import { ProjectListing } from 'components/shared/ProjectListing';
import { ProjectStateDisplayMapping } from 'components/shared/display_mappings/ProjectStateDisplayMapping';
import { extractErrors, formatErrors } from 'util/errors';
import { AlertType } from 'components/shared/Alert';
import { ProjectState } from 'components/shared/enums/ProjectState';
import { withContext } from 'util/context';

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
      isLoading: true,
      value: 0,
    };
  }

  async componentDidMount() {
    const { requestWithAlert } = this.props.context.utils;
    const response = await requestWithAlert.get('/api/v1/project_counts');

    if (response.isSuccessful) {
      const counts = (await response.json()).counts;
      this.setState({ counts });
    }

    if (response.hasError) {
      const { showAlert } = this.props.context.updaters;
      const errors = await extractErrors(response);
      showAlert('getProjectsFailure', AlertType.ERROR, formatErrors(errors));
    }

    this.setState({ isLoading: false });
  }
  
  handleChange = (event, value) => {
    this.setState({ value });
  };

  getTabLabel = (projectState) => {
    const { counts } = this.state;
    return `${ProjectStateDisplayMapping[projectState]} (${counts[projectState]})`;
  }

  renderProjectListings = () => {
    const { value } = this.state;
    const { classes } = this.props;

    if (this.state.isLoading) {
      return <Spinner />;
    }

    // Tutorial from https://material-ui.com/demos/tabs/
    return (
      <Paper className={classes.body} square>
        <Paper square>
          <Typography variant='headline' className={classes.title}>List of projects</Typography>
          <Tabs
            value={value}
            onChange={this.handleChange}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label={this.getTabLabel(ProjectState.APPROVED_ACTIVE)} />
            <Tab label={this.getTabLabel(ProjectState.APPROVED_INACTIVE)} />
          </Tabs>
        </Paper>
        <Paper className={classes.innerbox}>
          {value === 0 && <TabContainer><ProjectListing projectState={ProjectState.APPROVED_ACTIVE}/></TabContainer>}
          {value === 1 && <TabContainer><ProjectListing projectState={ProjectState.APPROVED_INACTIVE}/></TabContainer>}
        </Paper>
      </Paper>
    );
  };

  render() {
    return (
      <div>
        <SearchBar />
        {this.renderProjectListings()}
      </div>
    );
  }
}

const styles = theme => ({
  landingHeader: {
    textTransform: 'uppercase',
  },
  title: {
    padding: '30px',
  },
  body: {
    width: '85%',
    margin: '0 auto',
    marginTop: '20px',
  },
  innerbox: {
    marginTop: '1px',
  },
});

export const Projects = withContext(AppContext)(
  withTheme()(
    withStyles(styles)
    (_Projects)));