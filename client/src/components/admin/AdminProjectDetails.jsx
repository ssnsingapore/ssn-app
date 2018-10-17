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
import { ProjectApprovalConfirmationDialog } from './ProjectApprovalConfirmationDialog';

const PROJECT_APPROVED_SUCCESS_MESSAGE = 'The project has been successfully approved.';
const PROJECT_REJECTED_SUCCESS_MESSAGE = 'The project has been successfully rejected.';

class _AdminProjectDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSubmitting: false,
      isLoading: true,
      confirmationDialogBoxOpen: false,
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
    const endpoint = `/api/v1/projects/${id}`;

    const updatedProject = { project: {
      state: ProjectState.APPROVE_ACTIVE,
    } };

    const { showAlert } = this.props.context.updaters;
    const { requestWithAlert } = this.props.context.utils;

    this.setState({ isSubmitting: true });
    const response = await requestWithAlert.put(endpoint, updatedProject, { authenticated: false });
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

  handleReject = async (event) => {

    event.preventDefault();

    const { id } = this.props.match.params;
    const endpoint = `/api/v1/projects/${id}`;

    const updatedProject = { project: {
      state: ProjectState.REJECTED,
    } };

    const { showAlert } = this.props.context.updaters;
    const { requestWithAlert } = this.props.context.utils;

    this.setState({ isSubmitting: true });
    const response = await requestWithAlert.put(endpoint, updatedProject, { authenticated: false });
    this.setState({ isSubmitting: false });

    if (response.isSuccessful) {
      showAlert('projectRejectSuccess', AlertType.SUCCESS, PROJECT_REJECTED_SUCCESS_MESSAGE);
      this.setState({ shouldRedirect: true});
    }

    if (response.hasError) {
      const errors = await extractErrors(response);
      showAlert('projectRejectFailure', AlertType.ERROR, formatErrors(errors));
    }

  };


  handleConfirmationDialogBoxOpen = () => {
    this.setState({ confirmationDialogBoxOpen: true });
  }

  handleConfirmationDialogBoxOpenClose = () => {
    this.setState({ confirmationDialogBoxOpen: false });
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
          onClick={this.handleConfirmationDialogBoxOpen}
        >
                Approve
        </Button>

        <Button
          type="submit"
          variant="contained"
          className={classes.buttonGrey}
          onClick={this.handleReject}
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
        <ProjectApprovalConfirmationDialog
          open={this.state.confirmationDialogBoxOpen}
          handleClose={this.handleConfirmationDialogBoxOpenClose}
          handleApprove={this.handleApprove}
        />
        <Grid item xs={12} className={classes.projectDetails}>
          <div>
            Component made by Sabrina for project details listing for {id}
          </div>
        </Grid>
        {this.renderNavBar()}
      </Grid>
    );
  }

}

const styles = theme => ({

  root: {
    flexDirection: 'column',
    minHeight: '100vw',
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
