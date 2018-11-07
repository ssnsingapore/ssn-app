import { Paper, Tab, Tabs, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { AppContext } from 'components/main/AppContext';
import { AlertType } from 'components/shared/Alert';
import { ProjectStateDisplayMapping } from 'components/shared/display_mappings/ProjectStateDisplayMapping';
import { IssueAddressed } from 'components/shared/enums/IssueAddressed';
import { Month } from 'components/shared/enums/Month';
import { ProjectLocation } from 'components/shared/enums/ProjectLocation';
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

// import { PROJECT_KEYS_TO_FILTER } from 'util/storage_keys';

const FieldName = getFieldNameObject([
  'issueAddressed',
  'projectLocation',
  'month',
  'volunteerRequirementType',
]);

const constraints = {
  [FieldName.issueAddressed]: {
    inclusion: Object.values(IssueAddressed),
  },
  [FieldName.projectLocation]: {
    inclusion: Object.values(ProjectLocation),
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

class _Projects extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      tabValue: 0,
      counts: {},
      activeProjects: [],
      inactiveProjects: [],
    };
  }

  async componentDidMount() {
    await this.fetchProjectCounts();
    for (let i = 0; i < publicProjectStates.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await this.fetchProjects(publicProjectStates[i]);
    }

    this.setState({ isLoading: false });
  }

  fetchProjectCounts = async () => {
    const { requestWithAlert } = this.props.context.utils;

    const endPoint = '/api/v1/project_counts';
    const filterQueryParams = qs.stringify(this.props.valuesForAllFields());

    const countResponse = await requestWithAlert.get(
      `${endPoint}?${filterQueryParams}`
    );

    if (countResponse.isSuccessful) {
      const counts = (await countResponse.json()).counts;
      this.setState({ counts });
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

  fetchProjects = async (projectState) => {
    const { requestWithAlert } = this.props.context.utils;
    const { pageSize = 10 } = this.props;

    const endpoint = '/api/v1/projects';
    const queryObj = { pageSize, projectState, ...this.props.valuesForAllFields() };
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
    this.setState({ tabValue: value });
  };

  //setProjectKeysToFilter = (keysToFilter) => {
  //  localStorage.setItem(PROJECT_KEYS_TO_FILTER, JSON.stringify(keysToFilter));
  //}

  filterProjects = async () => {
    this.setState({ isLoading: true });

    await this.fetchProjectCounts();
    for (let i = 0; i < publicProjectStates.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await this.fetchProjects(publicProjectStates[i]);
    }

    this.setState({ isLoading: false });
  };

  resetAllFieldsAndRefetch = async () => {
    this.setState({ isLoading: true });

    this.props.resetAllFields();
    await this.fetchProjectCounts();
    for (let i = 0; i < publicProjectStates.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await this.fetchProjects(publicProjectStates[i]);
    }

    this.setState({ isLoading: false });
  };

  getTabLabel = projectState => {
    const { counts } = this.state;
    return counts[projectState] !== undefined
      ? `${ProjectStateDisplayMapping[projectState]} (${counts[projectState]})`
      : ProjectStateDisplayMapping[projectState];
  };

  renderContent = (value, projectState, projects) => {
    const { tabValue, counts } = this.state;
    const { theme } = this.props;
    const state = ProjectStateDisplayMapping[projectState].toLowerCase();

    return (
      tabValue === value && (
        <TabContainer>
          {counts === 0 ? (
            <Typography
              variant="subheading"
              style={{ color: theme.palette.grey[500] }}
            >
              There are no {state} projects at the moment.
            </Typography>
          ) : (
            <PublicProjectListing
              projects={projects}
              isLoading={this.state.isLoading}
              projectState={projectState}
            />
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
          <Typography variant="headline" className={classes.title}>
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
          classes={this.props.classes}
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
