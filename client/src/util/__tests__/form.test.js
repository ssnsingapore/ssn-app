import React from 'react';
import validate from 'validate.js';

import {
  getFieldNameObject,
  fieldValue,
  withForm,
  fieldHasError,
  fieldErrorText,
} from '../form';

const DummyComponent = () => <div>Dummy Component</div>;

describe('getFieldNameObject', () => {
  it('returns fields used in the form that can be used like an enum', () => {
    const fieldNameEnum = getFieldNameObject(['name', 'email']);

    expect(fieldNameEnum).toEqual({ name: 'name', email: 'email' });
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

describe('fieldHasError', () => {
  it('returns true if field has error', () => {
    const name = {
      value: 'Person',
      errors: ['cannot be blank'],
    };

    expect(fieldHasError({ name }, 'name')).toBe(true);
  });
  it('returns false if field does not have error', () => {
    const name = {
      value: 'Person',
      errors: [],
    };

    expect(fieldHasError({ name }, 'name')).toBe(false);
  });
});

describe('fieldErrorText', () => {
  fit('returns a string of errors', () => {
    const fields = {
      name: {
        value: 'Person',
        errors: ['err1', 'err2', 'err3'],
      },
    };
    expect(fieldErrorText(fields, 'name')).toEqual('err1. err2. err3');
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
      const FormComponent = withForm(fieldNames)(DummyComponent);
      component = shallow(<FormComponent />);
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

    it('passes valuesForAllFields handler to DummyComponent component', () => {
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
      const FormComponent = withForm(fieldNames, constraints)(DummyComponent);
      component = shallow(<FormComponent />);
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

  // Note: Cannot get this test to fail even with the incorrect
  // implementation that assumes setState calls are synchronous
  // because Enzyme indeed processes such calls synchronously
  // whereas this is not actually guaranteed by React
  // see https://github.com/airbnb/enzyme/issues/1608#issuecomment-379896758
  describe('setField', () => {
    let component;
    let fieldNames;

    beforeEach(() => {
      fieldNames = {
        password: 'password',
        passwordConfirmation: 'passwordConfirmation',
      };
      const constraints = {
        [fieldNames.passwordConfirmation]: {
          equality: {
            attribute: fieldNames.password,
            message: 'should be the same as password',
          },
        },
      };
      const FormComponent = withForm(fieldNames, constraints)(DummyComponent);
      component = shallow(<FormComponent />);
    });

    it('should setState with the latest state when called in sequence', () => {
      const instance = component.instance();
      expect(instance.setField(fieldNames.password, 'password'));
      expect(instance.setField(fieldNames.passwordConfirmation, 'password'));

      expect(component.state()).toEqual({
        [fieldNames.password]: {
          value: 'password',
          errors: [],
        },
        [fieldNames.passwordConfirmation]: {
          value: 'password',
          errors: [],
        },
      });
    });

    describe('validation', () => {
      it('should validate based on the latest state when called in sequence', () => {
        const instance = component.instance();
        expect(instance.setField(fieldNames.password, 'password'));
        expect(instance.setField(fieldNames.passwordConfirmation, 'password2'));

        expect(component.state()).toEqual({
          [fieldNames.password]: {
            value: 'password',
            errors: [],
          },
          [fieldNames.passwordConfirmation]: {
            value: 'password2',
            errors: ['Password confirmation should be the same as password'],
          },
        });
      });
    });
  });

  describe('handleChange', () => {
    let component;

    beforeEach(() => {
      const fieldNames = {
        name: 'name',
        email: 'email',
      };
      const FormComponent = withForm(fieldNames)(DummyComponent);
      component = shallow(<FormComponent />);
    });

    describe('when the value is non-empty', () => {
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

    describe('when the value is empty', () => {
      it('sets the field value to undefined', () => {
        const event = {
          target: {
            name: 'name',
            value: '',
          },
        };

        component.instance().handleChange(event);

        expect(component.state().name.value).toBeUndefined();
      });
    });

    describe('when there are cross-field validations', () => {
      let fieldNames;

      beforeEach(() => {
        fieldNames = {
          smallest: 'smallest',
          middle: 'middle',
          largest: 'largest',
        };
        const constraints = {
          [fieldNames.smallest]: (value, attributes) => {
            return {
              numericality: {
                lessThan: attributes.middle,
              },
            };
          },
          [fieldNames.middle]: (value, attributes) => {
            return {
              numericality: {
                lessThan: attributes.largest,
                greaterThan: attributes.smallest,
              },
            };
          },
          [fieldNames.largest]: (value, attributes) => {
            return {
              numericality: {
                greaterThan: attributes.middle,
              },
            };
          },
        };
        const validateGroupsMap = {
          fields: {
            [fieldNames.smallest]: 'group',
            [fieldNames.middle]: 'group',
            [fieldNames.largest]: 'group',
          },
          validateGroups: {
            group: [fieldNames.smallest, fieldNames.middle, fieldNames.largest],
          },
        };
        const FormComponent = withForm(
          fieldNames,
          constraints,
          validateGroupsMap
        )(DummyComponent);
        component = shallow(<FormComponent />);
      });

      describe('when current field value changes to pass some cross-field validations', () => {
        it('should re-validate and remove errors on related fields', () => {
          const instance = component.instance();
          instance.setField(fieldNames.smallest, 10);
          instance.setField(fieldNames.middle, 8);
          instance.setField(fieldNames.largest, 4);
          instance.validateAllFields();

          let state = component.state();
          expect(state[fieldNames.smallest].errors).toHaveLength(1);
          expect(state[fieldNames.middle].errors).toHaveLength(2);
          expect(state[fieldNames.largest].errors).toHaveLength(1);

          const event = {
            target: {
              name: fieldNames.smallest,
              value: 6,
            },
          };

          instance.handleChange(event);

          state = component.state();
          expect(state[fieldNames.smallest].errors).toHaveLength(0);
          expect(state[fieldNames.middle].errors).toHaveLength(1);
          expect(state[fieldNames.largest].errors).toHaveLength(1);
        });
      });

      describe('when current field value changes to fail cross-field validation', () => {
        it('should re-validate and add errors to related fields', () => {
          const instance = component.instance();
          instance.setField(fieldNames.smallest, 5);
          instance.setField(fieldNames.middle, 6);
          instance.setField(fieldNames.largest, 7);
          instance.validateAllFields();

          let state = component.state();
          expect(state[fieldNames.smallest].errors).toHaveLength(0);
          expect(state[fieldNames.middle].errors).toHaveLength(0);
          expect(state[fieldNames.largest].errors).toHaveLength(0);

          const event = {
            target: {
              name: fieldNames.smallest,
              value: 8,
            },
          };

          instance.handleChange(event);

          state = component.state();
          expect(state[fieldNames.smallest].errors).toHaveLength(1);
          expect(state[fieldNames.middle].errors).toHaveLength(1);
          expect(state[fieldNames.largest].errors).toHaveLength(0);
        });
      });
    });
  });

  describe('resetField', () => {
    let fieldNames, component;

    beforeEach(() => {
      fieldNames = {
        name: 'name',
        email: 'email',
      };
      const FormComponent = withForm(fieldNames)(DummyComponent);
      component = shallow(<FormComponent />);
    });

    it('resets field to undefined', () => {
      component.setState({
        [fieldNames.name]: {
          value: 'Bob',
        },
      });

      component.instance().resetField(fieldNames.name);

      expect(component.state().name.value).toBeUndefined();
    });

    // Note: Cannot get this test to fail even with the incorrect
    // implementation that assumes setState calls are synchronous
    // because Enzyme indeed processes such calls synchronously
    // whereas this is not actually guaranteed by React
    // see https://github.com/airbnb/enzyme/issues/1608#issuecomment-379896758
    it('should reset fields correctly when called in sequence', () => {
      component.setState({
        [fieldNames.name]: {
          value: 'Bob',
          errors: ['some error'],
        },
        [fieldNames.email]: {
          value: 'bob@bob.com',
          errors: ['some error'],
        },
      });

      component.instance().resetField(fieldNames.name);
      component.instance().resetField(fieldNames.email);

      expect(component.state().name.value).toBeUndefined();
      expect(component.state().name.errors).toEqual([]);
      expect(component.state().email.value).toBeUndefined();
      expect(component.state().email.errors).toEqual([]);
    });
  });

  describe('resetAllFields', () => {
    let fieldNames, component;

    beforeEach(() => {
      fieldNames = {
        name: 'name',
        email: 'email',
      };
      const FormComponent = withForm(fieldNames)(DummyComponent);
      component = shallow(<FormComponent />);
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

      expect(component.state().name.value).toBeUndefined();
      expect(component.state().email.value).toBeUndefined();
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
        const input = { webUrl: '' };

        expect(validate(input, constraints)).toBe(undefined);
      });

      it('returns undefined when input is a url', () => {
        const validURLs = [
          'http://www.ssn-app.com',
          'https://www.ssn-app.com',
          'https://www.ssn-app.com',
          'www.ssn-app.com',
        ];

        const validURLInputs = validURLs.map(url => ({ webUrl: url }));

        validURLInputs.forEach(input => {
          expect(validate(input, constraints)).toBe(undefined);
        });
      });

      it('returns error message when input is an invalid url', () => {
        const invalidURLs = ['www.ssn-app', 'random string', 'abc.ssn-app'];

        const invalidURLInputs = invalidURLs.map(url => ({ webUrl: url }));

        invalidURLInputs.forEach(input => {
          expect(validate(input, constraints).webUrl).toEqual([
            'Web url is invalid',
          ]);
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
        const input = { webUrl: '' };

        expect(validate(input, constraints).webUrl).toEqual([
          'Web url cannot be empty',
        ]);
      });

      it('returns undefined when input is a url', () => {
        const validURLs = [
          'http://www.ssn-app.com',
          'https://www.ssn-app.com',
          'https://www.ssn-app.com',
          'www.ssn-app.com',
        ];

        const validURLInputs = validURLs.map(url => ({ webUrl: url }));

        validURLInputs.forEach(input => {
          expect(validate(input, constraints)).toBe(undefined);
        });
      });

      it('returns error message when input is an invalid url', () => {
        const invalidURLs = ['www.ssn-app', 'random string', 'abc.ssn-app'];

        const invalidURLInputs = invalidURLs.map(url => ({ webUrl: url }));

        invalidURLInputs.forEach(input => {
          expect(validate(input, constraints).webUrl).toEqual([
            'Web url is invalid',
          ]);
        });
      });
    });
  });
});
