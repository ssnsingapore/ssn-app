import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withStyles, withTheme } from '@material-ui/core/styles';
import qs from 'qs';

import { AppContext } from '../main/AppContext';
import { withContext } from 'util/context';
import { Paper, Typography, Grid, Tabs, Tab, Fab } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

import { ProjectOwnerProjectListing } from 'components/project_owner/ProjectOwnerProjectListing';
import { ProjectState } from 'components/shared/enums/ProjectState';
import { ProjectOwnerDetails } from 'components/shared/ProjectOwnerDetails';
import { ProjectStateDisplayMapping } from 'components/shared/display_mappings/ProjectStateDisplayMapping';
import { AlertType } from 'components/shared/Alert';
import { Spinner } from 'components/shared/Spinner';
import { extractErrors, formatErrors } from 'util/errors';
import { ProjectTabValueMapping, ProjectStateMapping } from 'components/admin/AdminDashboard';

class _ProjectOwnerDashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      tabValue: 0,
      counts: {},
    };
  }

  async componentDidMount() {
    // Update state from query params when user presses back
    // to ensure that when the user goes back
    // and the projectState query param changes to the previous one
    // the tabValue will be updated accordingly
    this.updateProjectStateFromQueryParams();

    const { requestWithAlert } = this.props.context.utils;
    const response = await requestWithAlert.get('/api/v1/project_owner/project_counts', { authenticated: true });

    if (response.isSuccessful) {
      const { counts } = await response.json();
      this.setState({ counts });
    }

    if (response.hasError) {
      const { showAlert } = this.props.context.updaters;
      const errors = await extractErrors(response);
      showAlert('getProjectCountsFailure', AlertType.ERROR, formatErrors(errors));
    }

    this.setState({ isLoading: false });
  }

  updateProjectStateFromQueryParams = () => {
    const queryString = this.props.location.search.substring(1);
    const queryParams = qs.parse(queryString);
    const projectState = queryParams.projectState || ProjectState.PENDING_APPROVAL;
    this.setState({ tabValue: ProjectTabValueMapping[projectState] });
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

  renderTabs() {
    const { tabValue } = this.state;
    return (
      <React.Fragment>
        <Tabs
          value={tabValue}
          indicatorColor="primary"
          textColor="primary"
          onChange={this.handleChange}
        >
          <Tab label={this.getTabLabel(ProjectState.PENDING_APPROVAL)} />
          <Tab label={this.getTabLabel(ProjectState.APPROVED_ACTIVE)} />
          <Tab label={this.getTabLabel(ProjectState.APPROVED_INACTIVE)} />
          <Tab label={this.getTabLabel(ProjectState.REJECTED)} />
        </Tabs>
      </React.Fragment>
    );
  }

  renderContent = (value, projectState) => {
    const { tabValue, counts } = this.state;
    return tabValue === value &&
      <ProjectOwnerProjectListing
        updateProjectStateFromQueryParams={this.updateProjectStateFromQueryParams}
        projectState={projectState}
        totalProjects={counts[projectState]}
        location={this.props.location}
        history={this.props.history}
      />;
  };

  renderProjectListing() {
    const { classes } = this.props;

    return (
      <Paper square className={classes.projectListing}>
        {this.renderContent(0, ProjectState.PENDING_APPROVAL)}
        {this.renderContent(1, ProjectState.APPROVED_ACTIVE)}
        {this.renderContent(2, ProjectState.APPROVED_INACTIVE)}
        {this.renderContent(3, ProjectState.REJECTED)}
      </Paper>
    );
  }

  render() {
    if (this.state.isLoading) {
      return <Spinner />;
    }

    const { classes, theme } = this.props;
    return (
      <Grid container spacing={theme.spacing.unit} className={classes.root}>
        <Grid item xs={12}>
          <Paper
            className={classes.projectListingContainer}
            elevation={1}
            square
          >
            <div className={classes.header}>
              <Typography
                variant="h5"
                style={{ marginBottom: theme.spacing.unit * 3 }}
              >
                My Projects
              </Typography>
              <Fab
                color="secondary"
                aria-label="Add"
                component={Link}
                to="/project_owner/projects/new"
              >
                <AddIcon />
              </Fab>
            </div>
            {this.renderTabs()}
          </Paper>
          {this.renderProjectListing()}
        </Grid>
        <Grid item xs={12}>
          <ProjectOwnerDetails />
        </Grid>
      </Grid>
    );
  }
}

const styles = () => ({
  root: {
    width: '80vw',
    margin: '0 auto',
    padding: '60px 0',
  },
  projectListingContainer: {
    margin: '0 auto 10px',
    padding: '40px',
    paddingBottom: '0px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '20px',
  },
  projectListing: {
    margin: '5px auto',
    padding: '40px',
  },
});

export const ProjectOwnerDashboard = withContext(AppContext)(
  withTheme()(withStyles(styles)(_ProjectOwnerDashboard))
);

export const _testExports = {
  ProjectOwnerDashboard: _ProjectOwnerDashboard,
};
