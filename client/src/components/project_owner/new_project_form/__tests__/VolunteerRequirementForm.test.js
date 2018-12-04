import React from 'react';
import { 
  TextField,
  Select,
  MenuItem,
} from '@material-ui/core';

import { 
  VolunteerRequirementForm,
  VolunteerRequirementFieldName,
  addVolunteerRequirementRef,
  deleteVolunteerRequirementRef,
  validateFormFields,
  resetAllFields,
  valuesForAllFields,
} from '../VolunteerRequirementForm';
import { VolunteerRequirementType } from 'components/shared/enums/VolunteerRequirementType';

describe('addVolunteerRequirementRef', () => {
  it('adds a new ref at index 0 if refs are empty', () => {
    const volunteerRequirementRefs = {};

    expect(addVolunteerRequirementRef(volunteerRequirementRefs)).toEqual({
      0: React.createRef(),
    });
  });

  it('appends a new ref at the next index', () => {
    const volunteerRequirementRefs = { 0: React.createRef() };

    expect(addVolunteerRequirementRef(volunteerRequirementRefs)).toEqual({
      0: React.createRef(),
      1: React.createRef(),
    });
  });
});

describe('deleteVolunteerRequirementRef', () => {
  it('returns empty object if given empty refs', () => {
    const volunteerRequirementRefs = {};

    expect(deleteVolunteerRequirementRef(volunteerRequirementRefs)).toEqual({});
  });

  it('deletes ref at given index', () => {
    const volunteerRequirementRefs = {
      0: React.createRef(),
      1: React.createRef(),
      2: React.createRef(),
    };
    const updatedRefs = deleteVolunteerRequirementRef(volunteerRequirementRefs, 1);

    expect(updatedRefs).toEqual({
      0: React.createRef(),
      2: React.createRef(),
    });
  });
});

describe('validateFormFields', () => {
  it('returns true if given empty refs', () => {
    expect(validateFormFields({})).toBe(true);
  });

  it('calls validate all fields on ref form', () => {
    const volunteerRequirementRef = {
      current: {
        validateAllFields: jest.fn(),
      },
    };
    const volunteerRequirementRefs = { 0: volunteerRequirementRef };
    
    validateFormFields(volunteerRequirementRefs);

    expect(
      volunteerRequirementRef.current.validateAllFields
    ).toHaveBeenCalled();
  });
});

describe('resetAllFields', () => {
  it('does not throw an error given empty refs', () => {
    expect(() => resetAllFields({})).not.toThrowError();
  });

  it('calls reset all fields on ref form', () => {
    const volunteerRequirementRef = {
      current: {
        resetAllFields: jest.fn(),
      },
    };
    const volunteerRequirementRefs = { 0: volunteerRequirementRef };
    
    resetAllFields(volunteerRequirementRefs);

    expect(volunteerRequirementRef.current.resetAllFields).toHaveBeenCalled();
  });
});

describe('valuesForAllFields', () => {
  let volunteerRequirementValues;
  let volunteerRequirementRef;

  beforeEach(() => {
    volunteerRequirementValues = {
      type: 'Event Planning',
      number: 1,
    };

    volunteerRequirementRef = {
      current: {
        valuesForAllFields: jest.fn(() => volunteerRequirementValues),
      },
    };
  });

  it('returns empty array when given empty volunteer requirement refs', () => {
    expect(valuesForAllFields({})).toEqual([]);
  });

  it('extracts values of volunteer requirement refs', () => {
    expect(valuesForAllFields({ 0: volunteerRequirementRef })).toEqual([
      volunteerRequirementValues,
    ]);
  });

  it('does not return volunteer requirements if all values are undefined', () => {
    const emptyVolunteerRequirementValues = {
      type: undefined,
      number: undefined,
    };
    const emptyVolunteerRequirementRef = {
      current: {
        valuesForAllFields: jest.fn(() => emptyVolunteerRequirementValues),
      },
    };
    const volunteerRequirementRefs = {
      0: volunteerRequirementRef,
      1: emptyVolunteerRequirementRef,
    };

    expect(valuesForAllFields(volunteerRequirementRefs)).toEqual([
      volunteerRequirementValues,
    ]);
  });
});

describe('VolunteerRequirementForm', () => {
  let component;
  
  beforeEach(() => {
    component = shallow(<VolunteerRequirementForm />);
  });
  
  describe('volunteerRequirementConstraints', () => {
    it('does not display an error if entire row of values are empty', () => {
      component.instance().setField(VolunteerRequirementFieldName.type, undefined);
      component.instance().setField(VolunteerRequirementFieldName.number, undefined);
      component.instance().setField(VolunteerRequirementFieldName.commitmentLevel, undefined);
      const form = component.dive().dive().dive();
      const volunteerTypeInput = form.find(Select);
      const volunteerNumberInput = form.find(TextField).at(0);
      const commitmentLevelInput = form.find(TextField).at(1);
      
      expect(volunteerTypeInput.props().error).toBe(false);
      expect(volunteerNumberInput.props().error).toBe(false);
      expect(volunteerNumberInput.props().helperText).toEqual('');
      expect(commitmentLevelInput.props().error).toBe(false);
      expect(commitmentLevelInput.props().helperText).toEqual('');
    });

    it('displays error when volunteer type is empty but volunteer number is defined', () => {
      component.instance().setField(VolunteerRequirementFieldName.number, 1);
      component.instance().setField(VolunteerRequirementFieldName.type, undefined);
      const form = component.dive().dive().dive();
      const volunteerTypeInput = form.find(Select);

      expect(volunteerTypeInput.props().error).toBe(true);
    });

    it('displays error when volunteer type is empty but commitment level is defined', () => {
      component.instance().setField(VolunteerRequirementFieldName.commitmentLevel, 'high');
      component.instance().setField(VolunteerRequirementFieldName.type, undefined);
      const form = component.dive().dive().dive();
      const volunteerTypeInput = form.find(Select);

      expect(volunteerTypeInput.props().error).toBe(true);
    });

    it('displays error when volunteer type is not a volunteer requirement type', () => {
      component.instance().setField(VolunteerRequirementFieldName.type, 'invalid value');
      const form = component.dive().dive().dive();
      const volunteerTypeInput = form.find(Select);

      expect(volunteerTypeInput.props().error).toBe(true);
    });

    it('displays error when volunteer number is empty but volunteer type is defined', () => {
      component.instance().setField(VolunteerRequirementFieldName.type, VolunteerRequirementType.EVENT_PLANNING);
      component.instance().setField(VolunteerRequirementFieldName.number, undefined);
      const form = component.dive().dive().dive();
      const volunteerNumberInput = form.find(TextField).at(0);

      expect(volunteerNumberInput.props().error).toBe(true);
      expect(volunteerNumberInput.props().helperText).toEqual(
        expect.stringContaining('can\'t be blank')
      );
    });

    it('displays error when volunteer number is empty but commitment level is defined', () => {
      component.instance().setField(VolunteerRequirementFieldName.commitmentLevel, 'high');
      component.instance().setField(VolunteerRequirementFieldName.number, undefined);
      const form = component.dive().dive().dive();
      const volunteerNumberInput = form.find(TextField).at(0);

      expect(volunteerNumberInput.props().error).toBe(true);
      expect(volunteerNumberInput.props().helperText).toEqual(
        expect.stringContaining('can\'t be blank')
      );
    });
   
    it('displays error when volunteer number is not a number', () => {
      component.instance().setField(VolunteerRequirementFieldName.number, 'string');
      const form = component.dive().dive().dive();
      const volunteerNumberInput = form.find(TextField).at(0);      

      expect(volunteerNumberInput.props().error).toEqual(true);
      expect(volunteerNumberInput.props().helperText).toEqual(
        expect.stringContaining('is not a number')
      );
    });

    it('displays error when commitment level is empty but volunteer type is defined', () => {
      component.instance().setField(VolunteerRequirementFieldName.type, VolunteerRequirementType.EVENT_PLANNING);
      component.instance().setField(VolunteerRequirementFieldName.commitmentLevel, undefined);
      const form = component.dive().dive().dive();
      const commitmentLevelInput = form.find(TextField).at(1);

      expect(commitmentLevelInput.props().error).toBe(true);
      expect(commitmentLevelInput.props().helperText).toEqual(
        expect.stringContaining('can\'t be blank')
      );
    });

    it('displays error when commitment level is empty but volunteer number is defined', () => {
      component.instance().setField(VolunteerRequirementFieldName.number, 1);
      component.instance().setField(VolunteerRequirementFieldName.commitmentLevel, undefined);
      const form = component.dive().dive().dive();
      const commitmentLevelInput = form.find(TextField).at(1);

      expect(commitmentLevelInput.props().error).toBe(true);
      expect(commitmentLevelInput.props().helperText).toEqual(
        expect.stringContaining('can\'t be blank')
      );
    });
  });
  
  describe('render', () => {
    it('displays all volunteer requirement types as options', () => {
      const form = component.dive().dive().dive();

      expect(form.find(MenuItem).length).toEqual(Object.values(VolunteerRequirementType).length);
    });
  });
});