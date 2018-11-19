import React from 'react';

import { _ProjectOwnerNewProjectForm } from '../ProjectOwnerNewProjectForm';
import { FieldName, constraints } from '../ProjectFormFields';
import { withForm } from 'util/form';

describe('ProjectOwnerNewProjectForm', () => {
  describe('valuesForAllSubFormFields', () => {
    let component, volunteerRequirementValues;

    beforeEach(() => {
      volunteerRequirementValues = {
        type: 'Event Planning',
        number: 1,
      };
      const ProjectOwnerNewProjectForm = withForm(FieldName, constraints)(
        _ProjectOwnerNewProjectForm
      );
      component = shallow(<ProjectOwnerNewProjectForm />).dive();
    });

    it('extracts values of volunteer requirement refs', () => {
      component.setState({
        volunteerRequirementRefs: [
          {
            current: {
              valuesForAllFields: jest.fn(() => volunteerRequirementValues),
            },
          },
        ],
      });

      expect(component.instance().valuesForAllSubFormFields()).toEqual([
        volunteerRequirementValues,
      ]);
    });

    it('does not return volunteer requirements if all values are undefined', () => {
      const emptyVolunteerRequirementValues = {
        type: undefined,
        number: undefined,
      };

      component.setState({
        volunteerRequirementRefs: [
          {
            current: {
              valuesForAllFields: jest.fn(() => volunteerRequirementValues),
            },
          },
          {
            current: {
              valuesForAllFields: jest.fn(() => emptyVolunteerRequirementValues),
            },
          },
        ],
      });

      expect(component.instance().valuesForAllSubFormFields()).toEqual([volunteerRequirementValues]);
    });
  });
});
