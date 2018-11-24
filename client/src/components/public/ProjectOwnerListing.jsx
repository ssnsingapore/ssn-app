import React, { Component } from 'react';
import ReactPaginate from 'react-paginate';
import { withStyles, withTheme } from '@material-ui/core/styles';
import { AppContext } from '../main/AppContext';
import { withContext } from 'util/context';
import { extractErrors, formatErrors } from 'util/errors';
import { Grid, Typography, Paper } from '@material-ui/core';

import { ProjectOwnerDetails } from 'components/shared/ProjectOwnerDetails';
import { AlertType } from 'components/shared/Alert';
import { Spinner } from 'components/shared/Spinner';

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
    const projectOwnerTotalsText =
      `There are a total of ${this.state.totalProjectOwners} project owners on the site!`;

    return (
      <Typography
        variant="subheading"
        style={{ padding: '40px', paddingBottom: '10px' }}
      >
        {projectOwnerTotalsText}
      </Typography>
    );
  }

  handlePageClick = (data) => {
    const page = data.selected + 1;
    this.setState({ page }, () => {
      this._fetchProjects();
    });
  };

  renderPagination() {
    const { classes } = this.props;
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '30px' }}>
        <Typography variant="body1">
          <ReactPaginate
            previousLabel='&laquo;'
            breakLabel={'...'}
            nextLabel='&raquo;'
            pageCount={this.state.noPages}
            onPageChange={this.handlePageClick}
            marginPagesDisplayed={1}
            pageRangeDisplayed={2}
            pageClassName={classes.page}
            previousClassName={classes.page}
            nextClassName={classes.page}
            breakClassName={classes.page}
          />
        </Typography>
      </div>
    );
  }

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
            {this.renderPagination()}
            {this.renderProjectOwners()}
          </Grid>
        </Paper >
      </Grid>
    );
  }
}

const styles = theme => ({
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
  page: {
    display: 'inline-block',
    padding: '2px',
    '& a.active': {
      backgroundColor: theme.palette.grey[400],
    },
    '& a': {
      padding: '6px 10px',
      backgroundColor: theme.palette.grey[200],
    },
  },
});

export const ProjectOwnerListing = withContext(AppContext)(
  withTheme()(withStyles(styles)(_ProjectOwnerListing))
);
