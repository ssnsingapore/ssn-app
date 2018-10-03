import React, { Component } from 'react';
import { Typography, Paper, Tabs, Tab} from '@material-ui/core';
import { withStyles, withTheme } from '@material-ui/core/styles';
import { withContext } from '../../util/context';
import { AppContext } from '../main/AppContext';
import { ProjectListing } from '../shared/ProjectListing';

const ProjectState = {
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED_ACTIVE: 'APPROVED_ACTIVE',
  APPROVED_INACTIVE: 'APPROVED_INACTIVE',
  REJECTED: 'REJECTED',
};

const ProjectStateDisplayMapping = {
  [ProjectState.PENDING_APPROVAL]: 'Pending Approval',
  [ProjectState.APPROVED_ACTIVE]: 'Approved (Active)',
  [ProjectState.APPROVED_INACTIVE]: 'Approved (Inactive)',
  [ProjectState.REJECTED]: 'Rejected',
};
  
class _AdminDashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      shouldRedirect: false,
      tabValue: 0,
    };
  }

  handleChange = (_event, value) => {
    this.setState({ tabValue: value });
  };

  render() {
    const { classes } = this.props;
    const { tabValue } = this.state;
    return (
      <Paper className={classes.root} square>
        <Paper className={classes.tabHeader} square>
          <Typography variant="headline" className={classes.headline}>
                List of Projects
          </Typography>
          <Tabs value={tabValue} onChange={this.handleChange} indicatorColor="primary" textColor="primary">
            <Tab label={ProjectStateDisplayMapping[ProjectState.PENDING_APPROVAL]}/>
            <Tab label={ProjectStateDisplayMapping[ProjectState.APPROVED_ACTIVE]}/>
            <Tab label={ProjectStateDisplayMapping[ProjectState.APPROVED_INACTIVE]}/>
            <Tab label={ProjectStateDisplayMapping[ProjectState.REJECTED]}/>
          </Tabs>
        </Paper>
        <div className={classes.tabContainer}>
          {tabValue === 0 && <ProjectListing projectState={ProjectState.PENDING_APPROVAL}/>}
          {tabValue === 1 && <ProjectListing projectState={ProjectState.APPROVED_ACTIVE}/>}
          {tabValue === 2 && <ProjectListing projectState={ProjectState.APPROVED_INACTIVE}/>}
          {tabValue === 3 && <ProjectListing projectState={ProjectState.REJECTED}/>}
        </div>
        
      </Paper>
    );
  }
}

const styles = theme => ({
  root: {
    width: '80vw',
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
});

export const AdminDashboard = withStyles(styles)(
  withTheme()(
    withContext(AppContext)(
      (_AdminDashboard)
    ),
  ),
);
