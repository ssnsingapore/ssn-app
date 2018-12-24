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

      expect(component.find(Button).at(0).prop('to')).toEqual('/');
      expect(component.find(Button).at(0).html()).toEqual(
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
            location={{ pathname: '/project_owner/dashboard' }}
            context={mockContext}
          />
        ).dive();
      });

      it('should render a brand logo that redirects to project owner dashboard on click', () => {
        expect(component.find(Button).get(0).props.to).toEqual('/project_owner/dashboard');
      });

      it('should render PROJECT OWNER', () => {
        expect(component.find(Typography).html()).toEqual(
          expect.stringContaining('PROJECT OWNER')
        );
      });

      describe('avatar dropdown', () => {
        it('should render avatar with dropdown', () => {
          expect(component.find(Avatar).exists()).toBeTruthy();
          expect(component.find(Button).at(1).html()).toEqual(
            expect.stringContaining('projectowner@email.com')
          );
        });

        it('renders logout button', () => {
          expect(component.find(MenuItem).at(2).html()).toEqual(
            expect.stringContaining('Logout')
          );
        });

        it('should render a button that navigates to view project owners page', () => {
          expect(component.find(MenuItem).get(0).props.children).toContain(' View Project Owners');
          expect(component.find(MenuItem).get(0).props.to).toEqual('/project_owners');
        });

        it('should render a button that navigates to edit profile project owner page', () => {
          expect(component.find(MenuItem).get(1).props.children).toContain(' Edit Profile');
          expect(component.find(MenuItem).get(1).props.to).toEqual('/project_owner/edit_profile');
        });
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
            location={{ pathname: '/admin/dashboard' }}
            context={mockContext}
          />
        ).dive();
      });

      it('should render a brand logo that redirects to admin dashboard on click', () => {
        expect(component.find(Button).get(0).props.to).toEqual('/admin/dashboard');
      });

      it('should render SSN ADMIN when admin is logged in', () => {
        expect(component.find(Typography).html()).toEqual(
          expect.stringContaining('SSN ADMIN')
        );
      });

      describe('avatar dropdown', () => {

        it('should render avatar with dropdown and logout button', () => {
          expect(component.find(Avatar).exists()).toBeTruthy();
          expect(component.find(Button).at(1).html()).toEqual(
            expect.stringContaining('admin@email.com')
          );

          expect(component.find(MenuItem).get(0).props.children).toContain(' View Project Owners');
          expect(component.find(MenuItem).get(1).props.children).toContain(' Logout');
        });
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
            location={{ pathname: '/someroute' }}
            context={mockContext}
          />
        ).dive();
      });

      it('should render a brand logo that redirects to home page on click', () => {
        expect(component.find('[data-testid="logo-button"]').props().to).toEqual('/');
      });

      it('should render a button to view projects that links to projects page', () => {
        expect(component.find('[data-testid="public-nav-button"]').props().to).toEqual('/projects');
      });

      it('should not render avatar dropdown menu when no one is logged in', () => {
        expect(component.find(Avatar).exists()).toBeFalsy();
      });
    });


    describe('when no one is logged in and on /projects route', () => {
      beforeEach(() => {
        mockContext = { ...defaultAppContext, isAuthenticated: false };
        mockContext.utils.authenticator = {
          getCurrentUser: jest.fn(() => ({ role: Role.PROJECT_OWNER })),
        };
        component = shallow(
          <NavBar
            location={{ pathname: '/projects' }}
            context={mockContext}
          />
        ).dive();
      });

      it('should render a brand logo that redirects to home page on click', () => {
        expect(component.find('[data-testid="logo-button"]').props().to).toEqual('/');
      });

      it('should render a button to view project owners', () => {
        expect(component.find('[data-testid="public-nav-button"]').props().to).toEqual('/project_owners');
      });

      it('should not render avatar dropdown menu when no one is logged in', () => {
        expect(component.find(Avatar).exists()).toBeFalsy();
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
            location={{ pathname: '/project_owner' }}
            context={mockContext}
          />
        ).dive();
      });

      it('should log out project owner when logout button is clicked', async () => {
        component.find('[data-testid="dropdown-button"]').props().onClick({ currentTarget: {} });
        await component.find(MenuItem).at(2).simulate('click');

        expect(component.state().anchorEl).toBeNull();
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
            location={{ pathname: '/someroute' }}
            context={mockContext}
          />
        ).dive();
      });

      it('should log out project owner when logout button is clicked', async () => {
        component.find('[data-testid="dropdown-button"]').props().onClick({ currentTarget: {} });
        await component.find(MenuItem).at(1).simulate('click');

        expect(component.state().anchorEl).toBeNull();
        expect(mockContext.utils.authenticator.logoutProjectOwner).not.toHaveBeenCalled();
        expect(mockContext.utils.authenticator.logoutAdmin).toHaveBeenCalled();
      });
    });
  });
});