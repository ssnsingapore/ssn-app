import React, { Component } from 'react';
import { Grid, Typography, Card, CardContent, CardMedia, Chip } from '@material-ui/core';
import { withStyles, withTheme } from '@material-ui/core/styles';
import { AppContext } from './main/AppContext';
import { withContext } from 'util/context';
import { extractErrors, formatErrors } from 'util/errors';
import { AlertType } from 'components/shared/Alert';
import { Spinner } from 'components/shared/Spinner';

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
    const response = await requestWithAlert
      .get('/api/v1/projects');

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

  renderIssuesAddressed = (project) => {
    const { classes } = this.props;

    return (
      <React.Fragment>
        <Typography variant="body1" >
          Issues addressed:
        </Typography>
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
  }

  renderVolunteerRequirements = (project) => {
    const { classes } = this.props;

    return (
      <React.Fragment>
        <Typography variant="body1">
          We need:
        </Typography>
        {project.volunteerRequirements.map(data => {
          return (
            <Chip
              key={data.type}
              label={data.type}
              className={classes.chip}
            />
          );
        })}
      </React.Fragment>
    );
  }

  renderProjects = () => {
    const { classes } = this.props;

    return this.state.projects.map((project) => {
      return (
        <Grid item xs={12} key={project.title}>
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
                    <Typography variant="headline" gutterBottom>{project.title}</Typography>
                    <Typography variant="subheading" color="textSecondary" gutterBottom>
                      {project.projectOwner.name}
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
        </Grid>
      );
    });
  }

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
  alignBottom: {
  },
});

export const ProjectListing =
  withContext(AppContext)(
    withTheme()(
      withStyles(styles)(_ProjectListing)
    ));
