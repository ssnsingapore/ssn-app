import React from 'react';
import { Route, Redirect } from 'react-router-dom';

export const RouteAuthenticated = ({
  path,
  exact,
  component,
  render,
  redirectTo,
  isAuthenticated,
}) => {
  if (isAuthenticated) {
    return component ? <Route path={path} exact={exact} component={component} /> :
      <Route path={path} exact={exact} render={render} />;
  }

  return <Redirect to={redirectTo || '/login'} />;
};

