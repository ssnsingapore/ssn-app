import React from 'react';
import { Paper } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { Tab } from '@material-ui/core';

import { _AdminDashboard, ProjectStateMapping } from '../AdminDashboard';
import { Spinner } from 'components/shared/Spinner';
import { ProjectState } from 'components/shared/enums/ProjectState';
import { mockSuccessfulResponse } from 'util/testHelper';

describe('AdminDashboard', () => {
  let component;
  let adminDashboard;
  let counts;

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
    const props = {
      context: mockContext,
      location: {
        search: '?some=search-string',
      },
      history: {
        push: jest.fn(),
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

    component = shallow(<AdminDashboard {...props} />);
    adminDashboard = component.dive();
  });

  describe('handleChange', () => {
    it('sets the given tab value to state', () => {
      const value = 1;
      adminDashboard.instance().handleChange(null, value);

      expect(adminDashboard.state('tabValue')).toEqual(value);
    });

    it('adds current project state to history', () => {
      const value = 1;
      adminDashboard.instance().handleChange(null, value);

      expect(component.props().history.push).toHaveBeenCalledWith(`?page=1&projectState=${ProjectStateMapping[value]}`);
    });
  });

  describe('getTabLabel', () => {
    it('returns tabel label together with the number of project counts', () => {
      const tabLabel = adminDashboard.instance().getTabLabel(ProjectState.PENDING_APPROVAL);

      expect(tabLabel).toEqual('Pending Approval (1)');
    });
  });

  describe('render', () => {
    it('only renders spinner when page is loading', () => {
      adminDashboard.setState({ isLoading: true });

      expect(adminDashboard.find(Spinner)).toExist();
      expect(adminDashboard.find(Paper)).not.toExist();
    });

    it('displays tab labels with counts', () => {
      const pendingApprovalTab = adminDashboard.find(Tab).get(0);
      expect(pendingApprovalTab.props.label).toEqual(`Pending Approval (${counts[ProjectState.PENDING_APPROVAL]})`);
      const activeTab = adminDashboard.find(Tab).get(1);
      expect(activeTab.props.label).toEqual(`Active (${counts[ProjectState.APPROVED_ACTIVE]})`);
      const inactiveTab = adminDashboard.find(Tab).get(2);
      expect(inactiveTab.props.label).toEqual(`Inactive (${counts[ProjectState.APPROVED_INACTIVE]})`);
      const rejectedTab = adminDashboard.find(Tab).get(3);
      expect(rejectedTab.props.label).toEqual(`Rejected (${counts[ProjectState.REJECTED]})`);
    });

    it('renders the project listing for pending approval projects on the first tab', () => {
      adminDashboard.setState({
        tabValue: 0,
      });

      expect(adminDashboard.find('AdminProjectListing').props().projectState).toEqual(ProjectState.PENDING_APPROVAL);
    });

    it('renders the project listing for approved projects on the second tab', () => {
      adminDashboard.setState({
        tabValue: 1,
      });

      expect(adminDashboard.find('AdminProjectListing').props().projectState).toEqual(ProjectState.APPROVED_ACTIVE);
    });

    it('renders the project listing for inactive projects on the third tab', () => {
      adminDashboard.setState({
        tabValue: 2,
      });

      expect(adminDashboard.find('AdminProjectListing').props().projectState).toEqual(ProjectState.APPROVED_INACTIVE);
    });

    it('renders the project listing for rejected projects on the fourth tab', () => {
      adminDashboard.setState({
        tabValue: 3,
      });

      expect(adminDashboard.find('AdminProjectListing').props().projectState).toEqual(ProjectState.REJECTED);
    });
  });
});