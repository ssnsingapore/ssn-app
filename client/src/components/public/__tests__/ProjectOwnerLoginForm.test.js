import React from 'react';
import { TextField, Button } from '@material-ui/core';
import { TestProjectOwnerLoginForm } from 'components/public/ProjectOwnerLoginForm';
import { AlertType } from 'components/shared/Alert';
import { PasswordResetDialog } from '../PasswordResetDialog';

describe('ProjectOwnerLoginForm', () => {
  let props;
  let component;

  const LOGIN_SUCCESS_MESSAGE = 'You\'ve successfully logged in!';
  const LOGIN_FAILURE_MESSAGE = 'Looks like you\'ve keyed in the wrong credentials. Try again!';


  beforeEach(() => {

    props = {
      classes: {},
      context: {
        updaters: {
          showAlert: jest.fn(),
        },
      },
    };
    
    component = shallow(<TestProjectOwnerLoginForm {...props}/>);
  });

  describe('invalid field', () => {
    it('should show invalid email message when login with invalid email', async () => {
      const emailTextField = component.dive().find(TextField).filterWhere(n => n.props().name === 'email');
      expect(emailTextField.exists()).toBeTruthy();

      const event = {
        target: {name: 'email', value: 'invalid email'},
      };
      
      await component.instance().handleChange(event);
      component.update();
      const emailTextFieldNew = component.dive().find(TextField)
        .filterWhere(n => n.props().name === 'email');
      expect(emailTextFieldNew.props().error).toBeTruthy();
      expect(emailTextFieldNew.props().helperText).toBeTruthy();
    });
  });

  describe('handleSubmit happy flow',  () => {
    let props;
    let component;
    const valuesForAllFields = {email: 'test@test.com',
      password: 'test123'};

    beforeEach(() => {
  
      props = {
        classes: {},
        context: {
          updaters: {
            showAlert: jest.fn(),
          },
          utils: {
            authenticator: {
              loginProjectOwner: jest.fn(() => {
                return new Promise(resolve => resolve({
                  isSuccessful: true,
                }));
              }),
            },
          },
        },
        valuesForAllFields: jest.fn(() => {
          return valuesForAllFields;
        }),
        validateAllFields: jest.fn(() => {
          return true;
        }),
      };

      component = shallow(<TestProjectOwnerLoginForm {...props}/>);
    });

    it('should prevent default when handleSubmit is clicked', async () => {      

      const event = {
        preventDefault: jest.fn(),
      };
      component.dive().instance().handleSubmit(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.props().validateAllFields).toHaveBeenCalled();
      expect(component.props().validateAllFields()).toBeTruthy();
    });

    it('should invoke authenticator when handleSubmit is clicked', async () => {      

      const event = {
        preventDefault: jest.fn(),
      };
      component.dive().instance().handleSubmit(event);

      const {email, password} = valuesForAllFields;

      expect(component.props().context.utils.authenticator.loginProjectOwner).toHaveBeenCalledWith(email, password);
      expect(await component.props().context.utils.authenticator.loginProjectOwner(email, password)).toEqual({isSuccessful: true});
    });

    it('should show success alert when authentication successful', async () => {      

      const event = {
        preventDefault: jest.fn(),
      };
      component.dive().instance().handleSubmit(event);

      const {email, password} = valuesForAllFields;
      await component.props().context.utils.authenticator.loginProjectOwner(email, password);

      expect(component.props().context.updaters.showAlert).toHaveBeenCalledWith('loginSuccess', AlertType.SUCCESS, LOGIN_SUCCESS_MESSAGE);
    });
  });

  describe('handleSubmit not so happy flow', () => {
    let props;
    let component;
    const valuesForAllFields = {email: 'test@test.com',
      password: 'test123'};
    const response = {
      isSuccessful: false,
      hasError: true,
      status: 401,
    };
  
    beforeEach(() => {
  
      props = {
        classes: {},
        context: {
          updaters: {
            showAlert: jest.fn(),
          },
          utils: {
            authenticator: {
              loginProjectOwner: jest.fn(() => {
                return new Promise(resolve => resolve(response));
              }),
            },
          },
        },
        valuesForAllFields: jest.fn(() => {
          return valuesForAllFields;
        }),
        validateAllFields: jest.fn(() => {
          return true;
        }),
      };

      component = shallow(<TestProjectOwnerLoginForm {...props}/>);
    });

    it('should invoke authenticator when handleSubmit is clicked', async () => {      

      const event = {
        preventDefault: jest.fn(),
      };
      component.dive().instance().handleSubmit(event);

      const {email, password} = valuesForAllFields;

      expect(component.props().context.utils.authenticator.loginProjectOwner).toHaveBeenCalledWith(email, password);
      expect(await component.props().context.utils.authenticator.loginProjectOwner(email, password)).toEqual(response);
    });

    it('should show failure alert when authentication failed', async () => {      

      const event = {
        preventDefault: jest.fn(),
      };
      component.dive().instance().handleSubmit(event);

      const {email, password} = valuesForAllFields;
      await component.props().context.utils.authenticator.loginProjectOwner(email, password);

      expect(component.props().context.updaters.showAlert).toHaveBeenCalledWith('loginFailure', AlertType.ERROR, LOGIN_FAILURE_MESSAGE);
    });
  });
  
  describe('sign up button', () => {
    let props;
    let component;
    beforeEach(() => {

      props = {
        classes: {},
        context: {
          updaters: {
            showAlert: jest.fn(),
          },
        },
      };
      
    });
    it('should exist', () => {

      component = shallow(<TestProjectOwnerLoginForm {...props}/>);

      const signUpButton = component.dive().find(Button).filterWhere(button => button.props().to === '/signup');

      expect(signUpButton.dive()).toBeTruthy();

    });
  });

  describe('Forgot password button', () => {
    let props;
    let component;
    beforeEach(() => {

      props = {
        classes: {},
        context: {
          updaters: {
            showAlert: jest.fn(),
          },
        },
        handlePasswordResetDialog: jest.fn(),
      };
      component = shallow(<TestProjectOwnerLoginForm {...props}/>);
      
    });
    it('should exist', () => {

      const forgotPasswordButton = component.dive().find(Button).at(1);
    
      expect(forgotPasswordButton.dive()).toBeTruthy();

    });

    it('onclick should passwordResetDialogOpen = true', () => { 

      const wrapper = component.dive(); 
      const forgotPasswordButton = wrapper.find(Button).at(1);

      expect(wrapper.state().passwordResetDialogOpen).toEqual(false);

      let dialog = wrapper.find(PasswordResetDialog);
      expect(dialog.prop('open')).toEqual(false);
      
      forgotPasswordButton.dive().simulate('click');

      expect(wrapper.state().passwordResetDialogOpen).toEqual(true);

      dialog = wrapper.find(PasswordResetDialog);
      expect(dialog.prop('open')).toEqual(true);

    });
  });
});