import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { withStyles, withTheme } from '@material-ui/core/styles';
import { Grid, Button, Paper } from '@material-ui/core';
import RemoveRedEyeIcon from '@material-ui/icons/RemoveRedEye';

import { AppContext } from 'components/main/AppContext';
import { withContext } from 'util/context';

import { ProjectMainInfo } from 'components/shared/ProjectMainInfo';
import { ProjectOwnerDetails } from 'components/shared/ProjectOwnerDetails';
import { RejectionReason } from 'components/shared/RejectionReason';
import { ProjectState } from 'components/shared/enums/ProjectState';
import { ProjectDetails } from './ProjectDetails';
import { ProjectVolunteerDetails } from './ProjectVolunteerDetails';
import { ProjectBaseDetails } from './ProjectBaseDetails';
import { FieldName } from './ProjectFormFields';
import { DefaultCoverImageUrl } from 'components/shared/enums/DefaultCoverImageUrl';
import { IssueAddressed } from 'components/shared/enums/IssueAddressed';
import { Role } from 'components/shared/enums/Role';

export class _ProjectOwnerProjectForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      preview: false,
      project: null,
      isDefaultCoverImage: false,
    };
  }

  getProject = () => {
    const { fields } = this.props;
    const project = {};

    for (const [key, valueObject] of Object.entries(fields)) {
      project[key] = valueObject.value;
    }
    return project;
  };

  togglePreviewOn = () => {
    const project = this.getProject();
    const projectImageInput = this.props.projectImageInput.current;
    let coverImageSrc = this.getNewCoverImageSrc(projectImageInput);
    if (!coverImageSrc) {
      coverImageSrc = this.getPreviewDefaultImageUrl();
      this.setState({ isDefaultCoverImage: true });
    }

    project.coverImageUrl = coverImageSrc;
    project.volunteerRequirements = Object.values(this.props.volunteerRequirementRefs).map(
      ref => ref.current.valuesForAllFields()
    );

    this.setState({ preview: true, project });
  };

  getDefaultUrl = project => {
    return project && project.issuesAddressed
      ? DefaultCoverImageUrl[project.issuesAddressed[0]]
      : null;
  };

  getPreviewDefaultImageUrl = () => {
    const project = this.getProject();
    const defaultUrl = this.getDefaultUrl(project);
    return defaultUrl || DefaultCoverImageUrl[IssueAddressed.OTHER];
  };

  getNewCoverImageSrc = current => {
    if (current && current.files.length > 0) {
      return window.URL.createObjectURL(current.files[0]);
    }
    return undefined;
  };

  togglePreviewOff = () => {
    const currentProject = this.state.project;
    if (this.state.isDefaultCoverImage) {
      currentProject.coverImageUrl = '';
    }
    this.setState({ preview: false, project: currentProject });
  };

  renderPreviewNotice = () => {
    const { classes } = this.props;

    return (
      <Paper square className={classes.previewNotice}>
        <Button disabled fullWidth>
          <RemoveRedEyeIcon className={classes.leftIcon} />
          This is a preview
        </Button>
      </Paper>
    );
  };

  renderBackToDashboardButton() {
    const { classes, location } = this.props;
    if (location) {
      if (location.previousRoute && location.previousRoute.includes('/project_owner/dashboard')) {
        return (
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={() => this.props.history.goBack()}
          >
            Back to dashboard
          </Button>
        );
      }
    }
    return (
      <Button
        variant="contained"
        color="primary"
        className={classes.button}
        component={Link}
        to="/project_owner/dashboard"
      >
        Back to dashboard
      </Button>
    );
  }

  renderActionBar = () => {
    const { classes } = this.props;
    const { preview } = this.state;

    return (
      <div className={classes.actionBar}>
        <div className={classes.buttonGroup}>
          {!preview ? (
            <React.Fragment>
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                className={classes.button}
                disabled={this.props.isSubmitting}
              >
                Submit
              </Button>
              <Button
                variant="contained"
                className={classes.button}
                onClick={this.togglePreviewOn}
              >
                Preview
              </Button>
            </React.Fragment>
          ) : (
            <Button
              variant="contained"
              className={classes.button}
              onClick={this.togglePreviewOff}
            >
                Back to form
            </Button>
          )}
          {this.renderBackToDashboardButton()}
        </div>
      </div>
    );
  };

  _isProjectRejected = () => this.props.projectState === ProjectState.REJECTED;

  render() {
    const { classes } = this.props;
    const { preview, project } = this.state;

    if (this.props.shouldRedirect) {
      return <Redirect to={{ pathname: '/project_owner/dashboard' }} />;
    }

    const formPreviewStyle = preview ? { display: 'none' } : {};

    return (
      <div className={classes.root}>
        <form onSubmit={this.props.handleSubmit}>
          {preview ? (
            <Grid container spacing={16} className={classes.form}>
              <React.Fragment>
                <Grid item xs={12}>
                  {this.renderPreviewNotice()}
                </Grid>
                <Grid item xs={12}>
                  <ProjectMainInfo project={project} />
                </Grid>
                <Grid item xs={12}>
                  <ProjectOwnerDetails />
                </Grid>
              </React.Fragment>
            </Grid>
          ) : (
            ''
          )}
          <Grid
            container
            spacing={16}
            className={classes.form}
            style={formPreviewStyle}
          >
            <Grid item xs={12} style={{ paddingTop: '40px' }} />
            {this._isProjectRejected() && (
              <RejectionReason
                rejectionReason={this.props.rejectionReason}
                role={Role.PROJECT_OWNER}
              />
            )}
            <Grid item xs={12}>
              <ProjectBaseDetails
                fields={this.props.fields}
                handleChange={this.props.handleChange}
                projectImageInput={this.props.projectImageInput}
                coverImageUrl={
                  this.state.project
                    ? this.state.project.coverImageUrl
                    : this.props.coverImageUrl
                }
                formType={this.props.formType}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <ProjectVolunteerDetails
                volunteerRequirementRefs={this.props.volunteerRequirementRefs}
                FieldName={FieldName}
                fields={this.props.fields}
                handleChange={this.props.handleChange}
                handleDeleteVolunteerRequirement={
                  this.props.handleDeleteVolunteerRequirement
                }
                handleAddVolunteerRequirement={
                  this.props.handleAddVolunteerRequirement
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <ProjectDetails
                fields={this.props.fields}
                FieldName={FieldName}
                handleChange={this.props.handleChange}
                resetField={this.props.resetField}
              />
            </Grid>
            <Grid item xs={12}>
              <ProjectOwnerDetails />
            </Grid>
          </Grid>
          {this.renderActionBar()}
        </form>
      </div>
    );
  }
}

const styles = theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  form: {
    width: '80vw',
    margin: '0 auto',
    padding: '0 0 60px',
    minHeight: '95vh',
    alignContent: 'flex-start',
  },
  previewNotice: {
    padding: theme.spacing.unit / 2,
    backgroundColor: theme.palette.grey[200],
  },
  buttonGroup: {
    width: '90vw',
  },
  button: {
    marginTop: theme.spacing.unit * 1.5,
    marginRight: 0,
    marginBottom: theme.spacing.unit * 1.5,
    marginLeft: theme.spacing.unit * 2,
    float: 'right',
  },
  actionBar: {
    display: 'flex',
    position: 'sticky',
    bottom: 0,
    backgroundColor: theme.palette.grey[200],
  },
});

export const ProjectOwnerProjectForm = withContext(AppContext)(
  withTheme()(withStyles(styles)(_ProjectOwnerProjectForm))
);
