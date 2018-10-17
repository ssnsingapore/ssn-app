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
    const { pageSize = 10, projectState = ProjectState.APPROVED_ACTIVE, dashboardRole } = this.props;

    const endpoint = dashboardRole === Role.PROJECT_OWNER ? '/api/v1/project_owner/projects' : '/api/v1/projects';
    const queryParams = '?pageSize='+ pageSize + '&projectState=' + projectState;
    const response = await requestWithAlert.get(endpoint + queryParams, { authenticated: true });

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

  renderRightColumn(dashboardRole, project) {
    const { classes } = this.props;
    if (dashboardRole !== Role.PROJECT_OWNER) {
      return null;
    }
    if (project.state === ProjectState.REJECTED) {
      return (
        <Grid container style={ { flexDirection: 'row' } }>
          <Grid item xs={9}>
            <Typography variant="body1" className={classes.rejectionReason}>
              {project.rejectionReason}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Button variant="contained" className={classes.button}>
          Edit
            </Button>
          </Grid>
        </Grid>
      );
    } else {
      return (
        <React.Fragment>
          <Button variant="contained" className={classes.button}>
            Edit
          </Button>
          <Button variant="contained" className={classes.button}>
            Deactivate
          </Button>
          <Button variant="contained" className={classes.button}>
            Duplicate
          </Button>
        </React.Fragment>
      );
    }
  }

  renderProjects = () => {
    const { classes, dashboardRole } = this.props;
    return this.state.projects.map(project => {

      const linkEndpoint = dashboardRole === Role.ADMIN ? `/admin/projects/${project._id}` : `/projects/${project._id}`;

      return (
        <Grid
          style={{ alignItems: 'center' }}
          item
          xs={12}
          key={project._id}
        >
          <Grid item xs={12}>
            <Link to={linkEndpoint} className={classes.link}>
              <Card className={classes.card} square>
                <Grid container xs={12} key={project.title}>
                  <Grid item xs={12} md={3}>
                    <CardMedia
                      className={classes.cardMedia}
                      image={project.coverImageUrl}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
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
                  <Grid item xs={12} md={5} className={classes.buttonsGroup}>
                    {this.renderRightColumn(dashboardRole, project)}
                  </Grid>
                </Grid>
              </Card>
            </Link>
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
  content: {
    flex: '1 0 auto',
  },
  cardMedia: {
    width: '100%',
    height: '100%',
    minHeight: '150px',
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
    margin: theme.spacing.unit * 2,
  },
  buttonsGroup: {
    // justifyContent: 'flex-end',
    alignContent: 'center',
  },
  rejectionReason: {
    margin: theme.spacing.unit * 2,
  },
});

export const ProjectListing = withContext(AppContext)(
  withTheme()(withStyles(styles)(_ProjectListing))
);
