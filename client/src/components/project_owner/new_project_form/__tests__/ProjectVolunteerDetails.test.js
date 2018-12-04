import React from 'react';

import { ProjectVolunteerDetails } from '../ProjectVolunteerDetails';
import { VolunteerRequirementForm } from '../VolunteerRequirementForm';


describe('ProjectVolunteerDetails', () => {
  let component, FieldName, fields;

  beforeEach(() => {
    FieldName = {
      volunteerRequirementsDescription: 'volunteerRequirementsDescription',
      volunteerBenefitsDescription: 'volunteerBenefitsDescription',
    };

    fields = {
      [FieldName.volunteerRequirementsDescription]: {
        value: 'description for volunteer requirements',
        errors: [],
      },
      [FieldName.volunteerBenefitsDescription]: {
        value: 'description for volunteer benefits',
        errors: [],
      },
    };

    const props = {
      fields,
      FieldName,
      volunteerRequirementRefs: {
        0: React.createRef(), 
        1: React.createRef(),
      },
      volunteerRequirements: [],
    };

    component = mount(<ProjectVolunteerDetails {...props} />);
  });

  it('has Volunteer Details as its heading', () => {
    expect(component.find('Typography').text()).toEqual('Volunteer Details');
  });

  it('has text field for description of volunteers needed', () => {
    expect(component.find('TextField').get(0).props.label).toEqual('Description of Volunteers Needed');
    expect(component.find('TextField').get(0).props.name).toEqual(FieldName.volunteerRequirementsDescription);
    expect(component.find('TextField').get(0).props.value).toEqual(fields[FieldName.volunteerRequirementsDescription].value);
  });

  it('has text field for description of volunteer benefits', () => {
    const volunteerBenefitsField = component.find('TextField').filterWhere(field => field.props().id === FieldName.volunteerBenefitsDescription);

    expect(volunteerBenefitsField.props().label).toEqual('Volunteer Benefits');
    expect(volunteerBenefitsField.props().name).toEqual(FieldName.volunteerBenefitsDescription);
    expect(volunteerBenefitsField.props().value).toEqual(fields[FieldName.volunteerBenefitsDescription].value);
  });

  it('renders correct number of volunteer requirement rows', () => {
    expect(component.find(VolunteerRequirementForm)).toHaveLength(2);
  });
});