import React from 'react';

import { Route, Redirect } from 'react-router-dom';
import { withContext } from 'util/context';
import { AppContext } from 'components/main/AppContext';
import { Role } from './roles';

const _RouteAuthenticated = ({
  path,
  exact,
  component,
  render,
  redirectTo,
  // array of roles to authorize
  authorize = [],
  context,
}) => {
  const { isAuthenticated } = context;
  const { authenticator } = context.utils;

  if (!isAuthenticated) {
    return <Redirect to={redirectTo || '/login'} />;
  }

  if (authorize.includes(Role.all)) {
    authorize = [...authorize, Object.keys(Role)];
    authorize = [Role.all, Role.user, Role.admin];
  }

  if (!authorize.includes(authenticator.getCurrentUser().role)) {
    return <Redirect to='/unauthorized' />;
  }

  return component ? <Route path={path} exact={exact} component={component} /> :
    <Route path={path} exact={exact} render={render} />;
};

export const RouteAuthenticated = withContext(AppContext)(_RouteAuthenticated);