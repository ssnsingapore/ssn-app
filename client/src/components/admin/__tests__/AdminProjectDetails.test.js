import React from 'react';
import {
  ProjectMainInfo,
} from 'components/shared/ProjectMainInfo';
import {
  ProjectOwnerDetails,
} from '../../shared/ProjectOwnerDetails';
import {
  _testExports,
} from 'components/admin/admin_project_details/AdminProjectDetails';


const AdminProjectDetails = _testExports.AdminProjectDetails;

describe('AdminProjectDetails', () => {
  let component;
  let props;

  beforeAll(() => {
    props = {
      match: {
        params: {
          id: 'someId',
        },
      },
      classes: {
        root: '',
      },
      context: {
        utils: {
          requestWithAlert: {
            get: jest.fn(() => {
              return new Promise(resolve => resolve({
                isSuccessful: true,
                json: jest.fn(() => {
                  return new Promise(resolve => resolve({
                    project: '',
                  }));
                }),
              }));
            }),
          },
        },
      },
    };


    component = shallow( < AdminProjectDetails { ...props
      }
    / > );
  });

  it('should show ProjectMainInfo and ProjectOwnerDetails upon render', () => {
    expect(component.find(ProjectMainInfo).exists()).toBeTruthy();
    expect(component.find(ProjectOwnerDetails).exists()).toBeTruthy();
  });

  
});