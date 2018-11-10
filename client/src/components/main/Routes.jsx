import React, { Component } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';

import { NavBar } from './NavBar';
// import { Footer } from './Footer';
import { NotFound } from './NotFound';
import { Unauthorized } from './Unauthorized';

import { RouteAuthenticated } from 'components/shared/RouteAuthenticated';

import { HomePage } from 'components/public/HomePage';
import { Projects } from 'components/public/Projects';
import { Project } from 'components/public/Project';
import { ProjectOwnerSignUpForm } from 'components/public/ProjectOwnerSignUpForm';
import { ProjectOwnerLoginForm } from 'components/public/ProjectOwnerLoginForm';
import { AdminLoginPage } from 'components/public/AdminLoginPage';
import { AwaitingAccountConfirmation } from 'components/public/AwaitingAccountConfirmation';

import { ProjectOwnerDashboard } from 'components/project_owner/ProjectOwnerDashboard';
import { ProjectOwnerNewProjectForm } from 'components/project_owner/new_project_form/ProjectOwnerNewProjectForm';
import { ProjectOwnerEditProjectForm } from 'components/project_owner/new_project_form/ProjectOwnerEditProjectForm';
import { EditProjectPreview } from 'components/project_owner/EditProjectPreview';

import { AdminDashboard } from 'components/admin/AdminDashboard';
import { AdminProjectDetails } from 'components/admin/admin_project_details/AdminProjectDetails';

import { Role } from 'components/shared/enums/Role';

// Components only for reference
import { About } from 'components/old/About';
import { Todos } from 'components/old/Todos';
import { Login } from 'components/old/OldLogin';
import { SignUp } from 'components/old/OldSignUp';
import { ImageUpload } from 'components/old/ImageUpload';
import { PasswordResetForm } from 'components/public/PasswordResetForm';
import { ProjectOwnerEditProfileForm } from 'components/project_owner/ProjectOwnerEditProfileForm';

class _Routes extends Component {
  render() {
    const { classes } = this.props;

    return (
      <BrowserRouter>
        <div className={classes.root}>
          <Route path="/:any+" component={NavBar} />
          <div className={classes.content}>
            <Switch>
              <Route exact path="/" component={HomePage} />
              <Route exact path="/login" component={ProjectOwnerLoginForm} />
              <Route exact path="/signup" component={ProjectOwnerSignUpForm} />
              <Route exact path="/projects" component={Projects} />
              <Route exact path="/projects/:id" component={Project} />

              <Route
                path="/signup/confirmation"
                component={AwaitingAccountConfirmation}
              />
              <Route path="/passwordReset" component={PasswordResetForm} />
              <Route path="/unauthorized" component={Unauthorized} />

              <RouteAuthenticated
                path="/project_owner/dashboard"
                component={ProjectOwnerDashboard}
                authorize={[Role.PROJECT_OWNER]}
              />
              <RouteAuthenticated
                path="/project_owner/projects/new"
                component={ProjectOwnerNewProjectForm}
                authorize={[Role.PROJECT_OWNER]}
              />
              <RouteAuthenticated
                path="/project_owner/projects/:id"
                component={EditProjectPreview}
                authorize={[Role.PROJECT_OWNER]}
              />
              <RouteAuthenticated
                path="/project_owner/projects/:id/edit"
                component={ProjectOwnerEditProjectForm}
                authorize={[Role.PROJECT_OWNER]}
              />
              <RouteAuthenticated
                path="/project_owner/edit_profile"
                component={ProjectOwnerEditProfileForm}
                authorize={[Role.PROJECT_OWNER]}
              />

              <Route exact path="/admin" component={AdminLoginPage} />
              <RouteAuthenticated
                exact
                path="/admin/dashboard"
                component={AdminDashboard}
                authorize={[Role.ADMIN]}
                redirectTo="/admin"
              />

              <RouteAuthenticated
                exact
                path="/admin/projects/:id"
                component={AdminProjectDetails}
                authorize={[Role.ADMIN]}
                redirectTo="/admin"
              />

              {/* Routes to old components for reference */}
              <Route path="/login/old" component={Login} />
              <Route path="/signup/old" component={SignUp} />
              <RouteAuthenticated
                exact
                path="/todos"
                component={Todos}
                authorize={[Role.USER]}
              />
              <Route path="/about" component={About} />
              <Route path="/image_upload" component={ImageUpload} />

              <Route component={NotFound} />
            </Switch>
          </div>
          {/* <Route path="/" component={Footer} /> */}
        </div>
      </BrowserRouter>
    );
  }
}

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  content: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
  },
};

export const Routes = withStyles(styles)(_Routes);
