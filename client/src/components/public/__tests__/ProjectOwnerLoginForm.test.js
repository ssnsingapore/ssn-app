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
        updaters: jest.fn(),
      },
    };
    
    component = shallow(<TestProjectOwnerLoginForm {...props}/>);
  });

  describe('login',  () => {
    it('should show invalid email message when login with invalid email', async () => {
      const emailTextField = component.dive().find(TextField).filterWhere(n => n.props().name === 'email');
      expect(emailTextField.exists()).toBeTruthy();

      const event = {
        target: {name: 'email', value: 'invalid email'},
      };
      
      await component.instance().handleChange(event);
      component.update();
      console.log('email', emailTextField.debug());
      expect(emailTextField.props().error).toBeTruthy();
    });
  });
  
});