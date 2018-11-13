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
    it('allows volunteer type to be empty', () => {
      component.instance().setField(VolunteerRequirementFieldName.type, undefined);
      const form = component.dive().dive().dive();
  
      expect(form.find(Select).props().error).toEqual(false);
    });
  
    it('allows volunteer number to be empty', () => {
      component.instance().setField(VolunteerRequirementFieldName.number, undefined);
      const form = component.dive().dive().dive();
      
      expect(form.find(TextField).at(0).props().error).toEqual(false);
      expect(form.find(TextField).at(0).props().helperText).toEqual('');
    });
  
    it('displays error when volunteer number is not a number', () => {
      component.instance().setField(VolunteerRequirementFieldName.number, 'string');
  
      const form = component.dive().dive().dive();
      
      expect(form.find(TextField).at(0).props().error).toEqual(true);
      expect(form.find(TextField).at(0).props().helperText).toEqual(
        expect.stringContaining('is not a number')
      );
    });
  
    it('allows commitment level to be empty', () => {
      component.instance().setField(VolunteerRequirementFieldName.commitmentLevel, undefined);
      const form = component.dive().dive().dive();
      
      expect(form.find(TextField).at(1).props().error).toEqual(false);
      expect(form.find(TextField).at(1).props().helperText).toEqual('');
    });
  });
  
  describe('render', () => {
    it('displays all volunteer requirement types as options', () => {
      const form = component.dive().dive().dive();

      expect(form.find(MenuItem).length).toEqual(Object.values(VolunteerRequirementType).length);
    });
  });
});