import React, { Component } from 'react';
import { Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

import { AppContext } from 'components/main/AppContext';
import { withContext } from 'util/context';
import { extractErrors, formatErrors } from 'util/errors';

import { AlertType } from 'components/shared/Alert';
import { Spinner } from 'components/shared/Spinner';
import { ProjectMainInfo } from 'components/shared/ProjectMainInfo';
import { ProjectOwnerDetails } from 'components/shared/ProjectOwnerDetails';

class _Project extends Component {
  state = {
    project: {},
    isLoading: true,
  };

  async componentDidMount() {
    const { requestWithAlert } = this.props.context.utils;
    const { id } = this.props.match.params;
    const endpoint = `/api/v1/projects/${id}`;
    const response = await requestWithAlert.get(endpoint);

    if (response.isSuccessful) {
      const { project } = await response.json();
      this.setState({ project });
    }

    if (response.hasError) {
      const { showAlert } = this.props.context.updaters;
      const errors = await extractErrors(response);
      showAlert('getProjectsFailure', AlertType.ERROR, formatErrors(errors));
    }

    this.setState({ isLoading: false });
  }

  render() {
    if (this.state.isLoading) {
      return <Spinner />;
    }

    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <Grid container spacing={16}>
          <Grid item xs={12}>
            <ProjectMainInfo project={this.state.project} />
          </Grid>
          <Grid item xs={12}>
            <ProjectOwnerDetails
              projectOwner={this.state.project.projectOwner}
            />
          </Grid>
        </Grid>
      </div>
    );
  }
}

const styles = theme => ({
  root: {
    flexGrow: 1,
    width: '80vw',
    margin: '0 auto',
    padding: '60px 0',
  },
});

export const Project = withContext(AppContext)(withStyles(styles)(_Project));
