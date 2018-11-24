import React from 'react';
import { 
  TextField,
  Select,
  MenuItem,
} from '@material-ui/core';

import { 
  VolunteerRequirementForm,
  VolunteerRequirementFieldName,
} from '../VolunteerRequirementForm';
import { VolunteerRequirementType } from 'components/shared/enums/VolunteerRequirementType';

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