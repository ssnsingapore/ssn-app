import React, { Component } from 'react';
import { Typography, Paper, Tabs, Tab} from '@material-ui/core';
import { withStyles, withTheme } from '@material-ui/core/styles';
import { withContext } from '../../util/context';
import { AppContext } from '../main/AppContext';
import { ProjectListing } from '../shared/ProjectListing';
import { extractErrors, formatErrors } from '../../util/errors';
import { AlertType } from '../shared/Alert';
import { Spinner } from '../shared/Spinner';

const ProjectState = {
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED_ACTIVE: 'APPROVED_ACTIVE',
  APPROVED_INACTIVE: 'APPROVED_INACTIVE',
  REJECTED: 'REJECTED',
};

const ProjectStateDisplayMapping = {
  [ProjectState.PENDING_APPROVAL]: 'Pending Approval',
  [ProjectState.APPROVED_ACTIVE]: 'Active',
  [ProjectState.APPROVED_INACTIVE]: 'Inactive',
  [ProjectState.REJECTED]: 'Rejected',
};
  
class _AdminDashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      tabValue: 0,
      counts: {
        'PENDING_APPROVAL': 1,
        'APPROVED_ACTIVE': 5,
        'APPROVED_INACTIVE': 2,
        'REJECTED': 1,
      },
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

  render() {
    if (this.state.isLoading) {
      return <Spinner />;
    } 

    const { classes } = this.props;
    const { tabValue } = this.state;
    const { counts } = this.state;
    return (
      <Paper className={classes.root} square>
        <Paper className={classes.tabHeader} square>
          <Typography variant="headline" className={classes.headline}>
                List of Projects
          </Typography>
          <Tabs value={tabValue} onChange={this.handleChange} indicatorColor="primary" textColor="primary">
            <Tab label={ProjectStateDisplayMapping[ProjectState.PENDING_APPROVAL] + ' (' + counts[ProjectState.PENDING_APPROVAL] + ')'}/>
            <Tab label={ProjectStateDisplayMapping[ProjectState.APPROVED_ACTIVE] + ' (' + counts[ProjectState.APPROVED_ACTIVE] + ')'}/>
            <Tab label={ProjectStateDisplayMapping[ProjectState.APPROVED_INACTIVE] + ' (' + counts[ProjectState.APPROVED_INACTIVE] + ')'}/>
            <Tab label={ProjectStateDisplayMapping[ProjectState.REJECTED] + ' (' + counts[ProjectState.REJECTED] + ')'}/>
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
