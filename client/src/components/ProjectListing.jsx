import React, { Component } from 'react';
import { Grid, Typography, Paper } from '@material-ui/core';
import { withStyles, withTheme } from '@material-ui/core/styles';

class _ProjectListing extends Component {
  constructor(props) {
    super(props);

    this.state = {
      projects: [
        {
          title: 'Save the Earth',
          projectOwner: 'Earth Society',
          volunteerTypes: ['facilitators', 'booth assistants'],
          issuesAddressed: ['Recycling', 'Sustainability'],
        },
        {
          title: 'Save the Earth',
          projectOwner: 'Earth Society',
          volunteerTypes: ['facilitators', 'booth assistants'],
          issuesAddressed: ['Recycling', 'Sustainability'],
        },
      ],
    };
  }

  renderProjects = () => {
    return this.state.projects.map((project) => {
      return (
        <Grid item xs={12}>
          <Paper>
            <Typography variant="title">
              {project.title}
            </Typography>
            <Typography variant="subheading">
              {project.projectOwner}
            </Typography>
          </Paper>
        </Grid>
      );
    });
  }

  render() {
    const { theme } = this.props;

    return (
      <Grid container spacing={theme.spacing.unit}>
        {this.renderProjects()}
      </Grid>
    );
  }
}

const styles = {};

export const ProjectListing =
withTheme()(
  withStyles(styles)(_ProjectListing)
);