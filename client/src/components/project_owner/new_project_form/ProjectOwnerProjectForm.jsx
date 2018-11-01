import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { withStyles, withTheme } from '@material-ui/core/styles';
import { Grid, Button, Paper } from '@material-ui/core';
import RemoveRedEyeIcon from '@material-ui/icons/RemoveRedEye';

import { AppContext } from 'components/main/AppContext';
import { withContext } from 'util/context';
import { Spinner } from 'components/shared/Spinner';

import { ProjectMainInfo } from 'components/shared/ProjectMainInfo';
import { ProjectOwnerDetails } from 'components/shared/ProjectOwnerDetails';
import { ProjectDetails } from './ProjectDetails';
import { ProjectVolunteerDetails } from './ProjectVolunteerDetails';
import { ProjectBaseDetails } from './ProjectBaseDetails';
import { FieldName } from './ProjectFormFields';

class _ProjectOwnerProjectForm extends Component {

  constructor(props) {
    super(props);

    this.state = {
      preview: false,
    };

  }

  togglePreviewOn = () => {
    const { fields } = this.props;
    const project = {};

    for (const [key, valueObject] of Object.entries(fields)) {
      project[key] = valueObject.value;
    }

    this.setState({ preview: true, project });
  };

  togglePreviewOff = () => {
    this.setState({ preview: false });
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

  renderActionBar = () => {
    const { classes } = this.props;
    const { preview } = this.state;

    return (
      <div className={classes.actionBar}>
        <div className={classes.buttonGroup}>
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            className={classes.button}
            disable={this.props.isSubmitting || this.props.isProjectSame}
          >
            Submit
          </Button>
          {!preview ? (
            <Button
              variant="contained"
              className={classes.button}
              onClick={this.togglePreviewOn}
            >
              Preview
            </Button>
          ) : (
            <Button
              variant="contained"
              className={classes.button}
              onClick={this.togglePreviewOff}
            >
              Back to form
            </Button>
          )}
        </div>
      </div>
    );
  };

  render() {
    const { classes } = this.props;
    const { preview } = this.state;

    if (this.props.isLoadingProject) {
      return <Spinner/>;
    };

    // if (this.props.shouldRedirect) {
    //   return (
    //     <Redirect
    //       to={{
    //         pathname: '/project_owner/dashboard',
    //       }}
    //     />
    //   );
    // }

    return (
      <form 
        onSubmit={this.props.handleSubmit} 
        className={classes.root}
      >
        <div className={classes.form}>
          <Grid container spacing={16}>
            {!preview ? (
              <React.Fragment>
                <Grid item xs={12} style={{ paddingTop: '56px' }} />
                <Grid item xs={12}>
                  <ProjectBaseDetails
                    fields={this.props.fields}
                    handleChange={this.props.handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ProjectVolunteerDetails
                    volunteerRequirementRefs={this.props.volunteerRequirementRefs}
                    FieldName={FieldName}
                    fields={this.props.fields}
                    handleChange={this.props.handleChange}
                    handleDeleteVolunteerRequirement={this.props.handleDeleteVolunteerRequirement}
                    handleAddVolunteerRequirement={this.props.handleAddVolunteerRequirement}
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
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Grid item xs={12}>
                  {this.renderPreviewNotice()}
                </Grid>
                <Grid item xs={12}>
                  <ProjectMainInfo project={this.state.project} />
                </Grid>
              </React.Fragment>
            )}
            <Grid item xs={12}>
              <ProjectOwnerDetails />
            </Grid>
          </Grid>
        </div>
        {this.renderActionBar()}
      </form>
    );
  }
}

const styles = theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  form: {
    flexGrow: 1,
    width: '80vw',
    margin: '0 auto',
    padding: '0 0 60px',
  },
  previewNotice: {
    padding: theme.spacing.unit / 2,
    backgroundColor: theme.palette.grey[200],
  },
  paper: {
    padding: theme.spacing.unit * 2,
    height: '100%',
  },
  textFieldGroup: {
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  formControl: {
    marginTop: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit * 3,
    minWidth: 120,
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: theme.spacing.unit / 4,
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
    position: 'sticky',
    bottom: 0,
    backgroundColor: theme.palette.grey[200],
  },
});

export const ProjectOwnerProjectForm = 
  withContext(AppContext)(
    withTheme()(withStyles(styles)(_ProjectOwnerProjectForm))
  );
