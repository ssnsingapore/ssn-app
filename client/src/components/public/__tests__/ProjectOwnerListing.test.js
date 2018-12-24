import React from 'react';
import { _testExports } from '../ProjectOwnerListing';
import { defaultAppContext } from 'components/main/AppContext';
import { ProjectOwnerDetails } from 'components/shared/ProjectOwnerDetails';
import { Pagination } from '../../shared/Pagination';

const ProjectOwnerListing = _testExports.ProjectOwnerListing;

const mockTheme = {
  spacing: {
    unit: 1,
  },
};

const projectOwner = {
  'id': '5c1f06978ae06880ca733dee',
  'name': 'Cat Society',
  'email': 'test@test.com',
  'accountType': 'ORGANISATION',
  'websiteUrl': 'https://thecatsite.com/',
  'socialMediaLink': 'https://twitter.com/awyeahcatgifs',
  'profilePhotoUrl': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0-6cOe8ak3u1PWfiFXOmDrOgKan1exVg-T4lryx41j-W_78Hubg',
  'organisationName': 'Cat Society',
  'description': 'Everything cats.',
  'role': 'PROJECT_OWNER',
};

const projectOwners = [...Array(45)].map(() => projectOwner);

describe('ProjectOwnerListing', () => {
  let component;
  let mockContext;

  beforeEach(() => {
    mockContext = { ...defaultAppContext };
    mockContext.utils.requestWithAlert = {
      get: jest.fn(() => Promise.resolve({
        projectOwners,
        totalProjectOwners: 45,
      })),
    };

    component = shallow(
      <ProjectOwnerListing
        theme={mockTheme}
        context={mockContext}
        location={{ search: '' }}
      />
    ).dive();
  });

  describe('render', () => {
    beforeEach(() => {
      component.setState({ projectOwners: projectOwners.slice(0, 20) });
      component.setState({ totalProjectOwners: 45 });
      component.setState({ numPages: 3 });
    });

    it('should render project owner details cards', async () => {
      expect(component.find(ProjectOwnerDetails).length).toEqual(20);
    });

    it('should render the total number of project owners', () => {
      expect(component.find('[data-testid="total-text"]').props().children).toEqual(
        'There are a total of 45 project owners on the site.'
      );
    });

    it('should render the pagination buttons', () => {
      expect(component.find(Pagination).props().numPages).toEqual(3);
      expect(component.find(Pagination).props().page).toEqual(0);
    });
  });

  describe('on mount', () => {
    beforeEach(() => {
      mockContext = { ...defaultAppContext };
      mockContext.utils.requestWithAlert = {
        get: jest.fn(() => Promise.resolve({
          projectOwners,
          totalProjectOwners: 45,
        })),
      };
    });

    describe('when page number is not specified in query params', () => {
      beforeEach(() => {
        component = shallow(
          <ProjectOwnerListing
            theme={mockTheme}
            context={mockContext}
            location={{ search: '' }}
          />
        ).dive();
      });

      it('should fetch project owners for the page number 1', () => {
        expect(mockContext.utils.requestWithAlert.get).toHaveBeenCalledWith(
          '/api/v1/project_owners?pageSize=20&page=1',
        );
      });
    });

    describe('when page number is specified in query params', () => {
      beforeEach(() => {
        component = shallow(
          <ProjectOwnerListing
            theme={mockTheme}
            context={mockContext}
            location={{ search: '?page=3' }}
          />
        ).dive();
      });

      it('should fetch project owners for the given page number', () => {
        expect(mockContext.utils.requestWithAlert.get).toHaveBeenCalledWith(
          '/api/v1/project_owners?pageSize=20&page=3',
        );
      });
    });
  });

  describe('pagination', () => {
    let mockHistory;

    beforeEach(() => {
      mockContext = { ...defaultAppContext };
      mockContext.utils.requestWithAlert = {
        get: jest.fn(() => Promise.resolve({
          projectOwners,
          totalProjectOwners: 45,
        })),
      };
      mockHistory = { push: jest.fn() };

      component = shallow(
        <ProjectOwnerListing
          theme={mockTheme}
          context={mockContext}
          location={{ search: '?page=3' }}
          history={mockHistory}
        />
      ).dive();

      component.setState({ projectOwners: projectOwners.slice(0, 20) });
      component.setState({ totalProjectOwners: 45 });
      component.setState({ numPages: 3 });
    });

    it('should fetch project owners for the selected page and set the page number in the query params', () => {
      component.find(Pagination).props().handlePageClick({ selected: 0 });
      component.update();

      expect(component.state().page).toEqual(1);
      expect(mockHistory.push).toHaveBeenCalledWith('?page=1');
    });
  });
});