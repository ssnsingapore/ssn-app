import React, { Component } from 'react';
import { withStyles, withTheme } from '@material-ui/core/styles';
import { AppContext } from '../main/AppContext';
import { withContext } from 'util/context';
import { extractErrors, formatErrors } from 'util/errors';
import { Grid, Typography, Paper } from '@material-ui/core';
import qs from 'qs';

import { ProjectOwnerDetails } from 'components/shared/ProjectOwnerDetails';
import { AlertType } from 'components/shared/Alert';
import { Spinner } from 'components/shared/Spinner';
import { Pagination } from 'components/shared/Pagination';

const PAGE_SIZE = 20;
class _ProjectOwnerListing extends Component {
  constructor(props) {
    super(props);

    this.state = {
      projectOwners: [],
      isLoading: true,
      totalProjectOwners: 0,
      numPages: 0,
      page: 1,
    };
  }

  componentDidMount() {
    const queryString = this.props.location.search.substring(1);
    const { page } = qs.parse(queryString);
    this.setState({ page: page ? Number(page) : 1 }, this._fetchProjectOwners);
  }

  async _fetchProjectOwners() {
    const { requestWithAlert } = this.props.context.utils;
    const endpoint = `/api/v1/project_owners?pageSize=${PAGE_SIZE}&page=${this.state.page}`;
    const response = await requestWithAlert.get(endpoint);

    if (response.isSuccessful) {
      const { projectOwners, totalProjectOwners } = await response.json();
      const numPages = Math.ceil(totalProjectOwners / PAGE_SIZE);
      this.setState({ projectOwners, totalProjectOwners, numPages });
    } else if (response.hasError) {
      const { showAlert } = this.props.context.updaters;
      const errors = await extractErrors(response);
      showAlert('getProjectsFailure', AlertType.ERROR, formatErrors(errors));
    }
    this.setState({ isLoading: false });
  }


  renderProjectOwners() {
    const { classes } = this.props;
    const { projectOwners } = this.state;
    return (
      <Grid item xs={12}>
        <Grid container>
          {projectOwners.map(projectOwner => (
            <Grid item xs={12} className={classes.card} key={projectOwner.email}>
              <ProjectOwnerDetails
                projectOwner={projectOwner}
                type="list"
              />
            </Grid>
          ))}
        </Grid>
      </Grid >
    );
  }

  renderProjectOwnerTotalsText() {
    return (
      <Typography
        data-testid="total-text"
        variant="subheading"
        style={{ padding: '40px', paddingBottom: '10px' }}
      >
        {`There are a total of ${this.state.totalProjectOwners} project owners on the site.`}
      </Typography>
    );
  }

  handlePageClick = (pageDisplayed) => {
    // page numbers given by react-paginate are zero-indexed
    const page = pageDisplayed.selected ? pageDisplayed.selected + 1 : 1;
    this.setState({ isLoading: true });
    this.setState({ page }, this._fetchProjectOwners);
    this.setState({ isLoading: false });
    this.props.history.push(`?page=${page}`);
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
            {this.state.projectOwners.length > 0 &&
              <Pagination
                numPages={this.state.numPages}
                handlePageClick={this.handlePageClick}
                page={this.state.page - 1}
              />
            }
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
    width: '100%',
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

export const _testExports = {
  ProjectOwnerListing: withStyles({})(_ProjectOwnerListing),
};
