// this component should eventually be deleted

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
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

import { Role } from 'components/shared/enums/Role';
import { ProjectState } from 'components/shared/enums/ProjectState';
import { ProjectStateDisplayMapping } from './display_mappings/ProjectStateDisplayMapping';

class _ProjectListing extends Component {
  constructor(props) {
    super(props);

    this.state = {
      projects: [],
      isLoading: true,
      projectDeactivateConfirmationDialogOpen: false,
      projectActivateConfirmationDialogOpen: false,
      project: {},
    };
  }

  async componentDidMount() {
    const { requestWithAlert } = this.props.context.utils;
    const {
      pageSize = 10,
      projectState = ProjectState.APPROVED_ACTIVE,
      dashboardRole,
    } = this.props;

    const endpoint =
      dashboardRole === Role.PROJECT_OWNER
        ? '/api/v1/project_owner/projects'
        : '/api/v1/projects';
    const queryParams =
      '?pageSize=' + pageSize + '&projectState=' + projectState;
    const response = await requestWithAlert.get(endpoint + queryParams, {
      authenticated: true,
    });

    if (response.isSuccessful) {
      const projects = (await response.json()).projects;
      this.setState({ projects });
    }

    if (response.hasError) {
      const { showAlert } = this.props.context.updaters;
      const errors = await extractErrors(response);
      showAlert('getProjectsFailure', AlertType.ERROR, formatErrors(errors));
    }

    this.setState({ isLoading: false });
  }

  handleProjectDeactivateConfirmationDialogOpen = (dashboardRole, project) => {
    this.setState({
      projectDeactivateConfirmationDialogOpen: true,
      project,
    });
  };

  handleProjectDeactivateConfirmationDialogClose = () => {
    this.setState({ projectDeactivateConfirmationDialogOpen: false });
  };

  handleProjectActivateConfirmationDialogOpen = (dashboardRole, project) => {
    this.setState({
      projectActivateConfirmationDialogOpen: true,
      project,
    });
  };

  handleProjectActivateConfirmationDialogClose = () => {
    this.setState({ projectActivateConfirmationDialogOpen: false });
  };

  _isAdmin(dashboardRole) {
    return dashboardRole === Role.ADMIN;
  }

  _isProjectOwner(dashboardRole) {
    return dashboardRole === Role.PROJECT_OWNER;
  }

  _isApprovedActive(project) {
    return project.state === ProjectState.APPROVED_ACTIVE;
  }

  _isApprovedInactive(project) {
    return project.state === ProjectState.APPROVED_INACTIVE;
  }

  _isPendingApproval(project) {
    return project.state === ProjectState.PENDING_APPROVAL;
  }

  _isRejected(project) {
    return project.state === ProjectState.REJECTED;
  }

  renderButtons(dashboardRole, project) {
    const { classes } = this.props;

    if (
      !(
        (this._isAdmin(dashboardRole) && this._isApprovedActive(project)) ||
        (this._isAdmin(dashboardRole) && this._isApprovedInactive(project)) ||
        this._isProjectOwner(dashboardRole)
      )
    ) {
      return null;
    }
    return (
      <Grid container style={{ justifyContent: 'center' }}>
        {this._isProjectOwner(dashboardRole) && (
          <Button
            variant="contained"
            className={classes.button}
            component={Link}
            to={`/project_owner/projects/${project._id}/edit`}
          >
            Edit
          </Button>
        )}
        {this._isApprovedActive(project) && (
          <Button
            onClick={() =>
              this.handleProjectDeactivateConfirmationDialogOpen(
                dashboardRole,
                project
              )
            }
            variant="contained"
            className={classes.button}
          >
            Deactivate
          </Button>
        )}
        {this._isApprovedInactive(project) && (
          <Button
            onClick={() =>
              this.handleProjectActivateConfirmationDialogOpen(
                dashboardRole,
                project
              )
            }
            variant="contained"
            className={classes.button}
          >
            Activate
          </Button>
        )}
      </Grid>
    );
  }

  _getContentGridSize(dashboardRole, project) {
    let contentGridSize = 12;
    if (
      (this._isProjectOwner(dashboardRole) && this._isRejected(project)) ||
      (this._isProjectOwner(dashboardRole) &&
        this._isPendingApproval(project)) ||
      (this._isAdmin(dashboardRole) && this._isApprovedActive(project)) ||
      (this._isAdmin(dashboardRole) && this._isApprovedInactive(project))
    ) {
      contentGridSize = 10;
    } else if (
      (this._isProjectOwner(dashboardRole) &&
        this._isApprovedActive(project)) ||
      (this._isProjectOwner(dashboardRole) && this._isApprovedInactive(project))
    ) {
      contentGridSize = 9;
    }
    return contentGridSize;
  }

  _getLinkEndpoint(dashboardRole, project) {
    let linkEndpoint = '';
    switch (dashboardRole) {
    case Role.ADMIN:
      linkEndpoint = `/admin/projects/${project._id}`;
      break;
    case Role.PROJECT_OWNER:
      linkEndpoint = `/project_owner/projects/${project._id}`;
      break;
    default:
      linkEndpoint = `/projects/${project._id}`;
    }
    return linkEndpoint;
  }

  renderProjects = () => {
    const { classes, theme, dashboardRole } = this.props;

    if (this.state.projects.length === 0) {
      return (
        <Typography
          variant="subheading"
          style={{ color: theme.palette.grey[500] }}
        >
          There are no
          {this.props.projectState === 'PENDING_APPROVAL'
            ? ` projects ${ProjectStateDisplayMapping[
              this.props.projectState
            ].toLowerCase()} `
            : ` ${ProjectStateDisplayMapping[
              this.props.projectState
            ].toLowerCase()} projects `}
          at the moment.
        </Typography>
      );
    }

    return this.state.projects.map(project => {
      const linkEndpoint = this._getLinkEndpoint(dashboardRole, project);

      const contentGridSize = this._getContentGridSize(dashboardRole, project);
      const rightColumnGridSize =
        contentGridSize === 12 ? false : 12 - contentGridSize;

      return (
        <Grid style={{ alignItems: 'center' }} item xs={12} key={project._id}>
          <Grid container>
            <Grid item xs={12} md={contentGridSize}>
              <Link to={linkEndpoint} className={classes.link}>
                <ProjectListingCard project={project} />
              </Link>
            </Grid>
            <Grid
              item
              xs={12}
              md={rightColumnGridSize}
              style={{ margin: 'auto' }}
            >
              {this.renderButtons(dashboardRole, project)}
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

    const { theme, dashboardRole } = this.props;
    const { project } = this.state;

    return (
      <Grid container spacing={theme.spacing.unit}>
        <ProjectDeactivateConfirmationDialog
          open={this.state.projectDeactivateConfirmationDialogOpen}
          handleClose={this.handleProjectDeactivateConfirmationDialogClose}
          dashboardRole={dashboardRole}
          project={project}
        />
        <ProjectActivateConfirmationDialog
          open={this.state.projectActivateConfirmationDialogOpen}
          handleClose={this.handleProjectActivateConfirmationDialogClose}
          dashboardRole={dashboardRole}
          project={project}
        />

        {this.renderProjects()}
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

export const ProjectListing = withContext(AppContext)(
  withTheme()(withStyles(styles)(_ProjectListing))
);

//set displayName for tests to allow parent components to find component
ProjectListing.displayName = 'ProjectListing';
