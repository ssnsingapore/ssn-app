import React from 'react';
import { DialogTitle, Button } from '@material-ui/core';

import { AdminProjectApprovalConfirmationDialog } from '../AdminProjectApprovalConfirmationDialog';

describe('AdminProjectApprovalConfirmationDialog', () => {
  let component, props;
  
  beforeEach(() => {
    props = {
      handleClose: jest.fn(),
      handleApprove: jest.fn(),
      isSubmitting: true,
    };

    component = shallow(<AdminProjectApprovalConfirmationDialog {...props}/>);
  });
  
  it('should display dialog title', () => {
    expect(component.find(DialogTitle).html()).toEqual(
      expect.stringContaining('Approve Project')
    );
  });

  it('should have a No button which calls handleClose', () => {
    expect(
      component
        .find(Button)
        .at(0)
        .html()
    ).toEqual(expect.stringContaining('No'));

    component
      .find(Button)
      .at(0)
      .simulate('click');

    expect(props.handleClose).toHaveBeenCalled();
  });

  it('should have a Yes button which calls handleApprove', () => {
    expect(
      component
        .find(Button)
        .at(1)
        .html()
    ).toEqual(expect.stringContaining('Yes'));

    component
      .find(Button)
      .at(1)
      .simulate('click');

    expect(props.handleApprove).toHaveBeenCalled();
  });

  it('disables No button when isSubmitting is true', () => {
    expect(component.find(Button).at(0).props().disabled).toBe(true);
  });
});
