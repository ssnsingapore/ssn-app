import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Typography, Avatar, Button, MenuItem } from '@material-ui/core';

import { _testExports } from '../NavBar';
import { defaultAppContext } from 'components/main/AppContext';
import { Role } from 'components/shared/enums/Role';

const NavBar = _testExports.NavBar;
describe('Navbar', () => {
  let component;
  let mockContext;

  describe('render', () => {
    it('should not render on admin homepage', () => {
      component = shallow(<NavBar location={{ pathname: '/admin' }} />);
      expect(component.html()).toEqual('');
    });

    it('should render a logo that links to the homepage', () => {
      mockContext = { ...defaultAppContext, isAuthenticated: false };
      mockContext.utils.authenticator = {
        getCurrentUser: jest.fn(() => null),
      };
      component = mount(
        <BrowserRouter>
          <NavBar location={{ pathname: '/someroute' }} context={mockContext} />
        </BrowserRouter>
      );

      expect(component.find(Button).prop('to')).toEqual('/');
      expect(component.find(Button).html()).toEqual(
        expect.stringContaining('<img')
      );
    });

    describe('when project owner is logged in', () => {
      beforeEach(() => {
        mockContext = { ...defaultAppContext, isAuthenticated: true };
        mockContext.utils.authenticator = {
          getCurrentUser: jest.fn(() => ({
            role: Role.PROJECT_OWNER,
            email: 'projectowner@email.com',
          })),
        };
        component = shallow(
          <NavBar
            location={{ pathname: '/someroute'}}
            context={mockContext}
          />
        ).dive();
      });

      it('should render PROJECT OWNER DASHBOARD', () => {
        expect(component.find(Typography).html()).toEqual(
          expect.stringContaining('PROJECT OWNER DASHBOARD')
        );
      });

      // TODO: future story should add a Edit Profile button
      it('should render avatar with dropdown and logout button', () => {
        expect(component.find(Avatar).exists()).toBeTruthy();
        expect(component.find(Button).at(1).html()).toEqual(
          expect.stringContaining('projectowner@email.com')
        );
        expect(component.find(MenuItem).html()).toEqual(
          expect.stringContaining('Logout')
        );
      });
    });

    describe('when admin is logged in', () => {
      beforeEach(() => {
        mockContext = { ...defaultAppContext, isAuthenticated: true };
        mockContext.utils.authenticator = {
          getCurrentUser: jest.fn(() => ({
            role: Role.ADMIN,
            email: 'admin@email.com',
          })),
        };
        component = shallow(
          <NavBar
            location={{ pathname: '/someroute'}}
            context={mockContext}
          />
        ).dive();
      });


      it('should render ADMIN DASHBOARD when admin is logged in', () => {
        expect(component.find(Typography).html()).toEqual(
          expect.stringContaining('ADMIN DASHBOARD')
        );
      });

      it('should render avatar with dropdown and logout button', () => {
        expect(component.find(Avatar).exists()).toBeTruthy();
        expect(component.find(Button).at(1).html()).toEqual(
          expect.stringContaining('admin@email.com')
        );
        expect(component.find(MenuItem).html()).toEqual(
          expect.stringContaining('Logout')
        );

      });
    });

    describe('when no one is logged in', () => {
      beforeEach(() => {
        mockContext = { ...defaultAppContext, isAuthenticated: false };
        mockContext.utils.authenticator = {
          getCurrentUser: jest.fn(() => ({ role: Role.PROJECT_OWNER })),
        };
        component = shallow(
          <NavBar
            location={{ pathname: '/someroute'}}
            context={mockContext}
          />
        ).dive();
      });

      it('should not render any text or avatar when no one is logged in', () => {
        expect(component.find(Typography).exists()).toBeFalsy();
        expect(component.find(Avatar).exists()).toBeFalsy();
        expect(component.find(Button).at(1).exists()).toBeFalsy();
      });
    });
  });

  describe('logout', () => {
    describe('when a project owner is logged in', () => {
      beforeEach(() => {
        mockContext = { ...defaultAppContext, isAuthenticated: true };
        mockContext.utils.authenticator = {
          getCurrentUser: jest.fn(() => ({
            role: Role.PROJECT_OWNER,
            email: 'projectowner@email.com',
          })),
          logoutProjectOwner: jest.fn(() => Promise.resolve({})),
          logoutAdmin: jest.fn(() => Promise.resolve({})),
        };
        component = shallow(
          <NavBar
            location={{ pathname: '/someroute'}}
            context={mockContext}
          />
        ).dive();
      });

      it('should log out project owner when logout button is clicked', async () => {
        await component.find(MenuItem).simulate('click');

        expect(mockContext.utils.authenticator.logoutProjectOwner).toHaveBeenCalled();
        expect(mockContext.utils.authenticator.logoutAdmin).not.toHaveBeenCalled();
      });
    });

    describe('when an admin is logged in', () => {
      beforeEach(() => {
        mockContext = { ...defaultAppContext, isAuthenticated: true };
        mockContext.utils.authenticator = {
          getCurrentUser: jest.fn(() => ({
            role: Role.ADMIN,
            email: 'admin@email.com',
          })),
          logoutProjectOwner: jest.fn(() => Promise.resolve({})),
          logoutAdmin: jest.fn(() => Promise.resolve({})),
        };
        component = shallow(
          <NavBar
            location={{ pathname: '/someroute'}}
            context={mockContext}
          />
        ).dive();
      });

      it('should log out project owner when logout button is clicked', async () => {
        await component.find(MenuItem).simulate('click');

        expect(mockContext.utils.authenticator.logoutProjectOwner).not.toHaveBeenCalled();
        expect(mockContext.utils.authenticator.logoutAdmin).toHaveBeenCalled();
      });
    });

  });
});