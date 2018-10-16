import React from 'react';
import { Redirect } from 'react-router-dom';
import { TextField, Button } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

import { defaultAppContext } from 'components/main/AppContext';
import { AlertType } from 'components/shared/Alert';
import { _AdminLoginPage } from '../AdminLoginPage';
import { withForm } from 'util/form';

describe('AdminLoginPage', () => {
  let component;

  describe('render', () => {
    beforeEach(() => {
      const mockStyles = {
        landingImage: '',
        landingHeader: '',
      };
  
      const FieldName = {
        email: 'email',
        hashedPassword: 'hashedPassword',
      };
  
      const AdminLoginPage = withForm(FieldName)(
        withStyles(mockStyles)(_AdminLoginPage)
      );
  
      component = shallow(<AdminLoginPage />).dive().dive();
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
  });

  describe('handleSubmit', () => {
    let event;

    beforeEach(() => {
      const mockStyles = {
        landingImage: '',
        landingHeader: '',
      };

      const mockContext = {
        ...defaultAppContext,
      };
      mockContext.utils.authenticator = {
        loginAdmin: jest.fn(),
      };
      mockContext.updaters.showAlert = jest.fn();

      const FieldName = {
        email: 'email',
        hashedPassword: 'hashedPassword',
      };

      const constraints = {
        [FieldName.email]: {
          presence: { allowEmpty: false },
        },
      };

      event = {
        preventDefault: jest.fn(),
      };

      const AdminLoginPage = withForm(FieldName, constraints)(
        withStyles(mockStyles)(_AdminLoginPage)
      );

      component = shallow(<AdminLoginPage context={mockContext} />);
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

    describe('when there are no validation errors', () => {
      let adminLoginComponent;

      beforeEach(() => {
        const formComponent = component.dive();
        formComponent.props().setField('email', 'email@email.com');
        formComponent.props().setField('hashedPassword', 'test123');

        component.props().context.utils.authenticator.loginAdmin.mockImplementation(() => {
          return new Promise(resolve => resolve({ isSuccessful: true }));
        });

        adminLoginComponent = component.dive().dive();
        
        adminLoginComponent.instance().handleSubmit(event);
      });

      it('calls authenticator to login admin when there are no validation errors', () => {
        expect(component.props().context.utils.authenticator.loginAdmin).toHaveBeenCalledWith('email@email.com', 'test123');
      });

      it('sets shouldRedirect to true', () => {
        expect(adminLoginComponent.state('shouldRedirect')).toBe(true);
      });

      it('sets a login successful message', () => {
        expect(component.props().context.updaters.showAlert).toHaveBeenCalledWith('loginSuccess', AlertType.SUCCESS, 'You\'ve successfully logged in!');
      });
    });
  });
});