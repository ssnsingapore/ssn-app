import React from 'react';

import { _ProjectOwnerNewProjectForm } from '../ProjectOwnerNewProjectForm';
import { FieldName, constraints } from '../ProjectFormFields';
import { withForm } from 'util/form';

jest.mock('../VolunteerRequirementForm');

describe('ProjectOwnerNewProjectForm', () => {
  let component;
  let mockVoluteerRequirementForm;

  beforeEach(() => {
    mockVoluteerRequirementForm = require('../VolunteerRequirementForm');
    const ProjectOwnerNewProjectForm = withForm(FieldName, constraints)(
      _ProjectOwnerNewProjectForm
    );
    component = shallow(<ProjectOwnerNewProjectForm />).dive();
  });

  describe('handleAddVolunteerRequirement', () => {
    it('sets state with updated volunteer requirements', () => {
      const expectedRefs = { 0: React.createRef() };
      mockVoluteerRequirementForm.addVolunteerRequirementRef = jest.fn(() => expectedRefs);

      component.instance().handleAddVolunteerRequirement();

      expect(component.state('volunteerRequirementRefs')).toEqual(expectedRefs);
    });
  });

  describe('handleDeleteVolunteerRequirement', () => {
    it('sets state with updated volunteer requirements', () => {
      const expectedRefs = { 0: React.createRef() };
      mockVoluteerRequirementForm.deleteVolunteerRequirementRef = jest.fn(() => expectedRefs);

      component.instance().handleDeleteVolunteerRequirement(1);

      expect(component.state('volunteerRequirementRefs')).toEqual(expectedRefs);
    });
  });

  describe('validateAllSubFormFields', () => {
    it('calls validateAllFields with volunteer requirement refs', () => {
      const volunteerRequirementRefs = { 
        0: React.createRef(),
        1: React.createRef(),
      };
      mockVoluteerRequirementForm.validateFormFields = jest.fn();
      component.setState({
        volunteerRequirementRefs,
      });

      component.instance().validateAllSubFormFields();

      expect(mockVoluteerRequirementForm.validateFormFields).toHaveBeenCalledWith(volunteerRequirementRefs);
    });
  });

  describe('resetAllSubFormFields', () => {
    it('calls resetAllFields with volunteer requirement refs', () => {
      const volunteerRequirementRefs = { 
        0: React.createRef(),
        1: React.createRef(),
      };
      mockVoluteerRequirementForm.resetAllFields = jest.fn();
      component.setState({
        volunteerRequirementRefs,
      });

      component.instance().resetAllSubFormFields();

      expect(mockVoluteerRequirementForm.resetAllFields).toHaveBeenCalledWith(volunteerRequirementRefs);
    });
  });

  describe('valuesForAllSubFormFields', () => {
    it('calls valuesForAllFields with volunteer requirement refs', () => {
      const volunteerRequirementRefs = { 
        0: React.createRef(),
        1: React.createRef(),
      };
      mockVoluteerRequirementForm.valuesForAllFields = jest.fn();
      component.setState({
        volunteerRequirementRefs,
      });

      component.instance().valuesForAllSubFormFields();

      expect(mockVoluteerRequirementForm.valuesForAllFields).toHaveBeenCalledWith(volunteerRequirementRefs);
    });
  });
});
