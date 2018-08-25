import React from 'react';

import App from '../App';

jest.mock('util/Authenticator');

describe('App', () => {
  it('displays alert when isVisible is true', () => {
    const component = mount(<App></App>);
    const alerts = {
      someError : {
        type: 'ERROR',
        message: 'error message',
        isVisible: true,
      },
    };

    component.setState({ alerts });

    expect(component.find('SnackbarContent')).toHaveLength(1);
  });

  it('does not displays alert when isVisible is false', () => {
    const component = mount(<App></App>);
    const alerts = {
      someError : {
        type: 'ERROR',
        message: 'error message',
        isVisible: false,
      },
    };

    component.setState({ alerts });

    expect(component.find('SnackbarContent')).toHaveLength(0);
  });
});

