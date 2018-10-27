import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Button,
} from '@material-ui/core';
import { withStyles, withTheme } from '@material-ui/core/styles';
import { AppContext } from '../main/AppContext';
import { withContext } from 'util/context';
import { extractErrors, formatErrors } from 'util/errors';
import { AlertType } from 'components/shared/Alert';
import { Spinner } from 'components/shared/Spinner';
import { ProjectDeactivateConfirmationDialog } from 'components/shared/ProjectDeactivateConfirmationDialog';
import { ProjectActivateConfirmationDialog } from 'components/shared/ProjectActivateConfirmationDialog';

import { Role } from 'components/shared/enums/Role';
import { ProjectState } from 'components/shared/enums/ProjectState';
import { IssueAddressedDisplayMapping } from 'components/shared/display_mappings/IssueAddressedDisplayMapping';
import { VolunteerRequirementTypeDisplayMapping } from 'components/shared/display_mappings/VolunteerRequirementTypeDisplayMapping';

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

  renderIssuesAddressed = project => {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <Typography variant="body1">Issues addressed:</Typography>
        {project.issuesAddressed.map(issueAddressed => {
          return (
            <Chip
              key={issueAddressed}
              label={IssueAddressedDisplayMapping[issueAddressed]}
              className={classes.chip}
              color="primary"
            />
          );
        })}
      </React.Fragment>
    );
  };

  renderVolunteerRequirements = project => {
    const { classes } = this.props;

    return (
      <React.Fragment>
        <Typography variant="body1">We need:</Typography>
        {project.volunteerRequirements.map(requirement => {
          return (
            <Chip
              key={requirement.type}
              label={VolunteerRequirementTypeDisplayMapping[requirement.type]}
              className={classes.chip}
            />
          );
        })}
      </React.Fragment>
    );
  };

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

  renderRejectionMessage(project, rejectionMessageSize) {
    const { classes } = this.props;
    if (!this._isRejected(project)) {
      return null;
    }
    return (
      <Grid item xs={rejectionMessageSize} className={classes.rejectionMessage}>
        <Typography variant="body2">Rejection comments:</Typography>
        <Typography variant="body1">{project.rejectionReason}</Typography>
      </Grid>
    );
  }

  renderProjectListingCardContent(project) {
    const { classes } = this.props;

    const cardContentSize = this._isRejected(project) ? 8 : 12;
    const rejectionMessageSize =
      cardContentSize === 12 ? false : 12 - cardContentSize;

    return (
      <Grid container key={`${project.title}-main`}>
        <Grid item xs={cardContentSize}>
          <Grid container>
            <Card className={classes.card} square>
              <Grid container key={`${project.title}-cardContent`}>
                <Grid item xs={3}>
                  <CardMedia
                    className={classes.cardMedia}
                    image={project.coverImageUrl}
                  />
                </Grid>
                <Grid item xs={9}>
                  <CardContent className={classes.content}>
                    <Typography variant="headline" gutterBottom>
                      {project.title}
                    </Typography>
                    <Typography
                      variant="subheading"
                      color="textSecondary"
                      gutterBottom
                    >
                      <List className={classes.removePadding}>
                        <ListItem className={classes.removePadding}>
                          <Avatar
                            alt="Profile Photo"
                            src={project.projectOwner.profilePhotoUrl}
                            className={classes.smallAvatar}
                          />
                          <ListItemText
                            className={classes.removePadding}
                            primary={project.projectOwner.name}
                          />
                        </ListItem>
                      </List>
                    </Typography>
                    <div className={classes.tagsContainer}>
                      {this.renderVolunteerRequirements(project)}
                      {this.renderIssuesAddressed(project)}
                    </div>
                  </CardContent>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        </Grid>
        {this.renderRejectionMessage(project, rejectionMessageSize)}
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
    const { classes, dashboardRole } = this.props;
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
                {this.renderProjectListingCardContent(project)}
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
  card: {
    display: 'flex',
    marginBottom: theme.spacing.unit,
    width: '100%',
  },
  content: {
    flex: '1 0 auto',
  },
  cardMedia: {
    width: '100%',
    height: '100%',
    minHeight: '200px',
    backgroundSize: 'cover',
  },
  tagsContainer: {
    marginTop: '30px',
  },
  chip: {
    margin: theme.spacing.unit / 2,
    fontSize: '12px',
    height: '25px',
  },
  smallAvatar: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  removePadding: {
    padding: 0,
  },
  link: {
    textDecoration: 'none',
  },
  button: {
    margin: theme.spacing.unit,
    marginLeft: theme.spacing.unit * 1.5,
    marginRight: theme.spacing.unit * 0.5,
    minWidth: '80px',
  },
  rejectionMessage: {
    padding: '15px',
    textAlign: 'justify',
    wordWrap: 'break-word',
  },
});

export const ProjectListing = withContext(AppContext)(
  withTheme()(withStyles(styles)(_ProjectListing))
);

//set displayName for tests to allow parent components to find component
ProjectListing.displayName = 'ProjectListing';
