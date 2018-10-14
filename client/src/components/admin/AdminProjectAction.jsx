import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Redirect, Link } from 'react-router-dom';
import { AppContext } from 'components/main/AppContext';
import { withContext } from 'util/context';
import {
  Grid,
  Paper,
  BottomNavigation,
  Button,
} from '@material-ui/core';

import { extractErrors, formatErrors } from 'util/errors';
import { AlertType } from 'components/shared/Alert';
import { Spinner } from 'components/shared/Spinner';
import { ProjectState } from 'components/shared/enums/ProjectState';
import { ProjectApprovalConfirmationDialog } from './ProjectApprovalConfirmationDialog';

const PROJECT_APPROVED_SUCCESS_MESSAGE = 'The project has been successfully approved.';
const PROJECT_REJECTED_SUCCESS_MESSAGE = 'The project has been successfully rejected.';

class _AdminProjectAction extends Component {
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

    console.log('UDPATED', updatedProject);

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
      showAlert('projectApprovalSuccess', AlertType.SUCCESS, PROJECT_REJECTED_SUCCESS_MESSAGE);
      this.setState({ shouldRedirect: true});
    }

    if (response.hasError) {
      const errors = await extractErrors(response);
      showAlert('projectApprovalFailure', AlertType.ERROR, formatErrors(errors));
    }

  };


  handleConfirmationDialogBoxOpen = () => {
    this.setState({ confirmationDialogBoxOpen: true });
  }

  handleConfirmationDialogBoxOpenClose = () => {
    this.setState({ confirmationDialogBoxOpen: false });
  }

  renderNavBar() {
    const { classes } = this.props;
    const { state } = this.state.project;

    return (
      <div>
        <Paper square>
          <BottomNavigation  className={classes.bottomNavigation}>
            <div className={classes.buttonGroup}>
              
              {
                state === ProjectState.PENDING_APPROVAL && 
                  <form onSubmit={this.handleReject}>
                    <Button
                      type="submit"
                      variant="contained"
                      className={classes.buttonGrey}
                    >
              Reject
                    </Button>
                  </form>
              }

              { 
                ((state === ProjectState.PENDING_APPROVAL) || (state === ProjectState.REJECTED)) && 
                <form onSubmit={this.handleConfirmationDialogBoxOpen}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="secondary"
                    className={classes.button}
                  >
                Approve
                  </Button>
                </form>
            
              }
              <Button
                variant="contained"
                colour="default"
                className={classes.button}
                component={Link}
                to="/admin/dashboard"
              >
                Back to dashboard
              </Button>
            </div>
          </BottomNavigation>
        </Paper>
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
      <Grid container>
        <Grid item xs={12}>
          {/* TODO: To be fixed, keeps redirecting to same page upon opening */}
          <ProjectApprovalConfirmationDialog
            open={this.state.confirmationDialogBoxOpen}
            handleClose={this.handleConfirmationDialogBoxOpenClose}
            handleApprove={this.handleApprove}/>
          <div className={classes.root}>
          Component made by Sabrina for project details listing for {id}
          </div>
        </Grid>
        <Grid item xs={12}>{this.renderNavBar()}</Grid>
      </Grid>
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
  bottomNavigation: {
    backgroundColor: '#EBEBEB',
    width: '100%',
    position: 'fixed',
    bottom: 0,
    paddingBottom: theme.spacing.unit * 8,
  },
  buttonGroup: {
    width: '80vw',
  },
  button: {
    margin: theme.spacing.unit * 1.5,
    float: 'right',
  },
  buttonGrey: {
    margin: theme.spacing.unit * 1.5,
    float: 'right',
    backgroundColor: '#9F9F9F', 
    color: 'white',
  },

});

export const AdminProjectAction = 
  withContext(AppContext)(
    withStyles(styles)(_AdminProjectAction));
