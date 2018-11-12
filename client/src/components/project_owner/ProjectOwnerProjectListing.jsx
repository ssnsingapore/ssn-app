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
import { ProjectStateDisplayMapping } from 'components/shared/display_mappings/ProjectStateDisplayMapping';

class _ProjectOwnerProjectListing extends Component {
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
    } = this.props;

    const endpoint = '/api/v1/project_owner/projects';
    const queryParams = `?pageSize=${pageSize}&projectState=${projectState}`;
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

  handleProjectDeactivateConfirmationDialogOpen = (project) => {
    this.setState({
      projectDeactivateConfirmationDialogOpen: true,
      project,
    });
  };

  handleProjectDeactivateConfirmationDialogClose = () => {
    this.setState({ projectDeactivateConfirmationDialogOpen: false });
  };

  handleProjectActivateConfirmationDialogOpen = (project) => {
    this.setState({
      projectActivateConfirmationDialogOpen: true,
      project,
    });
  };

  handleProjectActivateConfirmationDialogClose = () => {
    this.setState({ projectActivateConfirmationDialogOpen: false });
  };

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

  renderButtons(project) {
    const { classes } = this.props;
    return (
      <Grid container style={{ justifyContent: 'center' }}>
        <Button
          variant="contained"
          className={classes.button}
          component={Link}
          to={`/project_owner/projects/${project._id}/edit`}
        >
          Edit
        </Button>
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

  _getContentGridSize(project) {
    let contentGridSize = 12;
    if (this._isPendingApproval(project) || this._isRejected(project)) {
      contentGridSize = 10;
    } else if (this._isApprovedActive(project) || this._isApprovedInactive(project)) {
      contentGridSize = 9;
    }
    return contentGridSize;
  }

  renderProjects = () => {
    const { classes, theme } = this.props;

    if (this.state.projects.length === 0) {
      return (
        <Typography
          variant="subheading"
          style={{ color: theme.palette.grey[500] }}
        >
          There are no
          {this.props.projectState === 'PENDING_APPROVAL'
            ? ` projects ${ProjectStateDisplayMapping[this.props.projectState].toLowerCase()} `
            : ` ${ProjectStateDisplayMapping[this.props.projectState].toLowerCase()} projects `}
          at the moment.
        </Typography>
      );
    }

    return this.state.projects.map(
      project => {
        const linkEndpoint = `/project_owner/projects/${project._id}`;
        const contentGridSize = this._getContentGridSize(project);
        const rightColumnGridSize = contentGridSize === 12 ? false : 12 - contentGridSize;

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
                {this.renderButtons(project)}
              </Grid>
            </Grid>
          </Grid>
        );
      }
    );
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
          dashboardRole={Role.PROJECT_OWNER}
          project={project}
        />
        <ProjectActivateConfirmationDialog
          open={this.state.projectActivateConfirmationDialogOpen}
          handleClose={this.handleProjectActivateConfirmationDialogClose}
          dashboardRole={Role.PROJECT_OWNER}
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

export const ProjectOwnerProjectListing = withContext(AppContext)(
  withTheme()(withStyles(styles)(_ProjectOwnerProjectListing))
);

//set displayName for tests to allow parent components to find component
ProjectOwnerProjectListing.displayName = 'ProjectListing';