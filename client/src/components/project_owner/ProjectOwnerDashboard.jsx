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

  renderTabs() {
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
        {tabValue === 0 && (
          <ProjectListing projectState={ProjectState.PENDING_APPROVAL} isForProjectOwner={true} />
        )}
        {tabValue === 1 && (
          <ProjectListing projectState={ProjectState.APPROVED_ACTIVE} isForProjectOwner={true} />
        )}
        {tabValue === 2 && (
          <ProjectListing projectState={ProjectState.APPROVED_INACTIVE} isForProjectOwner={true}/>
        )}
        {tabValue === 3 && (
          <ProjectListing projectState={ProjectState.REJECTED} isForProjectOwner={true}/>
        )}
      </React.Fragment>
    );
  }

  render() {
    const { classes, theme } = this.props;
    return (
      <Grid container spacing={theme.spacing.unit} className={classes.root}>
        <Grid item xs={12} >
          <Paper className={classes.projectListingContainer} elevation={1} square>
            <div className={classes.header}>
              <Typography variant="headline" className={classes.marginBottom3}>
                My Projects
              </Typography>
              <Button
                variant="fab"
                color="secondary"
                aria-label="Add"
                href="/project_owner/new_project"
              >
                <AddIcon />
              </Button>
            </div>
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  projectListing: {
    margin: '30px auto',
  },
});

export const ProjectOwnerDashboard = withContext(AppContext)(
  withTheme()(withStyles(styles)(_ProjectOwnerDashboard))
);
