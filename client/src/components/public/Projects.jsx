import React, { Component } from 'react';
import { Typography, Paper, Tabs, Tab } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

import { AppContext } from 'components/main/AppContext';
import { SearchBar } from 'components/shared/SearchBar';
import { Spinner } from 'components/shared/Spinner';
import { ProjectListing } from 'components/shared/ProjectListing';
import { ProjectStateDisplayMapping } from 'components/shared/display_mappings/ProjectStateDisplayMapping';
import { extractErrors, formatErrors } from 'util/errors';
import { AlertType } from 'components/shared/Alert';
import { ProjectState } from 'components/shared/enums/ProjectState';
import { withContext } from 'util/context';
import { getFieldNameObject, withForm } from 'util/form';
import { IssueAddressed } from 'components/shared/enums/IssueAddressed';
import { ProjectLocation } from 'components/shared/enums/ProjectLocation';
import { Month } from 'components/shared/enums/Month';
import { VolunteerRequirementType } from 'components/shared/enums/VolunteerRequirementType';

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

class _Projects extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      tabValue: 0,
      counts: {},
    };
  }

  async componentDidMount() {
    const { requestWithAlert } = this.props.context.utils;
    const response = await requestWithAlert.get('/api/v1/project_counts');

    if (response.isSuccessful) {
      const counts = (await response.json()).counts;
      this.setState({ counts });
    }

    if (response.hasError) {
      const { showAlert } = this.props.context.updaters;
      const errors = await extractErrors(response);
      showAlert(
        'getProjectCountsFailure',
        AlertType.ERROR,
        formatErrors(errors)
      );
    }

    this.setState({ isLoading: false });
  }

  handleTabValueChange = (_event, value) => {
    this.setState({ tabValue: value });
  };

  getTabLabel = projectState => {
    const { counts } = this.state;
    return counts[projectState] !== undefined
      ? `${ProjectStateDisplayMapping[projectState]} (${counts[projectState]})`
      : ProjectStateDisplayMapping[projectState];
  };

  renderContent = (value, projectState) => {
    const { tabValue } = this.state;

    return (
      tabValue === value && (
        <TabContainer>
          <ProjectListing projectState={projectState} />
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
          {this.renderContent(0, ProjectState.APPROVED_ACTIVE)}
          {this.renderContent(1, ProjectState.APPROVED_INACTIVE)}
        </Paper>
      </Paper>
    );
  };

  render() {
    return (
      <div>
        <SearchBar FieldName={FieldName}
          classes={this.props.classes}
          fields={this.props.fields}
          handleChange={this.props.handleChange}
          resetAllFields={this.props.resetAllFields}
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

export const Projects = 
withForm(FieldName, constraints)(
  withContext(AppContext)(
    (withStyles(styles)(
      (_Projects)
    )
    )
  )
);

export const _testExports = {
  Projects: _Projects,
};
