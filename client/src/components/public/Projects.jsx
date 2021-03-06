import { Paper, Tab, Tabs, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { AppContext } from 'components/main/AppContext';
import { AlertType } from 'components/shared/Alert';
import { ProjectStateDisplayMapping } from 'components/shared/display_mappings/ProjectStateDisplayMapping';
import { IssueAddressed } from 'components/shared/enums/IssueAddressed';
import { Month } from 'components/shared/enums/Month';
import { ProjectRegion } from 'components/shared/enums/ProjectRegion';
import { ProjectState } from 'components/shared/enums/ProjectState';
import { VolunteerRequirementType } from 'components/shared/enums/VolunteerRequirementType';
import { PublicProjectListing } from 'components/shared/PublicProjectListing';
import { SearchBar } from 'components/shared/SearchBar';
import { Spinner } from 'components/shared/Spinner';
import qs from 'qs';
import React, { Component } from 'react';
import { withContext } from 'util/context';
import { extractErrors, formatErrors } from 'util/errors';
import { getFieldNameObject, withForm } from 'util/form';
import { Pagination } from 'components/shared/Pagination';

import { SEARCH_BAR_FIELD_VALUES } from 'util/storage_keys';

const PAGE_SIZE = 20;
const FieldName = getFieldNameObject([
  'issueAddressed',
  'projectRegion',
  'month',
  'volunteerRequirementType',
]);

const constraints = {
  [FieldName.issueAddressed]: {
    inclusion: Object.values(IssueAddressed),
  },
  [FieldName.projectRegion]: {
    inclusion: Object.values(ProjectRegion),
  },
  [FieldName.month]: {
    inclusion: Object.values(Month),
  },
  [FieldName.volunteerRequirementType]: {
    inclusion: Object.values(VolunteerRequirementType),
  },
};

function TabContainer(props) {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  );
}

const publicProjectStates = [
  ProjectState.APPROVED_ACTIVE,
  ProjectState.APPROVED_INACTIVE,
];

const tabValueProjectStateMapping = {
  0: ProjectState.APPROVED_ACTIVE,
  1: ProjectState.APPROVED_INACTIVE,
};

const projectStateTabValueMapping = {
  [ProjectState.APPROVED_ACTIVE]: 0,
  [ProjectState.APPROVED_INACTIVE]: 1,
};

class _Projects extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      tabValue: 0,
      counts: {},
      activeProjects: [],
      inactiveProjects: [],
      numPages: { [ProjectState.APPROVED_ACTIVE]: 0, [ProjectState.APPROVED_INACTIVE]: 0 },
      page: 1,
    };
  }

  async componentDidMount() {
    const cachedFields = this.getFieldValues();
    if (cachedFields && this.props.history.action === 'POP') {
      const promiseArray = Object.keys(cachedFields).map(key => this.props.setField(key, cachedFields[key]));
      await Promise.all(promiseArray);
    }
    await this.fetchProjectCounts();

    // Update state from query params when user presses back
    // to ensure that when the user goes back
    // and the projectState query param changes to the previous one
    // the tabValue will be updated accordingly
    window.onpopstate = this.updateStateFromQueryParams;
    this.updateStateFromQueryParams();

    this.setState({ isLoading: false });
  }

  componentWillUnmount() {
    window.onpopstate = false;
  }

  updateStateFromQueryParams = () => {
    const queryString = this.props.location.search.substring(1);
    const queryParams = qs.parse(queryString);
    const projectState = queryParams.projectState || ProjectState.APPROVED_ACTIVE;
    const page = Number(queryParams.page) || 1;

    this.setState(({ page, tabValue: projectStateTabValueMapping[projectState] }), async () => { await this.fetchProjects(projectState, page); });
  }

  handlePageClick = (pageDisplayed) => {
    const newPage = pageDisplayed.selected + 1;
    const projectState = tabValueProjectStateMapping[this.state.tabValue];
    this.props.history.push(`?page=${newPage}&projectState=${projectState}`);
    this.setState({ isLoading: true });
    this.setState(({ page: newPage }), async () => { await this.fetchProjects(projectState, newPage); });
    this.setState({ isLoading: false });
  };

  fetchProjectCounts = async () => {
    const { requestWithAlert } = this.props.context.utils;

    const endPoint = '/api/v1/project_counts';
    const filterQueryParams = qs.stringify(this.props.valuesForAllFields());

    const countResponse = await requestWithAlert.get(
      `${endPoint}?${filterQueryParams}`
    );

    if (countResponse.isSuccessful) {
      const counts = (await countResponse.json()).counts;
      const numPages = Object.keys(counts).reduce(function (pageCounts, key) {
        pageCounts[key] = Math.ceil(counts[key] / PAGE_SIZE);
        return pageCounts;
      }, {});
      this.setState({ counts, numPages });
    }

    if (countResponse.hasError) {
      const { showAlert } = this.props.context.updaters;
      const errors = await extractErrors(countResponse);
      showAlert(
        'getProjectCountsFailure',
        AlertType.ERROR,
        formatErrors(errors)
      );
    }
  };

  fetchProjects = async (projectState, currentPage) => {
    const { requestWithAlert } = this.props.context.utils;
    const pageSize = PAGE_SIZE;
    const page = currentPage;

    const endpoint = '/api/v1/projects';
    const queryObj = { pageSize, page, projectState, ...this.props.valuesForAllFields() };
    const queryParams = qs.stringify(queryObj);

    const response = await requestWithAlert.get(
      `${endpoint}?${queryParams}`,
      {
        authenticated: true,
      }
    );

    if (response.isSuccessful) {
      const projects = (await response.json()).projects;
      const projectsParam =
        projectState === ProjectState.APPROVED_ACTIVE
          ? { activeProjects: projects }
          : { inactiveProjects: projects };
      this.setState(projectsParam);
    }

    if (response.hasError) {
      const { showAlert } = this.props.context.updaters;
      const error = await extractErrors(response);
      showAlert('getProjectsFailure', AlertType.ERROR, formatErrors(error));
    }
  };

  handleTabValueChange = (_event, value) => {
    this.setState({ page: 1, tabValue: value }, async () => { await this.fetchProjects(tabValueProjectStateMapping[value], 1); });
    this.props.history.push(`?page=1&projectState=${tabValueProjectStateMapping[value]}`);
  };

  setFieldValues = () => {
    localStorage.setItem(SEARCH_BAR_FIELD_VALUES, JSON.stringify(this.props.valuesForAllFields()));
  }

  clearFieldValues = () => {
    localStorage.removeItem(SEARCH_BAR_FIELD_VALUES);
  }

  getFieldValues = () => {
    return JSON.parse(localStorage.getItem(SEARCH_BAR_FIELD_VALUES));
  }

  filterProjects = async () => {
    this.setFieldValues();

    this.setState({ isLoading: true });

    await this.fetchProjectCounts();
    this.setState({ page: 1 }, async () => { await Promise.all(publicProjectStates.map(state => this.fetchProjects(state, 1))); });

    this.setState({ isLoading: false });
  };

  resetAllFieldsAndRefetch = async () => {
    this.setState({ isLoading: true });
    this.clearFieldValues();
    await this.props.resetAllFields();
    await this.fetchProjectCounts();

    this.setState({ page: 1 }, async () => { await Promise.all(publicProjectStates.map(state => this.fetchProjects(state, 1))); });

    this.setState({ isLoading: false });
  };

  getTabLabel = projectState => {
    const { counts } = this.state;
    return counts[projectState] !== undefined
      ? `${ProjectStateDisplayMapping[projectState]} (${counts[projectState]})`
      : ProjectStateDisplayMapping[projectState];
  };

  renderContent = (value, projectState, projects) => {
    const { tabValue, counts, numPages, page, isLoading } = this.state;
    const { theme } = this.props;
    const state = ProjectStateDisplayMapping[projectState].toLowerCase();

    return (
      tabValue === value && (
        <TabContainer>
          {counts === 0 ? (
            <Typography
              variant="subtitle1"
              style={{ color: theme.palette.grey[500] }}
            >
              There are no {state} projects at the moment.
            </Typography>
          ) : (
            <React.Fragment>
              {numPages[projectState] > 0 &&
                  <Pagination
                    numPages={numPages[projectState]}
                    handlePageClick={this.handlePageClick}
                    page={page - 1}
                  />
              }
              <PublicProjectListing
                projects={projects}
                isLoading={isLoading}
                projectState={projectState}
              />
            </React.Fragment>
          )}
        </TabContainer>
      )
    );
  };

  renderProjectListings = () => {
    const { tabValue } = this.state;
    const { classes } = this.props;

    if (this.state.isLoading) {
      return <Spinner />;
    }

    return (
      <Paper className={classes.body} square>
        <Paper square>
          <Typography variant="h5" className={classes.title}>
            List of projects
          </Typography>
          <Tabs
            value={tabValue}
            onChange={this.handleTabValueChange}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label={this.getTabLabel(ProjectState.APPROVED_ACTIVE)} />
            <Tab label={this.getTabLabel(ProjectState.APPROVED_INACTIVE)} />
          </Tabs>
        </Paper>
        <Paper className={classes.innerbox}>
          {this.renderContent(
            0,
            ProjectState.APPROVED_ACTIVE,
            this.state.activeProjects
          )}
          {this.renderContent(
            1,
            ProjectState.APPROVED_INACTIVE,
            this.state.inactiveProjects
          )}
        </Paper>
      </Paper>
    );
  };

  render() {
    return (
      <div>
        <SearchBar
          FieldName={FieldName}
          fields={this.props.fields}
          handleChange={this.props.handleChange}
          resetAllFieldsAndRefetch={this.resetAllFieldsAndRefetch}
          filterProjects={this.filterProjects}
          isLoading={this.state.isLoading}
        />
        {this.renderProjectListings()}
      </div>
    );
  }
}

const styles = {
  landingHeader: {
    textTransform: 'uppercase',
  },
  title: {
    padding: '30px',
  },
  body: {
    width: '80vw',
    margin: '20px auto 60px',
  },
  innerbox: {
    marginTop: '1px',
  },
};

export const Projects = withForm(FieldName, constraints)(
  withContext(AppContext)(withStyles(styles)(_Projects))
);

export const _testExports = {
  Projects: _Projects,
};
