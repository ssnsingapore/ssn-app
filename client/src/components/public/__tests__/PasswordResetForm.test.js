import React from 'react';
import Cookie from 'js-cookie';

import { Button, TextField } from '@material-ui/core';
import { defaultAppContext } from 'components/main/AppContext';
import { AlertType } from 'components/shared/Alert';
import { Redirect } from 'react-router-dom';
import { _testExports } from '../PasswordResetForm';
import { MESSAGE_COOKIE_NAME } from 'util/constants';


const PasswordResetForm = _testExports.PasswordResetForm;
describe('PasswordResetForm', () => {
  let component;
  let mockContext;

  describe('render', () => {
    beforeEach(() => {
      Cookie.set(MESSAGE_COOKIE_NAME, MESSAGE_COOKIE_NAME);

      mockContext = {
        ...defaultAppContext,
      };
      mockContext.utils.requestWithRequestWithAlert = {
        put: jest.fn(() => Promise.resolve({})),
      };
      mockContext.updaters.showAlert = jest.fn();

      component = shallow(
        <PasswordResetForm
          context={mockContext}
          location={{
            hash: `#type=SUCCESS&message=${encodeURIComponent('some password reset message')}`,
          }}
        />
      ).dive().dive();
    });

    it('should display alert message when message cookie is set', () => {
      expect(mockContext.updaters.showAlert).toHaveBeenCalledWith('passwordResetMessage', 'SUCCESS', 'some password reset message');
      expect(Cookie.get(MESSAGE_COOKIE_NAME)).toBeFalsy();
    });

    it('should have password and password confirmation fields', () => {
      const passwordTextField = component.find(TextField).filterWhere(field => field.props().label === 'Password');
      const passwordConfirmationTextField = component.find(TextField).filterWhere(field => field.props().label === 'Password confirmation');

      expect(passwordTextField).toExist();
      expect(passwordConfirmationTextField).toExist();
    });

    it('has a submit button that is disabled when page is loading', () => {
      component.setState({
        isLoading: true,
      });

      expect(component.find(Button).props().type).toBe('submit');
      expect(component.find(Button).props().disabled).toBe(true);
    });


    it('redirects to login page when redirectToLogin is true', () => {
      component.setState({
        redirectToLogin: true,
      });

      expect(component.find(Redirect).props().to).toEqual('/login');
    });
  });

  describe('resetting password', () => {
    const event = {
      preventDefault: jest.fn(),
    };

    describe('when form validations fail', () => {
      beforeEach(() => {
        mockContext = {
          ...defaultAppContext,
        };
        mockContext.utils.requestWithAlert = {
          put: jest.fn(() => Promise.resolve({ hasError: true })),
        };
        mockContext.updaters.showAlert = jest.fn();

        component = shallow(
          <PasswordResetForm
            context={mockContext}
            location={{
              hash: encodeURIComponent('#type=SUCCESS&message=some password reset message'),
            }}
          />
        ).dive().dive();
      });

      it('should not make a request to reset password', async () => {
        await component.instance().handleSubmit(event);
        expect(component.state().redirectToLogin).toEqual(false);
        expect(mockContext.utils.requestWithAlert.put).not.toHaveBeenCalled();
        expect(mockContext.updaters.showAlert).not.toHaveBeenCalled();
      });
    });

    describe('when successful', () => {
      beforeEach(() => {
        mockContext = {
          ...defaultAppContext,
        };
        mockContext.utils.requestWithAlert = {
          put: jest.fn(() => Promise.resolve({ isSuccessful: true })),
        };
        mockContext.updaters.showAlert = jest.fn();

        component = shallow(
          <PasswordResetForm
            context={mockContext}
            location={{
              hash: encodeURIComponent('#type=SUCCESS&message=some password reset message'),
            }}
          />
        );
        const formComponent = component.dive();
        component = formComponent.dive();

        formComponent.props().setField('password', 'some password');
        formComponent.props().setField('passwordConfirmation', 'some password');
      });

      it('should show a success message and redirect to login', async () => {
        await component.instance().handleSubmit(event);

        expect(component.state().isLoading).toEqual(false);
        expect(component.state().redirectToLogin).toEqual(true);
        expect(mockContext.utils.requestWithAlert.put).toHaveBeenCalledWith(
          '/api/v1/project_owners/password/reset',
          { password: 'some password' },
          { authenticated: true },
        );
        expect(mockContext.updaters.showAlert).toHaveBeenCalledWith(
          'passwordResetSuccess',
          AlertType.SUCCESS,
          'You have successully reset your password. Please try logging in.'
        );
      });
    });

    describe('when unsuccessful', () => {
      beforeEach(() => {
        mockContext = {
          ...defaultAppContext,
        };
        mockContext.utils.requestWithAlert = {
          put: jest.fn(() => Promise.resolve({
            hasError: true,
            json: () => Promise.resolve({
              errors: [
                {
                  title: 'some error',
                  detail: 'some error',
                },
              ],
            }),
          })),
        };
        mockContext.updaters.showAlert = jest.fn();

        component = shallow(
          <PasswordResetForm
            context={mockContext}
            location={{
              hash: encodeURIComponent('#type=SUCCESS&message=some password reset message'),
            }}
          />
        );
        const formComponent = component.dive();
        component = formComponent.dive();

        formComponent.props().setField('password', 'some password');
        formComponent.props().setField('passwordConfirmation', 'some password');
      });

      it('should show an error message and redirect to login', async () => {
        await component.instance().handleSubmit(event);

        expect(component.state().isLoading).toEqual(false);
        expect(component.state().redirectToLogin).toEqual(true);
        expect(mockContext.utils.requestWithAlert.put).toHaveBeenCalledWith(
          '/api/v1/project_owners/password/reset',
          { password: 'some password' },
          { authenticated: true },
        );
        expect(mockContext.updaters.showAlert).toHaveBeenCalledWith(
          'passwordResetError',
          AlertType.ERROR,
          'Oops! We\'ve encountered a problem: some error'
        );
      });
    });
  });
});
