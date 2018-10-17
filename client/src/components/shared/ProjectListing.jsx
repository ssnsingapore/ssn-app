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

import { Role } from 'components/shared/enums/Role';

const ProjectState = {
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED_ACTIVE: 'APPROVED_ACTIVE',
  APPROVED_INACTIVE: 'APPROVED_INACTIVE',
  REJECTED: 'REJECTED',
};

class _ProjectListing extends Component {
  constructor(props) {
    super(props);

    this.state = {
      projects: [],
      isLoading: true,
    };
  }

  async componentDidMount() {
    const { requestWithAlert } = this.props.context.utils;
<<<<<<< c4f1c28a107486b443401b0f96ab8ec706e6c17b
    const {
      pageSize = 10,
      projectState = ProjectState.APPROVED_ACTIVE,
    } = this.props;

    const endpoint = this.props.isForProjectOwner
      ? '/api/v1/project_owner/projects'
      : '/api/v1/projects';
    const queryParams =
      '?pageSize=' + pageSize + '&projectState=' + projectState;
    const response = await requestWithAlert.get(endpoint + queryParams, {
      authenticated: true,
    });
=======
    const { pageSize = 10, projectState = ProjectState.APPROVED_ACTIVE, dashboardRole } = this.props;

    const endpoint = dashboardRole === Role.PROJECT_OWNER ? '/api/v1/project_owner/projects' : '/api/v1/projects';
    const queryParams = '?pageSize='+ pageSize + '&projectState=' + projectState;
    const response = await requestWithAlert.get(endpoint + queryParams, { authenticated: true });
>>>>>>> [SSN-41][JQ/ES] Change project listing props to role.

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
              label={issueAddressed}
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
        {project.volunteerRequirements.map(data => {
          return (
            <Chip key={data.type} label={data.type} className={classes.chip} />
          );
        })}
      </React.Fragment>
    );
  };

  renderActionButtons(dashboardRole) {
    const { classes } = this.props;
    if (dashboardRole !== Role.PROJECT_OWNER) {
      return null;
    }
    return (
      <Grid container style={{ justifyContent: 'space-evenly' }}>
        <Button variant="contained" className={classes.button}>
          Edit
        </Button>
        <Button variant="contained" className={classes.button}>
          Deactivate
        </Button>
        <Button variant="contained" className={classes.button}>
          Duplicate
        </Button>
      </Grid>
    );
  }

  renderProjects = () => {
    const { classes, dashboardRole } = this.props;
    const gridSize = dashboardRole === Role.PROJECT_OWNER ? 8 : 12;

    return this.state.projects.map(project => {

      const linkEndpoint = dashboardRole === Role.ADMIN ? `/admin/projects/${project._id}` : `/projects/${project._id}`;

      return (
        <Grid
          container
          style={{ alignItems: 'center' }}
          item
          xs={12}
          key={project._id}
        >
          <Grid item xs={gridSize}>
            <Link to={linkEndpoint} className={classes.link}>
              <Card className={classes.card}>
                <Grid container item xs={12} key={project.title}>
                  <Grid item xs={12} md={4}>
                    <CardMedia
                      className={classes.cardMedia}
                      image={project.coverImageUrl}
                    />
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <div className={classes.details}>
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
                    </div>
                  </Grid>
                </Grid>
              </Card>
            </Link>
          </Grid>
          <Grid item xs={4}>
            {this.renderActionButtons(dashboardRole)}
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
    return (
      <Grid container spacing={theme.spacing.unit}>
        {this.renderProjects()}
      </Grid>
    );
  }
}

const styles = theme => ({
  card: {
    display: 'flex',
    marginBottom: theme.spacing.unit,
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
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
  alignBottom: {},
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
  },
});

export const ProjectListing = withContext(AppContext)(
  withTheme()(withStyles(styles)(_ProjectListing))
);
