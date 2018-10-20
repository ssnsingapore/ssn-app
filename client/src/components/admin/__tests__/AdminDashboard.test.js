import React from 'react';
import { Paper } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { Tab } from '@material-ui/core'; 

import { _AdminDashboard } from '../AdminDashboard';
import { Spinner } from 'components/shared/Spinner';
import { ProjectState } from 'components/shared/enums/ProjectState';

const mockSuccessfulResponse = (body) => {
  const mockResponse = new Response(
    JSON.stringify(body),
  );
  mockResponse.isSuccessful = true;
  return mockResponse;
};

describe('AdminDashboard', () => {
  let component, counts;

  beforeEach(() => {
    counts = {
      [ProjectState.PENDING_APPROVAL]: 1,
      [ProjectState.APPROVED_ACTIVE]: 2,
      [ProjectState.APPROVED_INACTIVE]: 3,
      [ProjectState.REJECTED]: 4,
    };

    const mockContext = {
      utils: {
        requestWithAlert: {
          get: jest.fn(() => Promise.resolve(mockSuccessfulResponse({ counts }))),
        },
      },
    };

    const mockStyles = {
      root: '',
      tabHeader: '',
      headline: '',
      tabValue: '',
      tabContainer: '',
    };

    const AdminDashboard = withStyles(mockStyles)(_AdminDashboard);

    component = shallow(<AdminDashboard context={mockContext} />).dive();
  });

  describe('handleChange', () => {
    it('sets the given tab value to state', () => {
      component.instance().handleChange(null, 1);

      expect(component.state('tabValue')).toEqual(1);
    });
  });

  describe('getTabLabel', () => {
    it('returns tabel label together with the number of project counts', () => {
      const tabLabel = component.instance().getTabLabel(ProjectState.PENDING_APPROVAL);

      expect(tabLabel).toEqual('Pending Approval (1)');
    });
  });

  describe('render', () => {
    it('only renders spinner when page is loading', () => {
      component.setState({ isLoading : true });
  
      expect(component.find(Spinner)).toExist();
      expect(component.find(Paper)).not.toExist();
    });
  
    it('displays tab labels with counts', () => {
      const pendingApprovalTab = component.find(Tab).get(0);
      expect(pendingApprovalTab.props.label).toEqual(`Pending Approval (${counts[ProjectState.PENDING_APPROVAL]})`);
      const activeTab = component.find(Tab).get(1);
      expect(activeTab.props.label).toEqual(`Active (${counts[ProjectState.APPROVED_ACTIVE]})`);
      const inactiveTab = component.find(Tab).get(2);
      expect(inactiveTab.props.label).toEqual(`Inactive (${counts[ProjectState.APPROVED_INACTIVE]})`);
      const rejectedTab = component.find(Tab).get(3);
      expect(rejectedTab.props.label).toEqual(`Rejected (${counts[ProjectState.REJECTED]})`);
    });

    it('renders the project listing for pending approval projects on the first tab', () => {
      component.setState({ 
        tabValue: 0, 
      });

      expect(component.find('ProjectListing').props().projectState).toEqual(ProjectState.PENDING_APPROVAL);
    });

    it('renders the project listing for approved projects on the second tab', () => {
      component.setState({ 
        tabValue: 1, 
      });

      expect(component.find('ProjectListing').props().projectState).toEqual(ProjectState.APPROVED_ACTIVE);
    });

    it('renders the project listing for inactive projects on the third tab', () => {
      component.setState({ 
        tabValue: 2, 
      });

      expect(component.find('ProjectListing').props().projectState).toEqual(ProjectState.APPROVED_INACTIVE);
    });

    it('renders the project listing for rejected projects on the fourth tab', () => {
      component.setState({ 
        tabValue: 3, 
      });

      expect(component.find('ProjectListing').props().projectState).toEqual(ProjectState.REJECTED);
    });
  });
});