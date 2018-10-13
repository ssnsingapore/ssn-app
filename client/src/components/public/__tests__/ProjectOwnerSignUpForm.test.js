import React from 'react';
import { TestProjectOwnerSignUpForm } from 'components/public/ProjectOwnerSignUpForm';
import { TextField, FormControlLabel, Button } from '@material-ui/core';
import { AccountType } from 'components/shared/enums/AccountType';

describe('ProjectOwnerSignUpForm', () => {
  let props;
  let component;

  beforeEach(() => {

    props = {
      classes: {},
      renderOrganisationName: jest.fn(),
    };
    
    component = mount(<TestProjectOwnerSignUpForm {...props}/>);
  });

  describe('radioButtons', () => {
    it('default is organisation', () => {

      const organisationRadio = component.find(FormControlLabel).filterWhere(n => n.props().value === AccountType.ORGANISATION);
      expect(organisationRadio.props().checked).toBeTruthy();
    });

    it('when organisation is selected then organisation name label exists', () => {

      const organisationNameComponent = component.find(TextField).filterWhere(n => n.props().name === 'organisationName');
      expect(organisationNameComponent.exists()).toBeTruthy();
    });

    it('when individual is selected then organisation name label does not exist', () => {

      const individualRadio = component.find(FormControlLabel).filterWhere(n => n.props().value === AccountType.INDIVIDUAL);
      expect(individualRadio.props().checked).toBeFalsy();

      const event = {
        target: {name: 'accountType', value: AccountType.INDIVIDUAL},
      };
      component.instance().handleChange(event);
      component.update();

      const organisationRadio = component.find(FormControlLabel).filterWhere(n => n.props().value === AccountType.ORGANISATION);
      expect(organisationRadio.props().checked).toBeFalsy();

      const individualRadioNew = component.find(FormControlLabel).filterWhere(n => n.props().value === AccountType.INDIVIDUAL);
      expect(individualRadioNew.props().checked).toBeTruthy();

      const organisationNameComponent = component.find(TextField).filterWhere(n => n.props().name === 'organisationName');
      expect(organisationNameComponent.exists()).toBeFalsy();
    });

    it('when individual is selected then personal bio field appears', () => {
  
      const individualRadio = component.find(FormControlLabel).filterWhere(n => n.props().value === AccountType.INDIVIDUAL);
      expect(individualRadio.props().checked).toBeFalsy();

      const personalBioBefore = component.find(TextField).filterWhere(n => n.props().name === 'personalBio');
      expect(personalBioBefore.exists()).toBeFalsy();
      
      const event = {
        target: {name: 'accountType', value: AccountType.INDIVIDUAL},
      };
      component.instance().handleChange(event);
      component.update();
  
      const personalBioAfter = component.find(TextField).filterWhere(n => n.props().name === 'personalBio');
      expect(personalBioAfter.exists()).toBeTruthy();
    });
  });

  describe('filling up mandatory fields', () => {
    it('when name is not provided then validation message appears', async() => {

      const createAccountButton = component.find(Button).filterWhere(n => n.text() === 'Create Account');
      await createAccountButton.simulate('submit');

      const nameComponent = component.find(TextField).filterWhere(n => n.props().name === 'name');
      expect(nameComponent.props().error).toBeTruthy();
      expect(nameComponent.props().helperText).toBe('Name can\'t be blank');
    });
    it('when email is not provided then validation message appears', async() => {

      const event = {
        target: {name: 'name', value: 'Some Name'},
      };
      component.instance().handleChange(event);
      component.update();

      const createAccountButton = component.find(Button).filterWhere(n => n.text() === 'Create Account');
      await createAccountButton.simulate('submit');

      const emailComponent = component.find(TextField).filterWhere(n => n.props().name === 'email');
      expect(emailComponent.props().error).toBeTruthy();
      expect(emailComponent.props().helperText).toBe('Email can\'t be blank. Email is not a valid email');
    });

    it('when email is invalid then validation message appears', async() => {

      const nameEvent = {
        target: {name: 'name', value: 'Some Name'},
      };
      component.instance().handleChange(nameEvent);
      const emailEvent = {
        target: {name: 'email', value: 'invalid'},
      };
      component.instance().handleChange(emailEvent);

      const createAccountButton = component.find(Button).filterWhere(n => n.text() === 'Create Account');
      await createAccountButton.simulate('submit');

      const emailComponent = component.find(TextField).filterWhere(n => n.props().name === 'email');
      expect(emailComponent.props().error).toBeTruthy();
      expect(emailComponent.props().helperText).toBe('Email is not a valid email');
    });
  });
  // describe('submit form', () => {
  //   it('clicking create account button with all mandatory fields filled shows success sign up', async () => {
  //     const nameEvent = {
  //       target: {name: 'name', value: 'Some Name'},
  //     };
  //     component.instance().handleChange(nameEvent);
  //     const emailEvent = {
  //       target: {name: 'email', value: 'some@some.com'},
  //     };
  //     component.instance().handleChange(emailEvent);

  //     component.update();

  //     const createAccountButton = component.find(Button).filterWhere(n => n.text() === 'Create Account');
  //     await createAccountButton.simulate('submit');

  //     const event = {
  //       preventDefault: jest.fn(),
  //     };
  //     component.instance().handleSubmit(event);

  //     expect(component.instance().handleSubmit).toHaveBeenCalled();

  //   });
  // });
});