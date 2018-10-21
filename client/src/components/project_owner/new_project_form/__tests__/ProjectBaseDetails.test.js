import React from 'react';
import { TextField, Typography, CardMedia } from '@material-ui/core';

import { ProjectBaseDetails } from '../ProjectBaseDetails';
import { getFieldNameObject } from 'util/form';

const FieldName = getFieldNameObject([
  'title',
  'description',
  'volunteerSignupUrl',
]);

const fields = {
  title: {
    value: '',
    errors: [],
  },
  description: {
    value: '',
    errors: [],
  },
  volunteerSignupUrl: {
    value: '',
    errors: [],
  },
};

const shallowRender = () => {
  return shallow(
    <ProjectBaseDetails
      FieldName={FieldName}
      fields={fields}
      handleChange={jest.fn()}
    />
  ).dive();
};

describe('ProjectBaseDetails', () => {
  it('should have the new project headline, appropriate fields and cover image', () => {
    const component = shallowRender(<ProjectBaseDetails />);

    expect(component.find(Typography).html()).toEqual(
      expect.stringContaining('Add a New Project')
    );
    expect(component.find(TextField).at(0).prop('name')).toEqual('title');
    expect(component.find(TextField).at(1).prop('name')).toEqual('description');
    expect(component.find(TextField).at(2).prop('name')).toEqual('volunteerSignupUrl');
    expect(component.find(CardMedia).exists()).toBeTruthy();
  });
});