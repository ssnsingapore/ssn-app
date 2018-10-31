import React from 'react';

import { TestProjectOwnerSignUpForm } from 'components/public/ProjectOwnerSignUpForm';
import { AccountType } from 'components/shared/enums/AccountType';
import { defaultAppContext } from 'components/main/AppContext';

describe('ProjectOwnerSignUpForm', () => {
  it('sets account type to organisation as a default field', () => {
    const component = shallow(<TestProjectOwnerSignUpForm />);
    //dive to load HOC form component
    component.dive();

    expect(component.state('accountType').value).toEqual(AccountType.ORGANISATION);
  });

  describe('constraints', () => {
    let component;

    beforeEach(() => {
      component = shallow(<TestProjectOwnerSignUpForm />);
    });

    it('when name is empty there is a validation error message', () => {
      component.instance().setField('name', '');

      expect(component.state('name').errors).toEqual(['Name can\'t be blank']);
    });

    it('when email is empty there is a validation error message', () => {
      component.instance().setField('email', '');

      expect(component.state('email').errors).toEqual(['Email can\'t be blank', 'Email is not a valid email']);
    });

    it('when password is empty there are validation error messages', async() => {
      component.instance().setField('password', '');

      expect(component.state('password').errors).toEqual(['Password can\'t be blank', 'Password is too short (minimum is 6 characters)']);
    });

    it('when password does not match passwordConfirmation then validation message appears', async() => {
      component.instance().setField('password', 'some password');
      component.instance().setField('passwordConfirmation', 'different password');

      expect(component.state('passwordConfirmation').errors).toEqual(['Password confirmation should be the same as password']);

    });

    it('when password is less than 6 chars then validation message appears', async() => {
      component.instance().setField('password', 'short');

      expect(component.state('password').errors).toEqual(['Password is too short (minimum is 6 characters)']);

    });

    it('when email is invalid then validation message appears', async() => {
      component.instance().setField('email', 'invalid email');

      expect(component.state('email').errors).toEqual(['Email is not a valid email']);
    });
  });

  describe('handleSubmit', () => {
    let mockEvent, mockContext, mockRefCurrent;

    const mockSuccessfulResponse = (body) => {
      const mockResponse = new Response(
        JSON.stringify(body),
      );
      mockResponse.isSuccessful = true;
      return mockResponse;
    };

    beforeEach(() => {
      mockEvent = {
        preventDefault: jest.fn(),
      };

      mockContext = { ...defaultAppContext };
      mockRefCurrent = { files: [new Blob()]};

      // Note: window.URL.createObjectURL is not a function in jsdom
      // see https://github.com/jsdom/jsdom/issues/1721
      window.URL.createObjectURL = jest.fn(() => 'some image src');
    });

    it('prevents default submission of form', () => {
      const component = shallow(<TestProjectOwnerSignUpForm />);

      const instance = component.dive().instance();
      instance.profilePhotoInput.current = mockRefCurrent;

      instance.handleSubmit(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('does not call authenticator if validation of fields returns false', () => {
      const props = {
        validateAllFields: jest.fn(() => false),
      };

      mockContext.utils.authenticator = {
        signUpProjectOwner: jest.fn(),
      };

      const component = shallow(<TestProjectOwnerSignUpForm {...props} context={mockContext} />);

      const instance = component.dive().instance();
      instance.profilePhotoInput.current = mockRefCurrent;

      instance.handleSubmit(mockEvent);

      expect(mockContext.utils.authenticator.signUpProjectOwner).not.toHaveBeenCalled();
    });

    it('calls authenticator with projectOwner details if there are no validation errors', async () => {
      const projectOwner = {
        name: 'owner',
        role: 'project owner',
      };

      const props = {
        validateAllFields: jest.fn(() => true),
        valuesForAllFields: jest.fn(() => projectOwner),
      };

      mockContext.utils.authenticator = {
        signUpProjectOwner: jest.fn(() => Promise.resolve(mockSuccessfulResponse({}))),
      };

      const component = shallow(<TestProjectOwnerSignUpForm {...props} context={mockContext} />);
      const instance = component.dive().instance();
      instance.profilePhotoInput.current = mockRefCurrent;
      instance.resizeImage = jest.fn(() => Promise.resolve(new Blob()));

      await instance.handleSubmit(mockEvent);

      expect(mockContext.utils.authenticator.signUpProjectOwner).toHaveBeenCalledWith(projectOwner);
    });

    it('sets created user to state after receiving successful response', async () => {
      const projectOwner = {
        name: 'owner',
        role: 'project owner',
      };

      const props = {
        validateAllFields: jest.fn(() => true),
      };

      mockContext.utils.authenticator = {
        signUpProjectOwner: jest.fn(() => Promise.resolve(mockSuccessfulResponse({ projectOwner }))),
      };

      const component = shallow(<TestProjectOwnerSignUpForm {...props} context={mockContext} />).dive();
      const instance = component.instance();
      instance.profilePhotoInput.current = mockRefCurrent;
      instance.resizeImage = jest.fn(() => Promise.resolve(new Blob()));

      await instance.handleSubmit(mockEvent);

      expect(component.state('createdUser')).toEqual(projectOwner);
    });
  });
});