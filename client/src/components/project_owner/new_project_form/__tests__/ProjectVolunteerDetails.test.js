import React from 'react';
import { AddCircle, RemoveCircle } from '@material-ui/icons';

import { ProjectVolunteerDetails } from '../ProjectVolunteerDetails';
import { VolunteerRequirementForm } from '../VolunteerRequirementForm';


describe('ProjectVolunteerDetails', () => {
  let component;
  let FieldName;
  let fields;
  let volunteerRequirementRefs;
  let handleDeleteVolunteerRequirement;
  let handleAddVolunteerRequirement;

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

    volunteerRequirementRefs = {
      0: React.createRef(), 
      1: React.createRef(),
      2: React.createRef(),
    };

    handleDeleteVolunteerRequirement = jest.fn();
    handleAddVolunteerRequirement = jest.fn();

    const props = {
      fields,
      FieldName,
      volunteerRequirementRefs,
      volunteerRequirements: [],
      handleDeleteVolunteerRequirement,
      handleAddVolunteerRequirement,
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
    expect(component.find(VolunteerRequirementForm)).toHaveLength(3);
  });

  it('has a add icon that handles adding of volunteer row when clicked', () => {
    component.find(AddCircle).simulate('click');

    expect(handleAddVolunteerRequirement).toHaveBeenCalled();
  });

  it('has a remove icon that handles delete of correct volunteer row when clicked', () => {
    const rowNum = 0;
    component.find(RemoveCircle).at(rowNum).simulate('click');

    expect(handleDeleteVolunteerRequirement).toHaveBeenCalledWith(rowNum);
  });

  it('displays correct volunteer requirement rows after a row is deleted', async () => {
    const rowOneValue = 'Volunteer Type One';
    const rowTwoValue = 'Volunteer Type Two';
    const rowThreeValue = 'Volunteer Type Three';

    await component.find(VolunteerRequirementForm).get(0).ref.current.setField('type', rowOneValue);
    await component.find(VolunteerRequirementForm).get(1).ref.current.setField('type', rowTwoValue);
    await component.find(VolunteerRequirementForm).get(2).ref.current.setField('type', rowThreeValue);

    delete volunteerRequirementRefs[1];

    component.setProps({ volunteerRequirementRefs });

    expect(component.find(VolunteerRequirementForm)).toHaveLength(2);
    expect(component.find(VolunteerRequirementForm).get(0).ref.current.valuesForAllFields().type).toEqual(rowOneValue);
    expect(component.find(VolunteerRequirementForm).get(1).ref.current.valuesForAllFields().type).toEqual(rowThreeValue);
  });
});