import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withStyles, withTheme } from '@material-ui/core/styles';
import { AppContext } from '../main/AppContext';
import { withContext } from 'util/context';
import { extractErrors, formatErrors } from 'util/errors';
import { Grid, Typography, Paper, Button, Tooltip } from '@material-ui/core';
import ListIcon from '@material-ui/icons/List';

import { ProjectOwnerDetails } from 'components/shared/ProjectOwnerDetails';
import { AlertType } from 'components/shared/Alert';
import { Spinner } from 'components/shared/Spinner';

class _AdminProjectOwnersListing extends Component {
  constructor(props) {
    super(props);

    this.state = {
      projectOwners: [],
      isLoading: true,
    };
  }

  async componentDidMount() {
    const { requestWithAlert } = this.props.context.utils;
    const endpoint = '/api/v1/project_owners';
    const response = await requestWithAlert.get(endpoint, { authenticated: true });

    if (response.isSuccessful) {
      const { projectOwners } = await response.json();
      this.setState({ projectOwners });
    }

    if (response.hasError) {
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
        {this.renderProjectOwnerTotalsText()}
        {
          Object.keys(projectOwners).map(key =>
            <div className={classes.card}><ProjectOwnerDetails projectOwner={projectOwners[key]} /></div>
          )
        }
      </Grid>
    );
  }

  renderProjectOwnerTotalsText() {
    const projectOwnerTotalsText =
      `There are a total of ${this.state.projectOwners.length} project owners on the site!`;

    return (
      <React.Fragment>
        <Typography
          variant="subheading"
          style={{ padding: '40px', paddingBottom: '0px' }}
        >
          {projectOwnerTotalsText}
        </Typography>
      </React.Fragment>
    );
  }

  render() {
    if (this.state.isLoading) {
      return (
        <Spinner />
      );
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
                <Tooltip title="Dashboard">
                  <Button
                    variant="fab"
                    color="secondary"
                    aria-label="Add"
                    component={Link}
                    to="/admin/dashboard"
                  >
                    <ListIcon />
                  </Button>
                </Tooltip>
              </div>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            {this.renderProjectOwners()}
          </Grid>
        </Paper>
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
    paddingTop: '15',
    paddingBottom: '15px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
};

export const AdminProjectOwnersListing = withContext(AppContext)(
  withTheme()(withStyles(styles)(_AdminProjectOwnersListing))
);