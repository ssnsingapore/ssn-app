import React from 'react';
import { Button } from '@material-ui/core';

import { HomePage } from '../HomePage';
import { ProjectListing } from '../../shared/ProjectListing';
import { ProjectOwnerLoginForm } from '../ProjectOwnerLoginForm';

describe('Home page', () => {
  let component;

  beforeEach(() => {
    component = shallow(<HomePage></HomePage>).dive().dive();
  });

  it('should have a list of projects, a button to view all projects, and a login form', () => {
    const buttonProps = component.find(Button).props();

    expect(buttonProps.to).toEqual('/projects');
    expect(buttonProps.children).toEqual('View All Projects');
    expect(component.find(ProjectListing).exists()).toBeTruthy();
    expect(component.find(ProjectOwnerLoginForm).exists()).toBeTruthy();
  });
});