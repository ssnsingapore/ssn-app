import React from 'react';
import { TextField } from '@material-ui/core';
import { TestProjectOwnerLoginForm } from 'components/public/ProjectOwnerLoginForm';

describe('ProjectOwnerLoginForm', () => {
  let props;
  let component;

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
      validateAllFields: jest.fn(() => {
        return true;
      }),
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
    let email;
    let password;
  
    beforeEach(() => {
      email = 'test@test.com';
      password = 'test123';
  
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
        validateAllFields: jest.fn(() => {
          return true;
        }),
        valuesForAllFields: jest.fn(() => {
          return {
            email,
            password, 
          };
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

      expect(component.props().context.utils.authenticator.loginProjectOwner).toHaveBeenCalledWith(email, password);
    });
  });
  
});