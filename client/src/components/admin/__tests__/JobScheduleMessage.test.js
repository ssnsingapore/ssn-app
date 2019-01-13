import React from 'react';
import { Typography } from '@material-ui/core';

import { _JobScheduleMessage as JobScheduleMessage } from '../JobScheduleMessage';
import { defaultAppContext } from 'components/main/AppContext';
import { mockSuccessfulResponse } from 'util/testHelper';

describe('JobScheduleMessage', () => {
  let component;
  const nextJobRunTime = 'Sunday 01-01-2001 01:01:01 GMT +8';

  beforeEach(() => {
    defaultAppContext.utils.requestWithAlert = {
      get: jest.fn(() => 
        Promise.resolve(mockSuccessfulResponse({ nextJobRunTime }))
      ),
    };

    const props = {
      context: defaultAppContext,
      classes: {
        root: '',
      },
    };

    component = shallow(<JobScheduleMessage {...props}/>);
  });
  
  it('displays next job run time', () => {
    console.log(component.debug());
    expect(component.find(Typography).dive().dive().text()).toEqual(
      `Projects past their event end dates will become inactive on  ${nextJobRunTime}`
    );
  });
});