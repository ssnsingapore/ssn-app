import React from 'react';
import Select from '@material-ui/core/Select';
import { createMount } from '@material-ui/core/test-utils';

import { _TestSearchBar } from '../SearchBar';

describe('SearchBar', () => {
  let mount, fieldNames;

  beforeEach(() => {
    mount = createMount();

    fieldNames = {
      issueAddressed: 'issueAddressed',
      projectLocations: 'projectLocations',
      months: 'months',
      volunteerRequirementType: 'volunteerRequirementType',
    };

    const formComponent = require('util/form');
    formComponent.getFieldNameObject = jest.fn().mockImplementation(() => {
      return fieldNames;
    });;

    formComponent.fieldValue = jest.fn().mockImplementation(() => '');
  });

  it('renders \'all categories\' for the issues addressed drop down menu when there is no selected input', () => {
    const component = mount(<_TestSearchBar />);

    const issueAddressedDropDown = component.find(Select).filterWhere(n => n.props().name === fieldNames.issueAddressed);

    expect(issueAddressedDropDown.props().value).toEqual('all categories');
  });

  it('renders \'all months\' for the months drop down menu when there is no selected input', () => {
    const component = mount(<_TestSearchBar />);

    const monthsDropDown = component.find(Select).filterWhere(n => n.props().name === fieldNames.months);

    expect(monthsDropDown.props().value).toEqual('all months');
  });

  it('renders \'all roles\' for the volunteer requirement type drop down menu when there is no selected input', () => {
    const component = mount(<_TestSearchBar />);

    const volunteerDropDown = component.find(Select).filterWhere(n => n.props().name === fieldNames.volunteerRequirementType);

    expect(volunteerDropDown.props().value).toEqual('all roles');
  });

  it('renders \'all areas\' for the project location drop down menu when there is no selected input', () => {
    const component = mount(<_TestSearchBar />);

    const projectLocationDropDown = component.find(Select).filterWhere(n => n.props().name === fieldNames.projectLocations);

    expect(projectLocationDropDown.props().value).toEqual('all areas');
  });
});