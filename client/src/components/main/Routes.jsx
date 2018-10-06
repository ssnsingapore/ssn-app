import React, { Component } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';

import { NavBar } from './NavBar';
import { Footer } from './Footer';
import { NotFound } from './NotFound';
import { Unauthorized } from './Unauthorized';
import { HomePage } from 'components/public/HomePage';
import { Projects } from 'components/public/Projects';
import { Project } from 'components/public/Project';
import { ProjectOwnerSignUpForm } from 'components/public/ProjectOwnerSignUpForm';
import { ProjectOwnerDashboard } from 'components/project_owner/ProjectOwnerDashboard';
import { RouteAuthenticated } from 'components/shared/RouteAuthenticated';
import { Role } from 'components/shared/roles';
import { AwaitingAccountConfirmation } from 'components/public/AwaitingAccountConfirmation';
import { AdminLoginPage } from 'components/public/AdminLoginPage';
import { AdminDashboard } from 'components/public/AdminDashboard';
import { ProjectOwnerLoginForm } from 'components/public/ProjectOwnerLoginForm';

// Components only for reference
import { About } from 'components/old/About';
import { Todos } from 'components/old/Todos';
import { Login } from 'components/old/OldLogin';
import { SignUp } from 'components/old/OldSignUp';
import { ImageUpload } from 'components/old/ImageUpload';
import { PasswordResetForm } from '../public/PasswordResetForm';

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
              <Route path="/project_owner/dashboard" component={ProjectOwnerDashboard} />

              <Route exact path="/admin" component={AdminLoginPage} />
              <RouteAuthenticated
                exact
                path="/admin/dashboard"
                component={AdminDashboard}
                authorize={[Role.admin]}
              />
              {/* Routes to old components for reference */}
              <Route path="/login/old" component={Login} />
              <Route path="/signup/old" component={SignUp} />
              <RouteAuthenticated
                exact
                path="/todos"
                component={Todos}
                authorize={[Role.user]}
              />
              <Route path="/about" component={About} />
              <Route path="/image_upload" component={ImageUpload} />

              <Route component={NotFound} />
            </Switch>
          </div>
          <Route path="/" component={Footer} />
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
