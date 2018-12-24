import React from 'react';

import { _testExports } from 'components/shared/RouteAuthenticated';
import { defaultAppContext } from 'components/main/AppContext';
import { Redirect, Route } from 'react-router-dom';
import { Role } from 'components/shared/enums/Role';

const RouteAuthenticated = _testExports.RouteAuthenticated;

const DummyComponent = () => (
  <p>Dummy</p>
);

const shallowWithRoute = (props = {}) => {
  return shallow(
    <RouteAuthenticated path="/somepath" component={DummyComponent} {...props} />
  );
};

describe('RouteAuthenticated', () => {
  describe('when there is no user logged in', () => {
    let component;
    let mockContext;

    beforeEach(() => {
      Object.defineProperty(window.location, 'pathname', {
        value: '/currentpath',
      });

      mockContext = { ...defaultAppContext, isAuthenticated: false };
      mockContext.utils.authenticator = {
        isAuthenticated: () => false,
        getCurrentUser: () => null,
      };
      component = shallowWithRoute({ context: mockContext });
    });

    it('should render Redirect to login page by default', () => {
      expect(component.find(Redirect).props().to).toEqual(
        expect.objectContaining({
          pathname: '/login',
        })
      );
    });

    it('should render Redirect to provided redirectTo', () => {
      component = shallowWithRoute({ context: mockContext, redirectTo: '/anotherpath' });

      expect(component.find(Redirect).props().to).toEqual(
        expect.objectContaining({
          pathname: '/anotherpath',
        })
      );
    });

    it('should render Redirect with referrerPath set in state', () => {
      expect(component.find(Redirect).props().to).toEqual(
        expect.objectContaining({
          state: { referrerPath: '/currentpath' },
        })
      );
    });
  });

  describe('when there is a user logged in', () => {
    let component;
    let mockContext;

    beforeEach(() => {
      mockContext = { ...defaultAppContext, isAuthenticated: true };
    });

    describe('when all users are authorized to access this route', () => {
      it('should render the component', () => {
        mockContext.utils.authenticator = {
          isAuthenticated: () => true,
          getCurrentUser: () => ({
            role: Role.PROJECT_OWNER,
            email: 'some@email.com',
          }),
        };

        component = shallowWithRoute({ context: mockContext, authorize: [Role.ALL] });
        expect(component.find(Route).exists()).toEqual(true);
      });
    });

    describe('when the logged in user is a project owner but only an admin is authorized', () => {
      it('should redirect to unauthorized page', () => {
        mockContext.utils.authenticator = {
          isAuthenticated: () => true,
          getCurrentUser: () => ({
            role: Role.PROJECT_OWNER,
            email: 'some@email.com',
          }),
        };

        component = shallowWithRoute({ context: mockContext, authorize: [Role.ADMIN] });
        expect(component.find(Redirect).props().to).toEqual('/unauthorized');
      });
    });

    describe('when the logged in user is an admin but only a project owner is authorized', () => {
      it('should redirect to unauthorized page', () => {
        mockContext.utils.authenticator = {
          isAuthenticated: () => true,
          getCurrentUser: () => ({
            role: Role.ADMIN,
            email: 'some@email.com',
          }),
        };

        component = shallowWithRoute({ context: mockContext, authorize: [Role.PROJECT_OWNER] });
        expect(component.find(Redirect).props().to).toEqual('/unauthorized');
      });

    });
  });
});
