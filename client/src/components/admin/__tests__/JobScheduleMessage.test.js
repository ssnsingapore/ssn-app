import React from 'react';
import { Typography } from '@material-ui/core';

import { _JobScheduleMessage as JobScheduleMessage, errorMessage } from '../JobScheduleMessage';
import { defaultAppContext } from 'components/main/AppContext';
import { mockSuccessfulResponse, mockErrorResponse } from 'util/testHelper';

describe('JobScheduleMessage', () => {
  let component;
  const nextJobRunTime = 'Sunday 01-01-2001 01:01:01 GMT +8';

  describe('there is running job', () => {
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
      expect(component.find(Typography).dive().dive().text()).toEqual(
        `Projects past their event end dates will become inactive on  ${nextJobRunTime}`
      );
    });
  });

  describe('no running job', () => {
    beforeEach(() => {
      defaultAppContext.utils.requestWithAlert = {
        get: jest.fn(() => 
          Promise.resolve(mockErrorResponse())
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

    it('displays error message', () => {
      expect(component.find(Typography).dive().dive().text()).toEqual(errorMessage);
    });
  });
});