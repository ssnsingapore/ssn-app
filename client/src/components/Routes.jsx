import React, { Component } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';

import { NavBar } from './NavBar';
import { Footer } from './Footer';
import { Todos } from './Todos';
import { About } from './About';
import { Login } from './Login';
import { SignUp } from './SignUp';
import { NotFound } from './NotFound';
import { ImageUpload } from './ImageUpload';

class _Routes extends Component {
  render() {
    const { classes } = this.props;

    return (
      <BrowserRouter>
        <div className={classes.root}>
          <Route path="/" component={NavBar} />
          <div className={classes.content}>
            <Switch>
              <Route exact path="/" component={About} />
              <Route path="/about" component={About} />
              <Route exact path="/todos" component={Todos} />
              <Route path="/todos/login" component={Login} />
              <Route path="/todos/signup" component={SignUp} />
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
