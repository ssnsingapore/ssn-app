import React, { Component } from 'react';
import { Typography, Paper, Tabs, Tab } from '@material-ui/core';
import { withStyles, withTheme } from '@material-ui/core/styles';
import qs from 'qs';

import { AppContext } from 'components/main/AppContext';
import { AdminProjectListing } from 'components/admin/AdminProjectListing';
import { AlertType } from 'components/shared/Alert';
import { Spinner } from 'components/shared/Spinner';
import { ProjectStateDisplayMapping } from 'components/shared/display_mappings/ProjectStateDisplayMapping';
import { ProjectState } from 'components/shared/enums/ProjectState';

import { extractErrors, formatErrors } from 'util/errors';
import { withContext } from 'util/context';

export const ProjectTabValueMapping = {
  [ProjectState.PENDING_APPROVAL]: 0,
  [ProjectState.APPROVED_ACTIVE]: 1,
  [ProjectState.APPROVED_INACTIVE]: 2,
  [ProjectState.REJECTED]: 3,
};

export const ProjectStateMapping = {
  0: ProjectState.PENDING_APPROVAL,
  1: ProjectState.APPROVED_ACTIVE,
  2: ProjectState.APPROVED_INACTIVE,
  3: ProjectState.REJECTED,
};
export class _AdminDashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      tabValue: 0,
      counts: {},
    };
  }

  async componentDidMount() {

    const queryString = this.props.location.search.substring(1);
    const queryParams = qs.parse(queryString);
    const projectState = queryParams.projectState || ProjectState.PENDING_APPROVAL;
    this.setState({ tabValue: ProjectTabValueMapping[projectState] });

    const { requestWithAlert } = this.props.context.utils;
    const response = await requestWithAlert.get('/api/v1/project_counts');

    if (response.isSuccessful) {
      const { counts } = await response.json();
      this.setState({ counts });
    }

    if (response.hasError) {
      const { showAlert } = this.props.context.updaters;
      const errors = await extractErrors(response);
      showAlert('getProjectsFailure', AlertType.ERROR, formatErrors(errors));
    }

    this.setState({ isLoading: false });
  }

  handleChange = (_event, value) => {
    this.setState({ tabValue: value });
    this.props.history.push(`?page=1&projectState=${ProjectStateMapping[value]}`);
  };

  getTabLabel = projectState => {
    const { counts } = this.state;
    return counts[projectState] !== undefined
      ? `${ProjectStateDisplayMapping[projectState]} (${counts[projectState]})`
      : ProjectStateDisplayMapping[projectState];
  };

  renderContent = (value, projectState) => {
    const { tabValue, counts } = this.state;

    return (
      tabValue === value &&
      <AdminProjectListing
        projectState={projectState}
        totalProjects={counts[projectState]}
        location={this.props.location}
        history={this.props.history}
      />

    );
  };

  render() {
    if (this.state.isLoading) {
      return <Spinner />;
    }

    const { classes } = this.props;
    const { tabValue } = this.state;

    return (
      <Paper className={classes.root} square>
        <Paper className={classes.tabHeader} square>
          <div className={classes.header}>
            <Typography variant="headline" className={classes.headline}>
              List of Projects
            </Typography>
          </div>
          <Tabs
            value={tabValue}
            onChange={this.handleChange}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label={this.getTabLabel(ProjectState.PENDING_APPROVAL)} />
            <Tab label={this.getTabLabel(ProjectState.APPROVED_ACTIVE)} />
            <Tab label={this.getTabLabel(ProjectState.APPROVED_INACTIVE)} />
            <Tab label={this.getTabLabel(ProjectState.REJECTED)} />
          </Tabs>
        </Paper>
        <div className={classes.tabContainer}>
          {this.renderContent(0, ProjectState.PENDING_APPROVAL)}
          {this.renderContent(1, ProjectState.APPROVED_ACTIVE)}
          {this.renderContent(2, ProjectState.APPROVED_INACTIVE)}
          {this.renderContent(3, ProjectState.REJECTED)}
        </div>
      </Paper>
    );
  }
}

const styles = {
  root: {
    width: '80vw',
    margin: '30px auto',
  },
  headline: {
    marginBottom: '10px',
  },
  tabContainer: {
    marginTop: '35px',
    margin: '35px 30px',
  },
  tabHeader: {
    padding: '30px',
    paddingBottom: '0px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '20px',
    alignItems: 'center',
  },
};

export const AdminDashboard = withContext(AppContext)(
  withTheme()(withStyles(styles)(_AdminDashboard))
);
