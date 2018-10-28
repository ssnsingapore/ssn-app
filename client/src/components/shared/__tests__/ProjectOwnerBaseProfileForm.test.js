import React from 'react';
import { TextField } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

import { _ProjectOwnerBaseProfileForm } from '../ProjectOwnerBaseProfileForm';
import { AccountType } from 'components/shared/enums/AccountType';

describe('ProjectOwnerBaseProfileForm', () => {
  let ProjectOwnerBaseProfileForm, FieldName, fields;
  
  beforeEach(() => {
    const mockStyles = {
      root: '',
      textInput: '',
      createButton: '',
    };

    FieldName = {
      name: 'name',
      email: 'email',
      description: 'description',
      accountType: 'accountType',
      organisationName: 'organisationName',
      personalBio: 'personalBio',
      websiteUrl: 'websiteUrl',
      socialMediaLink: 'socialMediaLink',
      password: 'password',
      passwordConfirmation: 'passwordConfirmation',
    };

    fields = {
      [FieldName.name]: {
        value: 'project owner name',
        errors: [],
      },
      [FieldName.email]: {
        value: 'test@test.com',
        errors: [],
      },
      [FieldName.description]: {
        value: 'descriptive text',
        errors: [],
      },
      [FieldName.accountType]: {
        value: AccountType.ORGANISATION,
        errors: [],
      },
      [FieldName.organisationName]: {
        value: 'green organisation',
        errors: [],
      },
      [FieldName.personalBio]: {
        value: '',
        errors: [],
      },
      [FieldName.websiteUrl]: {
        value: 'www.organisation.com',
        errors: [],
      },
      [FieldName.socialMediaLink]: {
        value: 'www.facebook.com/organisation',
        errors: [],
      },
      [FieldName.password]: {
        value: 'test123',
        errors: [],
      },
      [FieldName.passwordConfirmation]: {
        value: 'test123',
        errors: [],
      },
    };

    ProjectOwnerBaseProfileForm = withStyles(mockStyles)(_ProjectOwnerBaseProfileForm);
  });

  describe('when account type organisation is selected', () => {
    let component;

    beforeEach(() => {
      fields[FieldName.accountType].value = AccountType.ORGANISATION;
      component = shallow(<ProjectOwnerBaseProfileForm FieldName={FieldName} fields={fields} />).dive();
    });

    it('renders organisation name label', () => {
      const organisationNameComponent = component.find(TextField).filterWhere(n => n.props().name === 'organisationName');

      expect(organisationNameComponent.exists()).toBeTruthy();
    });

    it('does not render personal bio field', () => {
      const personalBioAfter = component.find(TextField).filterWhere(n => n.props().name === 'personalBio');

      expect(personalBioAfter.exists()).toBeFalsy();
    });
  });

  describe('when individual is selected', () => {
    let component;
    
    beforeEach(() => {
      fields[FieldName.accountType].value = AccountType.INDIVIDUAL;
      component = shallow(<ProjectOwnerBaseProfileForm FieldName={FieldName} fields={fields} />).dive();
    });

    it('does not render organisation name label', () => {
      const organisationNameComponent = component.find(TextField).filterWhere(n => n.props().name === 'organisationName');

      expect(organisationNameComponent.exists()).toBeFalsy();
    });

    it('renders personal bio field', () => {
      const personalBioAfter = component.find(TextField).filterWhere(n => n.props().name === 'personalBio');

      expect(personalBioAfter.exists()).toBeTruthy();
    });
  });

  describe('when there are validation errors', () => {
    let errorMessage;

    beforeEach(() => {
      errorMessage = 'can\'t be blank';

      Object.values(FieldName).forEach((field) => {
        fields[FieldName[field]].errors = [`${field} ${errorMessage}`];
      });
    });

    it('all text fields display error messages', () => {
      const component = shallow(<ProjectOwnerBaseProfileForm 
        FieldName={FieldName} 
        fields={fields} 
      />).dive();
      
      component.find(TextField).forEach(field => {
        expect(field.props().error).toBeTruthy();
        expect(field.props().helperText).toEqual(`${field.props().name} ${errorMessage}`);
      });
    });

  });
});