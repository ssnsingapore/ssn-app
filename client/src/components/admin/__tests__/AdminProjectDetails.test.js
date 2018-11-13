import React from 'react';
import {
  ProjectMainInfo,
} from 'components/shared/ProjectMainInfo';
import {
  ProjectOwnerDetails,
} from '../../shared/ProjectOwnerDetails';
import {
  ProjectState,
} from '../../shared/enums/ProjectState';
import {
  _testExports,
} from 'components/admin/admin_project_details/AdminProjectDetails';
import {
  Button,
} from '@material-ui/core';
import {
  AdminProjectApprovalConfirmationDialog,
} from '../admin_project_details/AdminProjectApprovalConfirmationDialog';

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

  describe('approve projects', () => {
    beforeAll(() => {
      component.setState({
        project: {
          state: ProjectState.PENDING_APPROVAL,
        },
      });
    });

    it('should show approve and reject buttons', () => {

      const approveButton = component.find(Button).filterWhere(button => button.props().children === 'Approve');
      const rejectButton = component.find(Button).filterWhere(button => button.props().children === 'Reject');

      expect(approveButton).toBeTruthy();
      expect(rejectButton).toBeTruthy();
    });

    it('should open approve confirmation dialog when click on approve', () => {
      const approveButton = component.find(Button).filterWhere(button => button.props().children === 'Approve');
      approveButton.simulate('click');

      expect(component.find(AdminProjectApprovalConfirmationDialog).exists()).toBeTruthy();
    });
  });
});