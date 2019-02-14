import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import qs from 'qs';
import { Grid, Typography, Button } from '@material-ui/core';
import { withStyles, withTheme } from '@material-ui/core/styles';

import { AppContext } from '../main/AppContext';
import { withContext } from 'util/context';
import { extractErrors, formatErrors } from 'util/errors';
import { AlertType } from 'components/shared/Alert';
import { Spinner } from 'components/shared/Spinner';
import { ProjectDeactivateConfirmationDialog } from 'components/shared/ProjectDeactivateConfirmationDialog';
import { ProjectActivateConfirmationDialog } from 'components/shared/ProjectActivateConfirmationDialog';
import { ProjectListingCard } from 'components/shared/ProjectListingCard';
import { Pagination } from 'components/shared/Pagination';
import { JobScheduleMessage } from 'components/admin/JobScheduleMessage';
import { Role } from 'components/shared/enums/Role';
import { ProjectState } from 'components/shared/enums/ProjectState';
import { ProjectStateDisplayMapping } from 'components/shared/display_mappings/ProjectStateDisplayMapping';

const PAGE_SIZE = 20;
class _AdminProjectListing extends Component {
  constructor(props) {
    super(props);

    this.state = {
      projects: [],
      isLoading: true,
      projectDeactivateConfirmationDialogOpen: false,
      projectActivateConfirmationDialogOpen: false,
      project: null,
      page: 1,
    };
  }

  componentDidMount() {
    if (this.props.location) {
      window.onpopstate = this.updateStateFromQueryParams;
      this.updateStateFromQueryParams();
    } else {
      this._fetchProjects();
    }
  }

  updateStateFromQueryParams = () => {
    const queryString = this.props.location.search.substring(1);
    const queryParams = qs.parse(queryString);

    const page = Number(queryParams.page) || 1;
    const projectState = queryParams.projectState || ProjectState.PENDING_APPROVAL;
    this.setState({ page, projectState }, this._fetchProjects);
  }

  async _fetchProjects() {
    const { requestWithAlert } = this.props.context.utils;
    const { projectState = ProjectState.APPROVED_ACTIVE } = this.props;

    const endpoint = '/api/v1/projects';
    const queryParams = `?pageSize=${PAGE_SIZE}&projectState=${projectState}&page=${this.state.page}`;
    const response = await requestWithAlert.get(endpoint + queryParams, { authenticated: true });

    if (response.isSuccessful) {
      const { projects } = await response.json();
      this.setState({ projects });
    }

    if (response.hasError) {
      const { showAlert } = this.props.context.updaters;
      const errors = await extractErrors(response);
      showAlert('getProjectsFailure', AlertType.ERROR, formatErrors(errors));
    }

    this.setState({ isLoading: false });
  }

  handlePageClick = (pageDisplayed) => {
    const page = pageDisplayed.selected + 1;
    this.setState({ isLoading: true });
    this.setState({ page }, this._fetchProjects);
    this.setState({ isLoading: false });
    this.props.history.push(`?page=${page}&projectState=${this.props.projectState}`);
  };

  handleProjectDeactivateConfirmationDialogOpen = (project) => {
    this.setState({ projectDeactivateConfirmationDialogOpen: true, project });
  };

  handleProjectDeactivateConfirmationDialogClose = () => {
    this.setState({ projectDeactivateConfirmationDialogOpen: false });
  };

  handleProjectActivateConfirmationDialogOpen = (project) => {
    this.setState({ projectActivateConfirmationDialogOpen: true, project });
  };

  handleProjectActivateConfirmationDialogClose = () => {
    this.setState({ projectActivateConfirmationDialogOpen: false });
  };

  _isApprovedActive = (project) => project.state === ProjectState.APPROVED_ACTIVE;
  _isApprovedInactive = (project) => project.state === ProjectState.APPROVED_INACTIVE;
  _isPendingApproval = (project) => project.state === ProjectState.PENDING_APPROVAL;
  _isRejected = (project) => project.state === ProjectState.REJECTED;

  renderButtons(project) {
    const { classes } = this.props;

    return (
      <Grid container style={{ justifyContent: 'center' }}>
        {this._isApprovedActive(project) && (
          <Button
            onClick={() => this.handleProjectDeactivateConfirmationDialogOpen(project)}
            variant="contained"
            className={classes.button}
          >
            Deactivate
          </Button>
        )}
        {this._isApprovedInactive(project) && (
          <Button
            onClick={() => this.handleProjectActivateConfirmationDialogOpen(project)}
            variant="contained"
            className={classes.button}
          >
            Activate
          </Button>
        )}
      </Grid>
    );
  }

  _getContentGridSize = (project) =>
    (this._isApprovedActive(project) || this._isApprovedInactive(project)) ? 10 : 12;

  _getNumPages = () => Math.ceil(this.props.totalProjects / PAGE_SIZE);

  _getProjectStateString = () => {
    const { projectState } = this.props;
    return (
      projectState === 'PENDING_APPROVAL' ?
        ` projects ${ProjectStateDisplayMapping[projectState].toLowerCase()} ` :
        ` ${ProjectStateDisplayMapping[projectState].toLowerCase()} projects `
    );
  };

  renderProjects = () => {
    const { classes, theme, location } = this.props;

    if (this.state.projects.length === 0) {
      return (
        <Typography variant="subtitle1" style={{ color: theme.palette.grey[500] }} >
          There are no {this._getProjectStateString()} at the moment.
        </Typography>
      );
    }

    const currentRoute = location.search ? location.pathname + location.search : location.pathname;

    return this.state.projects.map(project => {
      const contentGridSize = this._getContentGridSize(project);
      const rightColumnGridSize = contentGridSize === 12 ? false : 12 - contentGridSize;

      return (
        <Grid style={{ alignItems: 'center' }} item xs={12} key={project._id}>
          <Grid container>
            <Grid item xs={12} md={contentGridSize}>
              <Link
                to={{
                  pathname: `/admin/projects/${project._id}`,
                  previousRoute: currentRoute,
                }}
                className={classes.link}
              >
                <ProjectListingCard project={project} />
              </Link>
            </Grid>
            <Grid item xs={12} md={rightColumnGridSize} style={{ margin: 'auto' }} >
              {this.renderButtons(project)}
            </Grid>
          </Grid>
        </Grid>
      );
    });
  };

  render() {
    if (this.state.isLoading) {
      return <Spinner />;
    }

    const { theme } = this.props;
    const { project } = this.state;

    return (
      <Grid container spacing={theme.spacing.unit}>
        <ProjectDeactivateConfirmationDialog
          open={this.state.projectDeactivateConfirmationDialogOpen}
          handleClose={this.handleProjectDeactivateConfirmationDialogClose}
          dashboardRole={Role.ADMIN}
          project={project}
        />
        <ProjectActivateConfirmationDialog
          open={this.state.projectActivateConfirmationDialogOpen}
          handleClose={this.handleProjectActivateConfirmationDialogClose}
          dashboardRole={Role.ADMIN}
          project={project}
        />
        <Grid item xs={12}>
          {this.props.projectState === ProjectState.APPROVED_ACTIVE &&
            <JobScheduleMessage />
          }
          {this.state.projects.length > 0 &&
            <Pagination
              numPages={this._getNumPages()}
              handlePageClick={this.handlePageClick}
              page={this.state.page - 1}
            />
          }
          {this.renderProjects()}
        </Grid>
      </Grid>
    );
  }
}

const styles = theme => ({
  link: {
    textDecoration: 'none',
  },
  button: {
    margin: theme.spacing.unit,
    marginLeft: theme.spacing.unit * 1.5,
    marginRight: theme.spacing.unit * 0.5,
    minWidth: '80px',
  },
});

export const AdminProjectListing = withContext(AppContext)(
  withTheme()(withStyles(styles)(_AdminProjectListing))
);

//set displayName for tests to allow parent components to find component
AdminProjectListing.displayName = 'AdminProjectListing';
