import React from 'react';
import { TextField, Button } from '@material-ui/core';

import { TestProjectOwnerSignUpForm } from 'components/public/ProjectOwnerSignUpForm';
import { AccountType } from 'components/shared/enums/AccountType';

describe('ProjectOwnerSignUpForm', () => {
  let props;
  let component;

  beforeEach(() => {

    props = {
      classes: {},
      renderOrganisationName: jest.fn(),
      context: {
        utils: {
          authenticator: {
            signUpProjectOwner: jest.fn(() => new Promise(resolve => resolve({ 
              hasError: true,
              status: 401, 
            }))),
          },
        },
        updaters: {
          showAlert: jest.fn(),
        },
      },
    };
    
    component = shallow(<TestProjectOwnerSignUpForm {...props}/>);
  });

  it('sets account type to organisation as a default field', () => {
    //dive to load HOC form component
    component.dive();

    expect(component.state('accountType').value).toEqual(AccountType.ORGANISATION);
  });

  xdescribe('constraints', () => {
    it('name text field displays error message', () => {
      const nameComponent = component.find(TextField).filterWhere(n => n.props().name === 'name');

      expect(nameComponent.props().error).toBeTruthy();
      expect(nameComponent.props().helperText).toBe('Name can\'t be blank');
    });

    it('email text field displays error message', () => {
      const emailComponent = component.find(TextField).filterWhere(n => n.props().name === 'email');
      
      expect(emailComponent.props().error).toBeTruthy();
      expect(emailComponent.props().helperText).toBe('Email can\'t be blank');
    });

    it('password text field displays error message', async() => {
      const createAccountButton = component.find(Button).filterWhere(n => n.text() === 'Create Account');
      await createAccountButton.simulate('submit');

      const passwordComponent = component.find(TextField).filterWhere(n => n.props().name === 'password');
      expect(passwordComponent.props().error).toBeTruthy();
      expect(passwordComponent.props().helperText).toBe('Password can\'t be blank');

    });

    it('when password does not match passwordConfirmation then validation message appears', async() => {
      const createAccountButton = component.find(Button).filterWhere(n => n.text() === 'Create Account');
      await createAccountButton.simulate('submit');

      const passwordConfirmationComponent = component.find(TextField).filterWhere(n => n.props().name === 'passwordConfirmation');
      expect(passwordConfirmationComponent.props().error).toBeTruthy();
      expect(passwordConfirmationComponent.props().helperText).toBe('Password confirmation should be the same as password');

    });

    it('when password is less than 6 chars then validation message appears', async() => {
      const createAccountButton = component.find(Button).filterWhere(n => n.text() === 'Create Account');
      await createAccountButton.simulate('submit');

      const passwordComponent = component.find(TextField).filterWhere(n => n.props().name === 'password');
      expect(passwordComponent.props().error).toBeTruthy();
      expect(passwordComponent.props().helperText).toBe('Password is too short (minimum is 6 characters)');

    });

    it('when email is invalid then validation message appears', async() => {
      const createAccountButton = component.find(Button).filterWhere(n => n.text() === 'Create Account');
      await createAccountButton.simulate('submit');

      const emailComponent = component.find(TextField).filterWhere(n => n.props().name === 'email');
      expect(emailComponent.props().error).toBeTruthy();
      expect(emailComponent.props().helperText).toBe('Email is not a valid email');
    });
  });
  //to be continued
  // describe('submit form', () => {
  //   fit('clicking create account button with all mandatory fields filled shows success sign up', async () => {
  //     const nameEvent = {
  //       target: {name: 'name', value: 'Some Name'},
  //     };
  //     component.instance().handleChange(nameEvent);
  //     const emailEvent = {
  //       target: {name: 'email', value: 'some@some.com'},
  //     };
  //     component.instance().handleChange(emailEvent);

  //     const passwordEvent = {
  //       target: {name: 'password', value: 'password123'},
  //     };
  //     component.instance().handleChange(passwordEvent);

  //     const passwordConfirmationEvent = {
  //       target: {name: 'passwordConfirmation', value: 'password123'},
  //     };
  //     component.instance().handleChange(passwordConfirmationEvent);

  //     component.update();

  //     const createAccountButton = component.find(Button).filterWhere(n => n.text() === 'Create Account');
  //     await createAccountButton.simulate('submit');

  //     const event = {
  //       preventDefault: jest.fn(),
  //     };
  //     //component.instance().handleSubmit(event);
  //     //console.log(component.debug());
  //     expect(component.find(Redirect).props().to).toEqual('/signup/confirmation');
  //   });
  //});
});