import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Redirect, Link } from 'react-router-dom';
import { AppContext } from 'components/main/AppContext';
import { withContext } from 'util/context';
import {
  Grid,
  Button,
} from '@material-ui/core';

import { extractErrors, formatErrors } from 'util/errors';
import { AlertType } from 'components/shared/Alert';
import { Spinner } from 'components/shared/Spinner';
import { ProjectState } from 'components/shared/enums/ProjectState';
import { ProjectMainInfo } from 'components/shared/ProjectMainInfo';
import { ProjectOwnerDetails } from 'components/shared/ProjectOwnerDetails';
import { AdminProjectApprovalConfirmationDialog } from './AdminProjectApprovalConfirmationDialog';
import { AdminProjectRejectionConfirmationDialog } from './AdminProjectRejectionConfirmationDialog';

const PROJECT_APPROVED_SUCCESS_MESSAGE = 'The project has been successfully approved.';
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
      const { project } = (await response.json());
      this.setState({ project });
    }

    if (response.hasError) {
      const { showAlert } = this.props.context.updaters;
      const errors = await extractErrors(response);
      showAlert('getProjectFailure', AlertType.ERROR, formatErrors(errors));
    }

    this.setState({ isLoading: false });

  }
  
  handleApprove = async (event) => {

    event.preventDefault();

    const { id } = this.props.match.params;
    const endpoint = `/api/v1/admin/projects/${id}`;

    const updatedProject = { project: {
      state: ProjectState.APPROVE_ACTIVE,
    } };

    const { showAlert } = this.props.context.updaters;
    const { requestWithAlert } = this.props.context.utils;

    this.setState({ isSubmitting: true });
    const response = await requestWithAlert.put(endpoint, updatedProject, { authenticated: true });
    this.setState({ isSubmitting: false });

    if (response.isSuccessful) {
      showAlert('projectApprovalSuccess', AlertType.SUCCESS, PROJECT_APPROVED_SUCCESS_MESSAGE);
      this.setState({ shouldRedirect: true});
    }

    if (response.hasError) {
      const errors = await extractErrors(response);
      showAlert('projectApprovalFailure', AlertType.ERROR, formatErrors(errors));
    }

  };

  handleApproveConfirmationDialogBoxOpen = () => {
    this.setState({ approveConfirmationDialogBoxOpen: true });
  }

  handleApproveConfirmationDialogBoxClose = () => {
    this.setState({ approveConfirmationDialogBoxOpen: false });
  }


  handleRejectionConfirmationDialogBoxOpen = () => {
    this.setState({ rejectionConfirmationDialogBoxOpen: true });
  }

  handleRejectionConfirmationDialogBoxClose = () => {
    this.setState({ rejectionConfirmationDialogBoxOpen: false });
  }


  renderApproveRejectButtons(state) {
    const { classes } = this.props;
    if (state !== ProjectState.PENDING_APPROVAL) {
      return null;
    }
    return(
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


  render() {
    const { classes } = this.props;
    const { id } = this.props.match.params;

    if (this.state.isLoading) {
      return <Spinner />;
    }
    if (this.state.shouldRedirect) {
      return(
        <Redirect to={{
          pathname: '/admin/dashboard' }}/>
      );
    }
    return(
      <Grid container className={classes.root}>
        <AdminProjectApprovalConfirmationDialog
          open={this.state.approveConfirmationDialogBoxOpen}
          handleClose={this.handleApproveConfirmationDialogBoxClose}
          handleApprove={this.handleApprove}
        />
        <AdminProjectRejectionConfirmationDialog
          open={this.state.rejectionConfirmationDialogBoxOpen}
          handleClose={this.handleRejectionConfirmationDialogBoxClose}
          projectId={id}
        />
        <Grid item xs={12} className={classes.projectDetails}>
          <Grid container spacing={16}>
            <Grid item xs={12}>
              <ProjectMainInfo project={this.state.project} />
            </Grid>
            <Grid item xs={12}>
              <ProjectOwnerDetails projectOwner={this.state.project.projectOwner} />
            </Grid>
          </Grid>
        </Grid>
        {this.renderNavBar()}
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
    padding: '60px 0',
  },
  bottomNavBar: {
    display: 'flex',
    position: 'sticky',
    bottom: '0',
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

export const AdminProjectDetails = 
  withContext(AppContext)(
    withStyles(styles)(_AdminProjectDetails));
