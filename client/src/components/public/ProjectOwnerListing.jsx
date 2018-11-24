import React, { Component } from 'react';
import { withStyles, withTheme } from '@material-ui/core/styles';
import { AppContext } from '../main/AppContext';
import { withContext } from 'util/context';
import { extractErrors, formatErrors } from 'util/errors';
import { Grid, Typography, Paper } from '@material-ui/core';

import { ProjectOwnerDetails } from 'components/shared/ProjectOwnerDetails';
import { AlertType } from 'components/shared/Alert';
import { Spinner } from 'components/shared/Spinner';
import { Pagination } from 'components/shared/Pagination';

const pageSize = 10;
class _ProjectOwnerListing extends Component {
  constructor(props) {
    super(props);

    this.state = {
      projectOwners: [],
      isLoading: true,
      totalProjectOwners: 0,
      noPages: 0,
      page: 1,
    };
  }

  async _fetchProjects() {
    const { requestWithAlert } = this.props.context.utils;
    const endpoint = `/api/v1/project_owners?pageSize=${pageSize}&page=${this.state.page}`;
    const response = await requestWithAlert.get(endpoint, { authenticated: true });

    if (response.isSuccessful) {
      const { projectOwners, totalProjectOwners } = await response.json();
      const noPages = Math.ceil(totalProjectOwners / pageSize);
      this.setState({ projectOwners, totalProjectOwners, noPages });
    } else if (response.hasError) {
      const { showAlert } = this.props.context.updaters;
      const errors = await extractErrors(response);
      showAlert('getProjectsFailure', AlertType.ERROR, formatErrors(errors));
    }
    this.setState({ isLoading: false });

  }

  componentDidMount() {
    this._fetchProjects();
  }

  renderProjectOwners() {
    const { classes } = this.props;
    const { projectOwners } = this.state;
    return (
      <Grid item xs={12}>
        <Grid container>
          {Object.keys(projectOwners).map(key => (
            <Grid item xs={12} className={classes.card}>
              <ProjectOwnerDetails
                projectOwner={projectOwners[key]}
                type="list"
              />
            </Grid>
          ))}
        </Grid>
      </Grid>
    );
  }

  renderProjectOwnerTotalsText() {
    return (
      <Typography
        variant="subheading"
        style={{ padding: '40px', paddingBottom: '10px' }}
      >
        {`There are a total of ${this.state.totalProjectOwners} project owners on the site!`}
      </Typography>
    );
  }

  handlePageClick = (pageDisplayed) => {
    const page = pageDisplayed.selected + 1;
    this.setState({ isLoading: true });
    this.setState({ page }, () => this._fetchProjects());
    this.setState({ isLoading: false });
  };

  render() {
    if (this.state.isLoading) {
      return <Spinner />;
    }

    const { classes, theme } = this.props;
    return (
      <Grid container spacing={theme.spacing.unit} className={classes.root}>
        <Paper className={classes.projectListingContainer} square>
          <Grid item xs={12}>
            <Paper className={classes.headerPaper} square>
              <div className={classes.header}>
                <Typography variant="headline">
                  List of Project Owners
                </Typography>
              </div>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            {this.renderProjectOwnerTotalsText()}
            <Pagination
              noPages={this.state.noPages}
              handlePageClick={this.handlePageClick}
            />
            {this.renderProjectOwners()}
          </Grid>
        </Paper >
      </Grid>
    );
  }
}

const styles = {
  root: {
    width: '80vw',
    margin: '0 auto',
    padding: '30px 0',
  },
  headerPaper: {
    padding: '35px',
    width: '100%',
  },
  projectListingContainer: {
    margin: '0px',
    padding: '0px',
    paddingBottom: '30px',
  },
  card: {
    padding: '30px',
    paddingTop: '5px',
    paddingBottom: '5px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
};

export const ProjectOwnerListing = withContext(AppContext)(
  withTheme()(withStyles(styles)(_ProjectOwnerListing))
);
