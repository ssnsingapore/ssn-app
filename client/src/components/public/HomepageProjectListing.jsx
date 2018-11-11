import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Grid, Typography, Button } from '@material-ui/core';
import { withStyles, withTheme } from '@material-ui/core/styles';
import { AppContext } from '../main/AppContext';
import { withContext } from 'util/context';
import { extractErrors, formatErrors } from 'util/errors';
import { AlertType } from 'components/shared/Alert';
import { Spinner } from 'components/shared/Spinner';
import { ProjectListingCard } from 'components/shared/ProjectListingCard';
import { ProjectState } from 'components/shared/enums/ProjectState';

class _HomepageProjectListing extends Component {
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
    const endpoint = '/api/v1/projects';
    const queryParams = `?pageSize=3&projectState=${ProjectState.APPROVED_ACTIVE}`;
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

  renderProjects = () => {
    const { classes, theme } = this.props;

    if (this.state.projects.length === 0) {
      return (
        <Typography
          variant="subheading"
          style={{ color: theme.palette.grey[500], margin: '30px' }}
        >
          There are no projects at the moment.
        </Typography>
      );
    }

    return this.state.projects.map(project => {
      const linkEndpoint = `/projects/${project._id}`;

      return (
        <Grid style={{ alignItems: 'center' }} item xs={12} key={project._id}>
          <Link to={linkEndpoint} className={classes.link}>
            <ProjectListingCard project={project} />
          </Link>
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
        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          component={Link}
          to="/projects"
        >
          View All Projects
        </Button>
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

export const HomepageProjectListing = withContext(AppContext)(
  withTheme()(withStyles(styles)(_HomepageProjectListing))
);

//set displayName for tests to allow parent components to find component
HomepageProjectListing.displayName = 'ProjectListing';
