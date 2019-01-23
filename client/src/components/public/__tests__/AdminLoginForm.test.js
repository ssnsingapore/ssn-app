import React from 'react';
import { Redirect } from 'react-router-dom';
import { Button, TextField, Typography } from '@material-ui/core';

import { defaultAppContext } from 'components/main/AppContext';
import { AlertType } from 'components/shared/Alert';
import { Role } from 'components/shared/enums/Role';

import { _testExports } from '../AdminLoginForm';


const AdminLoginForm = _testExports.AdminLoginForm;
describe('AdminLoginForm', () => {
  let component;
  let mockContext;

  describe('render', () => {
    describe('when admin is not logged in', () => {
      beforeEach(() => {
        mockContext = {
          ...defaultAppContext,
          isAuthenticated: false,
        };
        mockContext.utils.authenticator = {
          isAuthenticated: () => false,
          getCurrentUser: jest.fn(() => null),
        };

        component = shallow(<AdminLoginForm context={mockContext} />).dive().dive();
      });

      it('contains fields username and password for login', () => {
        const usernameTextField = component.find(TextField).filterWhere(field => field.props().label === 'Username');
        const passwordTextField = component.find(TextField).filterWhere(field => field.props().label === 'Password');

        expect(usernameTextField).toExist();
        expect(passwordTextField).toExist();
      });

      it('has a submit button that is disabled when page is loading', () => {
        component.setState({
          isLoading: true,
        });

        expect(component.find(Button).props().type).toBe('submit');
        expect(component.find(Button).props().disabled).toBe(true);
      });

      it('redirects to admin dashboard when shouldRedirect is true', () => {
        component.setState({
          shouldRedirect: true,
        });

        expect(component.find(Redirect).props().to).toEqual('/admin/dashboard');
      });

      it('redirects to referrer when should shouldRedirect is true', () => {
        const locationState = {
          referrerPath: '/somereferrer',
        };
        component = shallow(<AdminLoginForm context={mockContext} location={{ state: locationState }} />).dive().dive();
        component.setState({
          shouldRedirect: true,
        });

        expect(component.find(Redirect).props().to).toEqual('/somereferrer');
      });
    });

    describe('when admin is logged in', () => {
      beforeEach(() => {
        const mockContext = {
          ...defaultAppContext,
          isAuthenticated: true,
        };
        mockContext.utils.authenticator = {
          isAuthenticated: () => true,
          getCurrentUser: jest.fn(() => ({
            role: Role.ADMIN,
            email: 'admin@email.com',
          })),
        };

        component = shallow(<AdminLoginForm context={mockContext} />).dive().dive();
      });

      it('has text telling the user that they are already logged', () => {
        expect(component.find(Typography).at(1).html()).toEqual(
          expect.stringContaining('You are logged in as admin@email.com')
        );
      });

      it('has a button to logout and another to go to the admin dashboard', () => {
        expect(component.find(Button).at(0).html()).toEqual(
          expect.stringContaining('Logout')
        );

        const dashboardButton = component.find(Button).get(1);
        expect(dashboardButton.props.children).toContain('Go to Dashboard');
        expect(dashboardButton.props.to).toEqual('/admin/dashboard');
      });

      it('redirects to admin dashboard when shouldRedirect is true', () => {
        component.setState({
          shouldRedirect: true,
        });

        expect(component.find(Redirect).props().to).toEqual('/admin/dashboard');
      });
    });
  });

  describe('logging in', () => {
    let event;

    beforeEach(() => {
      const mockContext = {
        ...defaultAppContext,
      };
      mockContext.utils.authenticator = {
        getCurrentUser: () => null,
        loginAdmin: jest.fn(),
      };
      mockContext.updaters.showAlert = jest.fn();

      event = {
        preventDefault: jest.fn(),
      };

      component = shallow(<AdminLoginForm context={mockContext} />);
    });

    describe('when there are validation errors', () => {
      beforeEach(() => {
        const formComponent = component.dive();
        formComponent.props().setField('email', '');
      });

      it('prevents default submission of form and does login admin when validation fails', () => {
        component.dive().dive().instance().handleSubmit(event);

        expect(event.preventDefault).toHaveBeenCalled();
        expect(component.props().context.utils.authenticator.loginAdmin).not.toHaveBeenCalled();
      });
    });

    describe('when there are no validation errors and login is successful', () => {
      let adminLoginComponent;

      beforeEach(() => {
        const formComponent = component.dive();
        formComponent.props().setField('email', 'email@email.com');
        formComponent.props().setField('password', 'test123');

        component.props().context.utils.authenticator.loginAdmin.mockImplementation(() => {
          return new Promise(resolve => resolve({ isSuccessful: true }));
        });

        adminLoginComponent = formComponent.dive();

        adminLoginComponent.instance().handleSubmit(event);
      });

      fit('calls authenticator to login admin when there are no validation errors', () => {
        expect(component.props().context.utils.authenticator.loginAdmin).toHaveBeenCalledWith('email@email.com', 'test123');
      });

      it('sets shouldRedirect to true', () => {
        expect(adminLoginComponent.state('shouldRedirect')).toBe(true);
      });

      it('sets a login successful message', () => {
        expect(component.props().context.updaters.showAlert).toHaveBeenCalledWith('loginSuccess', AlertType.SUCCESS, 'You\'ve successfully logged in!');
      });
    });

    describe('when login is not successful', () => {
      let adminLoginComponent;

      beforeEach(() => {
        component.props().context.utils.authenticator.loginAdmin.mockImplementation(() => {
          return new Promise(resolve => resolve({
            hasError: true,
            status: 401,
          }));
        });

        adminLoginComponent = component.dive().dive();

        adminLoginComponent.setProps({
          validateAllFields: jest.fn().mockImplementation(() => true),
        });

        adminLoginComponent.instance().handleSubmit(event);
      });

      it('displays login failure message', () => {
        expect(component.props().context.updaters.showAlert).toHaveBeenCalledWith('loginFailure', AlertType.ERROR, 'Looks like you\'ve keyed in the wrong credentials. Try again!');
      });
    });
  });

  describe('logging out', () => {
    beforeEach(() => {
      const mockContext = {
        ...defaultAppContext,
        isAuthenticated: true,
      };
      mockContext.utils.authenticator = {
        getCurrentUser: () => ({
          role: Role.ADMIN,
          email: 'admin@email.com',
        }),
        logoutAdmin: jest.fn(),
      };
      mockContext.updaters.showAlert = jest.fn();

      component = shallow(<AdminLoginForm context={mockContext} />);
    });

    describe('when logout is successul', () => {
      beforeEach(() => {
        component.props().context.utils.authenticator.logoutAdmin.mockImplementation(() => {
          return new Promise(resolve => resolve({ isSuccessful: true }));
        });
      });

      it('should call authenticator to logout, set loading state, and show alert', async () => {
        const baseComponent = component.dive().dive();

        await baseComponent.find(Button).at(0).simulate('click');

        expect(baseComponent.state().isLoading).toEqual(false);
        expect(component.props().context.utils.authenticator.logoutAdmin).toHaveBeenCalled();
        expect(component.props().context.updaters.showAlert).toHaveBeenCalledWith(
          'logoutSuccess', AlertType.SUCCESS, 'You\'ve successfully logged out!',
        );
      });


    });


  });
});