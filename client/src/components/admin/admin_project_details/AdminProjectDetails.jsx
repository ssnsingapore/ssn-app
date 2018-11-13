import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Redirect, Link } from 'react-router-dom';
import { AppContext } from 'components/main/AppContext';
import { withContext } from 'util/context';
import { Grid, Button, Typography } from '@material-ui/core';
import { Warning } from '@material-ui/icons';

import { extractErrors, formatErrors } from 'util/errors';
import { AlertType } from 'components/shared/Alert';
import { Spinner } from 'components/shared/Spinner';
import { ProjectState } from 'components/shared/enums/ProjectState';
import { ProjectMainInfo } from 'components/shared/ProjectMainInfo';
import { ProjectOwnerDetails } from 'components/shared/ProjectOwnerDetails';
import { AdminProjectApprovalConfirmationDialog } from './AdminProjectApprovalConfirmationDialog';
import { AdminProjectRejectionConfirmationDialog } from './AdminProjectRejectionConfirmationDialog';

const PROJECT_APPROVED_SUCCESS_MESSAGE =
  'The project has been successfully approved.';
class _AdminProjectDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSubmitting: false,
      isLoading: true,
      approveConfirmationDialogBoxOpen: false,
      rejectionConfirmationDialogBoxOpen: false,
    };
  }

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

  handleApprove = async event => {
    event.preventDefault();

    const { id } = this.props.match.params;
    const endpoint = `/api/v1/admin/projects/${id}`;

    const updatedProject = {
      project: {
        state: ProjectState.APPROVED_ACTIVE,
      },
    };

    const { showAlert } = this.props.context.updaters;
    const { requestWithAlert } = this.props.context.utils;

    this.setState({ isSubmitting: true });
    const response = await requestWithAlert.put(endpoint, updatedProject, {
      authenticated: true,
    });
    this.setState({ isSubmitting: false });

    if (response.isSuccessful) {
      showAlert(
        'projectApprovalSuccess',
        AlertType.SUCCESS,
        PROJECT_APPROVED_SUCCESS_MESSAGE
      );
      this.setState({ shouldRedirect: true });
    }

    if (response.hasError) {
      const errors = await extractErrors(response);
      showAlert(
        'projectApprovalFailure',
        AlertType.ERROR,
        formatErrors(errors)
      );
    }
  };

  handleApproveConfirmationDialogBoxOpen = () => {
    this.setState({ approveConfirmationDialogBoxOpen: true });
  };

  handleApproveConfirmationDialogBoxClose = () => {
    this.setState({ approveConfirmationDialogBoxOpen: false });
  }

  handleRejectionConfirmationDialogBoxOpen = () => {
    this.setState({ rejectionConfirmationDialogBoxOpen: true });
  };

  handleRejectionConfirmationDialogBoxClose = () => {
    this.setState({ rejectionConfirmationDialogBoxOpen: false });
  }

  renderApproveRejectButtons(state) {
    const { classes } = this.props;
    if (state !== ProjectState.PENDING_APPROVAL) {
      return null;
    }
    return (
      <React.Fragment>
        <Button
          type="submit"
          variant="contained"
          color="secondary"
          className={classes.button}
          onClick={this.handleApproveConfirmationDialogBoxOpen}
        >
          Approve
        </Button>

        <Button
          type="submit"
          variant="contained"
          className={classes.buttonGrey}
          onClick={this.handleRejectionConfirmationDialogBoxOpen}
        >
          Reject
        </Button>
      </React.Fragment>
    );
  }

  renderNavBar() {
    const { classes } = this.props;
    const { project } = this.state;

    return (
      <div className={classes.bottomNavBar}>
        <Button
          variant="contained"
          colour="default"
          className={classes.button}
          component={Link}
          to="/admin/dashboard"
        >
          Back to Dashboard
        </Button>
        {this.renderApproveRejectButtons(project.state)}
      </div>
    );
  }

  _isProjectRejected = () => this.state.project.state === ProjectState.REJECTED;

  renderRejectionMessage() {
    return (
      <Grid item xs={12}>
        <Typography variant="body1">
          <Warning style={{ marginRight: '10px' }} /><b>Rejection reason:</b> {this.state.project.rejectionReason}
        </Typography>
      </Grid>
    );
  }

  render() {
    const { classes } = this.props;
    const { id } = this.props.match.params;
    const { isSubmitting, isLoading, project } = this.state;

    if (this.state.isLoading) {
      return <Spinner />;
    }
    if (this.state.shouldRedirect) {
      return (
        <Redirect to={{ pathname: '/admin/dashboard' }} />
      );
    }
    return (
      <React.Fragment>
        <div className={classes.root}>
          <AdminProjectApprovalConfirmationDialog
            open={this.state.approveConfirmationDialogBoxOpen}
            handleClose={this.handleApproveConfirmationDialogBoxClose}
            handleApprove={this.handleApprove}
            isSubmitting={isSubmitting}
            isLoading={isLoading}
          />
          <AdminProjectRejectionConfirmationDialog
            open={this.state.rejectionConfirmationDialogBoxOpen}
            handleClose={this.handleRejectionConfirmationDialogBoxClose}
            projectId={id}
            isSubmitting={isSubmitting}
            isLoading={isLoading}
          />
          <Grid container spacing={16} className={classes.projectDetails}>
            {this._isProjectRejected() && this.renderRejectionMessage()}
            <Grid item xs={12}>
              <ProjectMainInfo project={project} />
            </Grid>
            <Grid item xs={12}>
              <ProjectOwnerDetails projectOwner={project.projectOwner} />
            </Grid>
          </Grid>
        </div>
        {this.renderNavBar()}
      </React.Fragment>
    );
  }
}

const styles = theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  projectDetails: {
    width: '80vw',
    margin: '0 auto',
    padding: '60px 0',
  },
  bottomNavBar: {
    display: 'flex',
    position: 'sticky',
    bottom: 0,
    backgroundColor: theme.palette.grey[200],
    justifyContent: 'flex-end',
  },
  button: {
    margin: theme.spacing.unit * 1.5,
    marginLeft: 0,
  },
  buttonGrey: {
    backgroundColor: theme.palette.grey[500],
    margin: theme.spacing.unit * 1.5,
    marginLeft: 0,
  },
});

export const AdminProjectDetails = withContext(AppContext)(
  withStyles(styles)(_AdminProjectDetails)
);

export const _testExports = {
  AdminProjectDetails: _AdminProjectDetails,
};
