import Select from '@material-ui/core/Select';
import React from 'react';

import { SearchBar, TestSearchBar } from '../SearchBar';

describe('SearchBar', () => {
  let formComponent;

  beforeEach(() => {
    formComponent = require('util/form');
    formComponent.fieldValue = jest.fn();
    formComponent.fieldValue.mockClear();
    formComponent.fieldValue.mockImplementation(() => '');
  });

  it('renders \'all categories\' for the issues addressed drop down menu when there is no selected input', () => {
    const component = mount(<SearchBar />);
    const issueAddressedDropDown = component.find(Select).filterWhere(n => n.props().name === 'issueAddressed');

    expect(issueAddressedDropDown.props().value).toEqual('all categories');
  });

  it('renders \'all months\' for the months drop down menu when there is no selected input', () => {
    const component = mount(<SearchBar />);
    const monthsDropDown = component.find(Select).filterWhere(n => n.props().name === 'month');

    expect(monthsDropDown.props().value).toEqual('all months');
  });

  it('renders \'all roles\' for the volunteer requirement type drop down menu when there is no selected input', () => {
    const component = mount(<SearchBar />);
    const volunteerDropDown = component.find(Select).filterWhere(n => n.props().name === 'volunteerRequirementType');

    expect(volunteerDropDown.props().value).toEqual('all roles');
  });

  it('renders \'all areas\' for the project location drop down menu when there is no selected input', () => {
    const component = mount(<SearchBar />);
    const projectLocationDropDown = component.find(Select).filterWhere(n => n.props().name === 'projectLocation');

    expect(projectLocationDropDown.props().value).toEqual('all areas');
  });

  describe('renderOptions', () => {
    it('renders corresponding menu items for given options', () => {
      const mockStyles = {
        searchBox: '',
        resetButton: '',
      };
      
      const options = {
        1: 'first option',
        2: 'second option',
        3: 'third option',
      };

      const component = shallow(<TestSearchBar classes={mockStyles}/>);

      const menuItems = component.instance().renderOptions(options).map(option => option.props.value);

      expect(menuItems).toEqual(Object.values(options));
    });
  });
});