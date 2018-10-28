import React from 'react';
import { TextField } from '@material-ui/core';
import { TestProjectOwnerLoginForm } from 'components/public/ProjectOwnerLoginForm';
import { AlertType } from 'components/shared/Alert';

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
    });
  });

  describe('handleSubmit not so happy flow',  () => {
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
  
});