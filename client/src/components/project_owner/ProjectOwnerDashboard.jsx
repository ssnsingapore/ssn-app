import React, { Component } from 'react';
import { withStyles, withTheme } from '@material-ui/core/styles';
import { AppContext } from '../main/AppContext';
import { withContext } from 'util/context';
import {
  Paper,
  Typography,
  Grid,
  Tabs,
  Tab,
  Button,
  List,
  ListItem,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

import { ProjectListing } from 'components/shared/ProjectListing';
import { ProjectState } from 'components/shared/enums/ProjectState';
import { ProjectOwnerDetails } from 'components/shared/ProjectOwnerDetails';
import { ProjectStateDisplayMapping } from 'components/shared/display_mappings/ProjectStateDisplayMapping';
import { AlertType } from 'components/shared/Alert';
import { extractErrors, formatErrors } from 'util/errors';

class _ProjectOwnerDashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      tabValue: 0,
      counts: {},
    };
  }

  async componentDidMount() {
    const { requestWithAlert } = this.props.context.utils;
    const response = await requestWithAlert.get('/api/v1/project_counts');

    if (response.isSuccessful) {
      const counts = (await response.json()).counts;
      this.setState({ counts });
    }

    if (response.hasError) {
      const { showAlert } = this.props.context.updaters;
      const errors = await extractErrors(response);
      showAlert('getProjectsFailure', AlertType.ERROR, formatErrors(errors));
    }

    this.setState({ isLoading: false });
  }

  handleChange = (_event, value) => {
    this.setState({ tabValue: value });
  };

  getTabLabel = projectState => {
    const { counts } = this.state;
    return `${ProjectStateDisplayMapping[projectState]} (${
      counts[projectState]
    })`;
  };

  renderButtons() {
    const { classes } = this.props;

    return (
      <Grid item md={4} xs={12}>
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

  renderTabs() {
    const { classes, theme } = this.props;
    const { tabValue } = this.state;

    return (
      <React.Fragment>
        <Tabs
          value={tabValue}
          indicatorColor="primary"
          textColor="primary"
          onChange={this.handleChange}
        >
          <Tab label={this.getTabLabel(ProjectState.PENDING_APPROVAL)} />
          <Tab label={this.getTabLabel(ProjectState.APPROVED_ACTIVE)} />
          <Tab label={this.getTabLabel(ProjectState.APPROVED_INACTIVE)} />
          <Tab label={this.getTabLabel(ProjectState.REJECTED)} />
        </Tabs>

        <Grid
          container
          spacing={4 * theme.spacing.unit}
          className={classes.projectListing}
        >
          <Grid container spacing={4 * theme.spacing.unit}>
            <Grid item md={8} xs={12}>
              {tabValue === 0 && (
                <ProjectListing projectState={ProjectState.PENDING_APPROVAL} />
              )}
              {tabValue === 1 && (
                <ProjectListing projectState={ProjectState.APPROVED_ACTIVE} />
              )}
              {tabValue === 2 && (
                <ProjectListing projectState={ProjectState.APPROVED_INACTIVE} />
              )}
              {tabValue === 3 && (
                <ProjectListing projectState={ProjectState.REJECTED} />
              )}
            </Grid>
            {this.renderButtons()}
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }

  render() {
    const { classes, theme } = this.props;
    return (
      <Grid container spacing={theme.spacing.unit} className={classes.root}>
        <Grid item xs={12} >
          <Paper className={classes.projectListingContainer} elevation={1} square>
            <List className={classes.list}>
              <ListItem className={classes.removePadding}>
                <Typography variant="headline" className={classes.marginBottom3}>
                My Projects
                </Typography>
                <Button
                  variant="fab"
                  color="secondary"
                  aria-label="Add"
                  className={classes.addButton}
                  href="/"
                >
                  <AddIcon />
                </Button>
              </ListItem>
            </List>
            {this.renderTabs()}
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <ProjectOwnerDetails />
        </Grid>
      </Grid>
    );
  }
}

const styles = theme => ({
  root: {
    width: '80vw',
    margin: '0 auto',
  },
  projectListingContainer: {
    margin: '70px auto 10px',
    padding: '40px',
  },
  marginBottom3: {
    marginBottom: theme.spacing.unit * 3,
  },
  addButton: {
    margin: theme.spacing.unit,
    position: 'absolute',
    bottom: theme.spacing.unit * 0.5,
    right: theme.spacing.unit * 1,
  },
  removePadding: {
    padding: 0,
  },
  list: {
    position: 'relative',
  },
  projectListing: {
    margin: '30px auto',
  },
  button: {
    margin: theme.spacing.unit,
  },
});

export const ProjectOwnerDashboard = withContext(AppContext)(
  withTheme()(withStyles(styles)(_ProjectOwnerDashboard))
);
