import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import { amber, red } from '@material-ui/core/colors';

import { AppContext } from 'components/main/AppContext';
import { withContext } from 'util/context';

export const errorMessage = 'There is no running job to check for inactive projects.' +
  ' Please check if CRON_SCHEDULE environment variable is set correctly.';
export class _JobScheduleMessage extends Component {
  state = {
    nextJobRunTime: '',
    errorMessage: '',
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
    if (response.hasError) {
      this.setState({
        errorMessage,
      });
    }
  }

  render() {
    const { classes } = this.props;

    return (
      <React.Fragment>
        {this.state.errorMessage &&
          <div className={classes.error}>
            <Typography>
              {this.state.errorMessage}
            </Typography>
          </div>}
        {this.state.nextJobRunTime &&
          <div className={classes.root}>
            <Typography>
              Projects past their event end dates will become inactive on  {this.state.nextJobRunTime}
            </Typography>
          </div>}
      </React.Fragment>
    );
  }
}

const styles = {
  root: {
    backgroundColor: amber[100],
    padding: '10px',
    borderRadius: '5px',
  },
  error: {
    backgroundColor: red[50],
    padding: '10px',
    borderRadius: '5px',
  },
};

export const JobScheduleMessage = withContext(AppContext)(
  withStyles(styles)(_JobScheduleMessage)
);
