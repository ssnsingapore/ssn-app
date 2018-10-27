import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';
import { AppContext } from 'components/main/AppContext';
import { withContext } from 'util/context';
import { Grid, Button, Paper } from '@material-ui/core';
import RemoveRedEyeIcon from '@material-ui/icons/RemoveRedEye';

import { extractErrors, formatErrors } from 'util/errors';
import { AlertType } from 'components/shared/Alert';
import { Spinner } from 'components/shared/Spinner';
import { ProjectMainInfo } from 'components/shared/ProjectMainInfo';
import { ProjectOwnerDetails } from 'components/shared/ProjectOwnerDetails';

class _EditProjectPreview extends Component {
  state = {
    isLoading: true,
  };

  async componentDidMount() {
    const { id } = this.props.match.params;
    const { requestWithAlert } = this.props.context.utils;
    const response = await requestWithAlert.get(`/api/v1/projects/${id}`);

    if (response.isSuccessful) {
      const { project } = await response.json();
      this.setState({ project });
    }

    if (response.hasError) {
      const { showAlert } = this.props.context.updaters;
      const errors = await extractErrors(response);
      showAlert('getProjectFailure', AlertType.ERROR, formatErrors(errors));
    }

    this.setState({ isLoading: false });
  }

  renderActionBar = () => {
    const { classes } = this.props;
    const { id } = this.props.match.params;

    return (
      <div className={classes.actionBar}>
        <div className={classes.buttonGroup}>
          <Button
            variant="contained"
            color="secondary"
            className={classes.button}
            component={Link}
            to={`/project_owner/projects/${id}/edit`}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            className={classes.button}
            component={Link}
            to="/project_owner/dashboard"
          >
            Back to dashboard
          </Button>
        </div>
      </div>
    );
  };

  renderPreviewNotice = () => {
    const { classes } = this.props;

    return (
      <Paper square className={classes.previewNotice}>
        <Button disabled fullWidth>
          <RemoveRedEyeIcon className={classes.leftIcon} />
          This is a preview
        </Button>
      </Paper>
    );
  };

  render() {
    const { classes } = this.props;

    if (this.state.isLoading) {
      return <Spinner />;
    }
    return (
      <Grid container className={classes.root}>
        <Grid item xs={12} className={classes.projectDetails}>
          {this.renderPreviewNotice()}
          <Grid container spacing={16}>
            <Grid item xs={12} />
            <Grid item xs={12}>
              <ProjectMainInfo project={this.state.project} />
            </Grid>
            <Grid item xs={12}>
              <ProjectOwnerDetails
                projectOwner={this.state.project.projectOwner}
              />
            </Grid>
          </Grid>
        </Grid>
        {this.renderActionBar()}
      </Grid>
    );
  }
}

const styles = theme => ({
  root: {
    flexDirection: 'column',
    minHeight: '45vw',
  },
  projectDetails: {
    flexGrow: 1,
    width: '80vw',
    margin: '0 auto',
    paddingBottom: 30,
  },
  previewNotice: {
    padding: theme.spacing.unit / 2,
    backgroundColor: theme.palette.grey[200],
  },
  leftIcon: {
    marginRight: theme.spacing.unit,
  },
  buttonGroup: {
    width: '90vw',
  },
  button: {
    marginTop: theme.spacing.unit * 1.5,
    marginRight: 0,
    marginBottom: theme.spacing.unit * 1.5,
    marginLeft: theme.spacing.unit * 2,
    float: 'right',
  },
  actionBar: {
    position: 'sticky',
    bottom: 0,
    backgroundColor: theme.palette.grey[200],
  },
});

export const EditProjectPreview = withContext(AppContext)(
  withStyles(styles)(_EditProjectPreview)
);
