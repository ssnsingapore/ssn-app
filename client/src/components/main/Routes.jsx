import React, { Component } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';

import { NavBar } from './NavBar';
import { Footer } from './Footer';
import { NotFound } from './NotFound';
import { AppContext } from './AppContext';
import { RouteAuthenticated } from 'components/shared/RouteAuthenticated';
import { Todos } from 'components/Todos';
import { About } from 'components/About';
import { Login } from 'components/Login';
import { SignUp } from 'components/SignUp';
import { ImageUpload } from 'components/ImageUpload';
import { withContext } from 'util/context';

class _Routes extends Component {
  render() {
    const { classes } = this.props;
    const { isAuthenticated } = this.props.context;

    return (
      <BrowserRouter>
        <div className={classes.root}>
          <Route path="/" component={NavBar} />
          <div className={classes.content}>
            <Switch>
              <Route exact path="/" component={About} />
              <Route path="/about" component={About} />
              <RouteAuthenticated exact path="/todos" component={Todos} isAuthenticated={isAuthenticated} />
              <Route path="/login" component={Login} />
              <Route path="/signup" component={SignUp} />
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

export const Routes = withStyles(styles)(
  withContext(AppContext)(_Routes),
);
