import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import amber from '@material-ui/core/colors/amber';

import { AppContext } from 'components/main/AppContext';
import { withContext } from 'util/context';

export class _JobScheduleMessage extends Component {
  state = {
    nextJobRunTime: '',
  };
  
  async componentDidMount() {
    const { requestWithAlert } = this.props.context.utils;
    const endpoint = '/api/v1/admins/cron_job_time';
    const response = await requestWithAlert.get(endpoint, { authenticated: true });
    if (response.isSuccessful) {
      const { nextJobRunTime } = await response.json();
      this.setState({
        nextJobRunTime,
      });
    }
  }

  render() {
    const { classes } = this.props; 
    
    return (
      this.state.nextJobRunTime && 
      <div className={classes.root}>
        <Typography>
          Projects past their event end dates will become inactive on  {this.state.nextJobRunTime}
        </Typography>
      </div>
    );
  }
}

const styles = {
  root: {
    backgroundColor: amber[100],
    padding: '10px',
    borderRadius: '5px',
  },
};

export const JobScheduleMessage = withContext(AppContext)(
  withStyles(styles)(_JobScheduleMessage)
);
