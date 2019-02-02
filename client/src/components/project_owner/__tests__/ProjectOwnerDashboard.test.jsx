import React from 'react';
import { Tabs, Tab, Typography, Fab } from '@material-ui/core';
import { createMuiTheme } from '@material-ui/core/styles';

import { _testExports } from '../ProjectOwnerDashboard';
import { defaultAppContext } from 'components/main/AppContext';
import { AlertType } from 'components/shared/Alert';
import { Spinner } from 'components/shared/Spinner';
import { ProjectState } from 'components/shared/enums/ProjectState';
import { ProjectOwnerProjectListing } from 'components/project_owner/ProjectOwnerProjectListing';
import { mockSuccessfulResponse, mockErrorResponse } from 'util/testHelper';

const ProjectOwnerDashboard = _testExports.ProjectOwnerDashboard;

describe('ProjectOwnerDashboard', () => {
  let component;
  let counts;
  let mockContext;
  const theme = createMuiTheme();

  beforeEach(() => {
    counts = {
      [ProjectState.PENDING_APPROVAL]: 0,
      [ProjectState.APPROVED_ACTIVE]: 1,
      [ProjectState.APPROVED_INACTIVE]: 2,
      [ProjectState.REJECTED]: 3,
    };
    const mockResponse = mockSuccessfulResponse({ counts });
    mockContext = { ...defaultAppContext };
    mockContext.utils.requestWithAlert = {
      get: jest.fn(() => Promise.resolve(mockResponse)),
    };
    mockContext.updaters.showAlert = jest.fn();
    const props = {
      theme,
      classes: {},
      context: mockContext,
      location: {
        search: '?some=search-string',
      },
    };
    component = shallow(
      <ProjectOwnerDashboard {...props} />,
      { disableLifecycleMethods: true },
    );
  });

  describe('when component mounts', () => {
    it('should fetch project counts and set loading state', async () => {
      expect(component.state().isLoading).toBeTruthy();
      expect(component.state().counts).toEqual({});

      await component.instance().componentDidMount();

      expect(component.state().isLoading).toBeFalsy();
      expect(component.state().counts).toEqual(counts);
    });

    describe('when there is an error fetching project counts', () => {
      const errorsObject = {
        errors: [
          { title: 'some error', detail: 'some error' },
        ],
      };

      beforeEach(() => {
        const mockResponse = mockErrorResponse(errorsObject);
        mockContext = { ...defaultAppContext };
        mockContext.utils.requestWithAlert = {
          get: jest.fn(() => Promise.resolve(mockResponse)),
        };
        mockContext.updaters.showAlert = jest.fn();
        const props = {
          theme,
          classes: {},
          context: mockContext,
          location: {
            search: '?some=search-string',
          },
        };

        component = shallow(
          <ProjectOwnerDashboard {...props} />,
          { disableLifecycleMethods: true },
        );
      });

      it('should show an error alert', async () => {
        await component.instance().componentDidMount();

        expect(mockContext.updaters.showAlert).toHaveBeenCalledWith(
          'getProjectCountsFailure',
          AlertType.ERROR,
          expect.any(String),
        );
      });

      it('should render tab labels without counts in brackets', async () => {
        await component.instance().componentDidMount();

        const pendingApprovalTab = component.find(Tab).get(0);
        expect(pendingApprovalTab.props.label).toEqual('Pending Approval');
        const activeTab = component.find(Tab).get(1);
        expect(activeTab.props.label).toEqual('Active');
        const inactiveTab = component.find(Tab).get(2);
        expect(inactiveTab.props.label).toEqual('Inactive');
        const rejectedTab = component.find(Tab).get(3);
        expect(rejectedTab.props.label).toEqual('Rejected');
      });
    });
  });

  describe('render', () => {
    beforeEach(async (done) => {
      await component.instance().componentDidMount();
      done();
    });

    it('should render a header with a floating action button to add new projects', () => {
      expect(component.find(Typography).html()).toEqual(expect.stringContaining('My Projects'));
      expect(component.find(Fab).props().to).toEqual('/project_owner/projects/new');
    });

    describe('when loading', () => {
      it('should render a spinner instead of tabs', () => {
        component.setState({ isLoading: true });
        component.update();

        expect(component.find(Spinner).exists()).toBeTruthy();
        expect(component.find(Tabs).exists()).toBeFalsy();
      });
    });

    describe('when no longer loading', () => {
      it('should render all tab labels', () => {
        const pendingApprovalTab = component.find(Tab).get(0);
        expect(pendingApprovalTab.props.label).toEqual(`Pending Approval (${counts[ProjectState.PENDING_APPROVAL]})`);
        const activeTab = component.find(Tab).get(1);
        expect(activeTab.props.label).toEqual(`Active (${counts[ProjectState.APPROVED_ACTIVE]})`);
        const inactiveTab = component.find(Tab).get(2);
        expect(inactiveTab.props.label).toEqual(`Inactive (${counts[ProjectState.APPROVED_INACTIVE]})`);
        const rejectedTab = component.find(Tab).get(3);
        expect(rejectedTab.props.label).toEqual(`Rejected (${counts[ProjectState.REJECTED]})`);
      });

      describe('when pending approval tab selected', () => {
        it('should render project listing with pending approval project state', () => {
          component.setState({ tabValue: 0 });
          component.update();

          expect(component.find(ProjectOwnerProjectListing).props().projectState).toEqual(ProjectState.PENDING_APPROVAL);
        });
      });

      describe('when active tab selected', () => {
        it('should render project listing with active project state', () => {
          component.setState({ tabValue: 1 });
          component.update();

          expect(component.find(ProjectOwnerProjectListing).props().projectState).toEqual(ProjectState.APPROVED_ACTIVE);
        });
      });

      describe('when inactive tab selected', () => {
        it('should render project listing with inactive project state', () => {
          component.setState({ tabValue: 2 });
          component.update();

          expect(component.find(ProjectOwnerProjectListing).props().projectState).toEqual(ProjectState.APPROVED_INACTIVE);
        });
      });

      describe('when rejected tab selected', () => {
        it('should render project listing with rejected project state', () => {
          component.setState({ tabValue: 3 });
          component.update();

          expect(component.find(ProjectOwnerProjectListing).props().projectState).toEqual(ProjectState.REJECTED);
        });
      });
    });
  });
});