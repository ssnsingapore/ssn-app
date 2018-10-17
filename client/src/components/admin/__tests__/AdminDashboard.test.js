import React from 'react';
import { Paper } from '@material-ui/core';

import { _testExports } from '../AdminDashboard';
import { Spinner } from 'components/shared/Spinner';

const AdminDashboard = _testExports.AdminDashboard;

const mockSuccessfulResponse = (body) => {
  const mockResponse = new Response(
    JSON.stringify(body),
  );
  mockResponse.isSuccessful = true;
  return mockResponse;
};

describe('AdminDashboard', () => {
  let component;

  beforeEach(() => {
    const counts = 100;

    const mockContext = {
      utils: {
        requestWithAlert: {
          get: jest.fn().mockImplementation(() => 
            new Promise((resolve) => resolve(mockSuccessfulResponse({ counts })))
          ),
        },
      },
    };

    const mockStyles = {
      root: '',
      tabHeader: '',
      headline: '',
      tabValue: '',
    };

    component = shallow(
      <AdminDashboard classes={mockStyles} context={mockContext} />
    );
  });

  it('only renders spinner when page is loading', () => { 
    component.setState({ isLoading : true });

    expect(component.find(Spinner)).toExist();
    expect(component.find(Paper)).not.toExist();
  });
});