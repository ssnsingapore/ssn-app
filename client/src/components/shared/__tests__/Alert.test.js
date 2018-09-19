import React from 'react';
import { SnackbarContent } from '@material-ui/core';
import { createShallow } from '@material-ui/core/test-utils';

import { Alert, AlertType } from '../Alert';



describe('Alert', () => {
  let shallow;

  beforeEach(() => {
    shallow = createShallow();
  });

  it('sets open to true on SnackBar depending when error isVisible', () => {
    const component = shallow(<Alert isVisible={true} type={AlertType.ERROR} />);
  
    expect(component.dive().props().open).toBe(true);
  });

  it('sets open to false on SnackBar when error is not visible', () => {
    const component = shallow(<Alert isVisible={false} type={AlertType.ERROR} />);
  
    expect(component.dive().props().open).toBe(false);
  });
  
  it('renders correct error message', () => {
    const errorMessage = 'error message';
    const component = shallow(<Alert message={errorMessage} type={AlertType.ERROR} />);
    
    expect(component.dive().find(SnackbarContent).dive().props().message.props.children[1]).toEqual(errorMessage);
  });
});