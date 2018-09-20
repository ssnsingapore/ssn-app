import React from 'react';
import validate from 'validate.js';

import { getFieldNameObject, fieldValue, withForm} from '../form';
import { SignUp } from '../../components/SignUp';

describe('getFieldNameObject', () => {
  it('returns fields used in the form that can be used like an enum', () => {
    const fieldNameEnum = getFieldNameObject(['name', 'email']);

    expect(fieldNameEnum).toEqual({name: 'name', email: 'email'});
  });
});

describe('fieldValue', () => {
  it('returns value of field given its field name', () => {
    const name = {
      value: 'Person',
    };
    const email = {
      value: 'person@gmail.com',
    }; 

    const fields = {
      name,
      email,
    };

    expect(fieldValue(fields, 'name')).toEqual('Person');
    expect(fieldValue(fields, 'email')).toEqual('person@gmail.com');
  });
});

describe('withForm', () => {
  describe('valuesForAllFields', () => {
    let fieldNames, component;
    
    beforeEach(() => {
      fieldNames = {
        name: 'name',
        email: 'email',
      };
      const FormComponent = withForm(fieldNames)(SignUp);
      component = shallow(<FormComponent></FormComponent>);
    });

    it('returns field values for all fields present on the form', () => {
      component.setState({
        [fieldNames.name]: {
          value: 'Person',
          error: [],
        },
        [fieldNames.email]: {
          value: 'person@gmail.com',
          error: [],
        },
      });

      const fieldValues = component.instance().valuesForAllFields();

      expect(fieldValues.name).toEqual('Person');
      expect(fieldValues.email).toEqual('person@gmail.com');
    });
   
    it('passes valuesForAllFields handler to SignUp component', () => {
      expect(component).toHaveProp('valuesForAllFields');
    });
  });

  describe('validateAllFields', () => {
    let fieldNames, component;
    
    beforeEach(() => {
      fieldNames = {
        name: 'name',
        email: 'email',
      };

      const constraints = {
        [fieldNames.name]: {
          presence: { 
            allowEmpty: false,
          },
        },
        [fieldNames.email]: {
          presence: { 
            allowEmpty: false,
          },
        },
      };
      const FormComponent = withForm(fieldNames, constraints)(SignUp);
      component = shallow(<FormComponent></FormComponent>);
    });

    it('returns false if there are validation errors', () => {
      component.setState({
        [fieldNames.name]: {
          value: '',
          error: [],
        },
        [fieldNames.email]: {
          value: '',
          error: [],
        },
      });

      expect(component.instance().validateAllFields()).toEqual(false);
    });

    it('updates state with error messages when there are validation errors', () => {
      component.setState({
        [fieldNames.name]: {
          value: '',
          error: [],
        },
        [fieldNames.email]: {
          value: '',
          error: [],
        },
      });

      component.instance().validateAllFields();

      expect(component.state().name.errors).toHaveLength(1);
      expect(component.state().email.errors).toHaveLength(1);
    });

    it('returns true when there are not validation errors', () => {
      component.setState({
        [fieldNames.name]: {
          value: 'Person',
          error: [],
        },
        [fieldNames.email]: {
          value: 'email@gmail.com',
          error: [],
        },
      });

      expect(component.instance().validateAllFields()).toEqual(true);
    });
  });

  describe('handleChange', () => {
    let component;

    beforeEach(() => {
      const fieldNames = {
        name: 'name',
        email: 'email',
      };
      const FormComponent = withForm(fieldNames)(SignUp);
      component = shallow(<FormComponent></FormComponent>);
    });

    it('updates field value in state', () => {
      const event = {
        target: {
          name: 'name',
          value: 'new name',  
        },
      };

      component.instance().handleChange(event);

      expect(component.state().name.value).toEqual('new name');
    });
  });

  describe('resetField', () => {
    let fieldNames, component;

    beforeEach(() => {
      fieldNames = {
        name: 'name',
        email: 'email',
      };
      const FormComponent = withForm(fieldNames)(SignUp);
      component = shallow(<FormComponent></FormComponent>);
    });

    it('resets field to an empty value', () => {
      component.setState({
        [fieldNames.name]: {
          value: 'Bob',
        },
      });

      component.instance().resetField(fieldNames.name);

      expect(component.state().name.value).toEqual('');
    });
  });

  describe('resetAllFields', () => {
    let fieldNames, component;

    beforeEach(() => {
      fieldNames = {
        name: 'name',
        email: 'email',
      };
      const FormComponent = withForm(fieldNames)(SignUp);
      component = shallow(<FormComponent></FormComponent>);
    });

    it('resets all fields to empty values', () => {
      component.setState({
        [fieldNames.name]: {
          value: 'Bob',
        },
        [fieldNames.email]: {
          value: 'Bob@gmail.com',
        },
      });

      component.instance().resetAllFields();

      expect(component.state().name.value).toEqual('');
      expect(component.state().email.value).toEqual('');
    });
  });

  describe('optionalUrl validator', () => {
    describe('allowEmpty is true', () => {
      const constraints = {
        webUrl: {
          isUrl: { allowEmpty: true },
        },
      };

      it('returns undefined when input is empty', () => {
        const input = {webUrl : ''};
  
        expect(validate(input, constraints)).toBe(undefined);
      });

      it('returns undefined when input is a url', () => {
        const validURLs = ['http://www.ssn-app.com', 
          'https://www.ssn-app.com', 
          'https://www.ssn-app.com',
        ];
        
        const validURLInputs = validURLs.map((url) => ({webUrl : url}));
  
        validURLInputs.forEach((input) => {
          expect(validate(input, constraints)).toBe(undefined);
        });
      });
    });
    
    describe('allowEmpty is false', () => {
      const constraints = {
        webUrl: {
          isUrl: { allowEmpty: false },
        },
      };

      it('returns error message when input is empty', () => {
        const input = {webUrl : ''};
  
        expect(validate(input, constraints).webUrl).toEqual(['Web url cannot be empty']);
      });

      it('returns undefined when input is a url', () => {
        const validURLs = ['http://www.ssn-app.com', 
          'https://www.ssn-app.com', 
          'https://www.ssn-app.com',
        ];
        
        const validURLInputs = validURLs.map((url) => ({webUrl : url}));
  
        validURLInputs.forEach((input) => {
          expect(validate(input, constraints)).toBe(undefined);
        });
      });
    });
  });
});