import React, { Component } from 'react';
import { Typography, Paper, Tabs, Tab} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

import { AppContext } from 'components/main/AppContext';
import { ProjectListing } from 'components/shared/ProjectListing';
import { AlertType } from 'components/shared/Alert';
import { Spinner } from 'components/shared/Spinner';
import { ProjectStateDisplayMapping } from 'components/shared/display_mappings/ProjectStateDisplayMapping';
import { ProjectState } from 'components/shared/enums/ProjectState';

import { extractErrors, formatErrors } from 'util/errors';
import { withContext } from 'util/context';
import { Role } from 'components/shared/enums/Role';
export class _AdminDashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      tabValue: 0,
      counts: {},
    };
  }

  async componentDidMount () {
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

  getTabLabel = (projectState) => {
    const { counts } = this.state;
    return `${ProjectStateDisplayMapping[projectState]} (${counts[projectState]})`;
  }

  render() {
    if (this.state.isLoading) {
      return <Spinner />;
    }

    const { classes } = this.props;
    const { tabValue } = this.state;

    return (
      <Paper className={classes.root} square>
        <Paper className={classes.tabHeader} square>
          <Typography variant="headline" className={classes.headline}>
                List of Projects
          </Typography>
          <Tabs value={tabValue} onChange={this.handleChange} indicatorColor="primary" textColor="primary">
            <Tab label={this.getTabLabel(ProjectState.PENDING_APPROVAL)}/>
            <Tab label={this.getTabLabel(ProjectState.APPROVED_ACTIVE)}/>
            <Tab label={this.getTabLabel(ProjectState.APPROVED_INACTIVE)}/>
            <Tab label={this.getTabLabel(ProjectState.REJECTED)}/>
          </Tabs>
        </Paper>
        <div className={classes.tabContainer}>
          {tabValue === 0 && <ProjectListing 
            dashboardRole={Role.ADMIN}
            projectState={ProjectState.PENDING_APPROVAL}
          />}
          {tabValue === 1 && <ProjectListing 
            dashboardRole={Role.ADMIN}
            projectState={ProjectState.APPROVED_ACTIVE}/>}
          {tabValue === 2 && <ProjectListing 
            dashboardRole={Role.ADMIN}
            projectState={ProjectState.APPROVED_INACTIVE}/>}
          {tabValue === 3 && <ProjectListing 
            dashboardRole={Role.ADMIN}
            projectState={ProjectState.REJECTED}/>}
        </div>
      </Paper>
    );
  }
}

const styles = {
  root: {
    width: '90vw',
    margin: '10px auto',
  },
  headline: {
    marginBottom: '35px',
  },
  tabContainer: {
    marginTop: '35px',
    margin: '35px 30px',
  },
  tabHeader: {
    padding: '30px',
    paddingBottom: '0px',
  },
};

export const AdminDashboard = withStyles(styles)(
  withContext(AppContext)(
    (_AdminDashboard)
  ),
);
