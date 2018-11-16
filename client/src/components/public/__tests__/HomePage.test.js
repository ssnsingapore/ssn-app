import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';

import { _HomePage } from '../HomePage';
import { PublicProjectListing } from 'components/shared/PublicProjectListing';
import { ProjectOwnerLoginForm } from '../ProjectOwnerLoginForm';
import { defaultAppContext } from 'components/main/AppContext';

describe('HomePage', () => {
  let component;

  beforeEach(() => {
    const mockTheme = {
      spacing: {
        unit: 1,
      },
    };
    const mockStyles = {};
    defaultAppContext.utils.requestWithAlert = {
      get: jest.fn(() => Promise.resolve({})),
    };
    const mockContext = {
      ...defaultAppContext,
    };

    const HomePage = withStyles(mockStyles)(_HomePage);
    component = shallow(<HomePage theme={mockTheme} context={mockContext} />).dive();
  });

  it('should have a list of projects, a button to view all projects, and a login form', () => {
    const buttonProps = component.find(Button).props();

    expect(buttonProps.to).toEqual('/projects');
    expect(buttonProps.children).toEqual('View All Projects');
    expect(component.find(PublicProjectListing).exists()).toBeTruthy();
    expect(component.find(ProjectOwnerLoginForm).exists()).toBeTruthy();
  });
});