import React from 'react';

import { _ProjectOwnerEditProjectForm } from '../ProjectOwnerEditProjectForm';
import { FieldName, constraints } from '../ProjectFormFields';
import { withForm } from 'util/form';
import { defaultAppContext } from 'components/main/AppContext';

jest.mock('../VolunteerRequirementForm');

const mockSuccessfulResponse = (body) => {
  const mockResponse = new Response(
    JSON.stringify(body),
  );
  mockResponse.isSuccessful = true;
  return mockResponse;
};

describe('ProjectOwnerEditProjectForm', () => {
  let component;
  let mockVoluteerRequirementForm;

  beforeEach(() => {
    mockVoluteerRequirementForm = require('../VolunteerRequirementForm');
    const mockProject = {
      name: 'Mock Project',
    };
    const mockContext = {
      ...defaultAppContext,
      utils: {
        requestWithAlert: {
          get: jest.fn(() => mockSuccessfulResponse({ project: mockProject })),
        },
      },
    };
    const props = {
      context: mockContext,
      match: {
        params: {
          id: 1,
        },
      },
    };
    const ProjectOwnerEditProjectForm = withForm(FieldName, constraints)(_ProjectOwnerEditProjectForm);
    component = shallow(<ProjectOwnerEditProjectForm {...props} />).dive();
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