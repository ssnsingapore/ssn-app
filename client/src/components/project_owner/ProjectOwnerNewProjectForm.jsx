import { Paper, TextField, Typography, Button, Input, InputLabel, Select, MenuItem, FormControl  } from '@material-ui/core';
import { withStyles, withTheme } from '@material-ui/core/styles';
import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { withContext } from 'util/context';
import { extractErrors, formatErrors } from 'util/errors';
import { fieldErrorText, fieldHasError, getFieldNameObject, withForm, fieldValue } from 'util/form';

import { AccountType } from 'components/shared/enums/AccountType';
import { AlertType } from 'components/shared/Alert';
import { AppContext } from 'components/main/AppContext';
import { Spinner } from '../shared/Spinner';
import { ProjectType } from 'components/shared/enums/ProjectType';
import { ProjectFrequency } from 'components/shared/enums/ProjectFrequency';
import { ProjectLocation } from 'components/shared/enums/ProjectLocation';
import { ProjectLocationDisplayMapping } from 'components/shared/display_mappings/ProjectLocationDisplayMapping';
import { ProjectFrequencyDisplayMapping } from 'components/shared/display_mappings/ProjectFrequencyDisplayMapping';

const SIGNUP_SUCCESS_MESSAGE = 'You\'ve successfully created a new project!';
const FieldName = getFieldNameObject([
  'title',
  'projectType',
  'startDate',
  'endDate',
  'frequency',
  'time',
  'location',
  'description',
  'issuesAddressed',
]);

const constraints = {
  [FieldName.name]: {
    presence: { allowEmpty: false },
    length: { maximum: 50 },
  },
  [FieldName.email]: {
    presence: { allowEmpty: false },
    email: true,
  }, [FieldName.accountType]: {
    presence: { allowEmpty: false },
    inclusion: Object.values(AccountType),
  },
  [FieldName.websiteUrl]: {
    isUrl: { allowEmpty: true },
  },
  [FieldName.password]: {
    presence: { allowEmpty: false },
    length: {
      minimum: 6,
    },
  },
  [FieldName.passwordConfirmation]: {
    presence: { allowEmpty: false },
    sameValueAs: {
      other: FieldName.password,
    },
  },
};

class _ProjectOwnerNewProjectForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isSubmitting: false,
      createdProject: null,
    };
  }

  handleSubmit = async (event) => {
    const { showAlert } = this.props.context.updaters;
    event.preventDefault();

    if (!this.props.validateAllFields()) {
      return;
    }

    const { requestWithAlert } = this.props.context.utils;
    const { authenticator } = this.props.context.utils;
    const { id } = authenticator.getCurrentUser();

    const project = { ...this.props.valuesForAllFields(), projectOwner: id };
    const data = { project };
    this.setState({ isSubmitting: true });
    const response = await requestWithAlert.post('/api/v1/projects', data, {authenticated: true});
    this.setState({ isSubmitting: false });

    if (response.isSuccessful) {
      const createdProject = (await response.json()).project;
      this.setState({
        createdProject,
      });
      showAlert('signupSuccess', AlertType.SUCCESS, SIGNUP_SUCCESS_MESSAGE);
    }

    if (response.hasError) {
      const errors = await extractErrors(response);
      showAlert('signupFailure', AlertType.ERROR, formatErrors(errors));
    }
  }

  renderFrequency = () => {
    const { classes, handleChange, fields } = this.props;
    return fields[FieldName.projectType].value === ProjectType.RECURRING &&
    <FormControl className={classes.formControl}>
      <InputLabel htmlFor="frequency-label-placeholder">
        Frequency
      </InputLabel>
      <Select
        value={fieldValue(fields, FieldName.frequency)}
        onChange={handleChange}
        input={<Input name="frequency" id="frequency-label-placeholder" />}
        name={FieldName.frequency}
      >
        <MenuItem value="">
          None
        </MenuItem>
        <MenuItem value={ProjectFrequency.EVERY_DAY}>{ProjectFrequencyDisplayMapping[ProjectFrequency.EVERY_DAY]}</MenuItem>
      </Select>
    </FormControl>;
  }

  renderStartDate = () => {
    const { classes, handleChange, fields } = this.props;
    return fields[FieldName.projectType].value === ProjectType.EVENT &&
    <TextField
      type="date"
      name={FieldName.startDate}
      className={classes.textField}
      id="date"
      label="Start Date"
      onChange={handleChange}
      value={fieldValue(fields, FieldName.startDate)}
    />;
  }

  renderEndDate = () => {
    const { classes, handleChange, fields } = this.props;
    return fields[FieldName.projectType].value === ProjectType.EVENT &&
    <TextField
      type="date"
      name={FieldName.endDate}
      className={classes.textField}
      id="date"
      label="End Date"
      onChange={handleChange}
      minDate={new Date()}
      value={fieldValue(fields, FieldName.endDate)}
    />;
  }

  render() {
    const { classes, fields, handleChange } = this.props;

    if (this.state.createdProject) {
      return <Redirect to="/project_owner/dashboard" />;
    }

    return (
      <div>
        <div className={classes.oneColumn}>
          <Paper>
            <Typography>Test</Typography>
          </Paper>
        </div>
        <div className={classes.root}>
          <Paper className={classes.twoColumn}>
            <Typography>Test</Typography>
          </Paper>
          <Paper elevation={2} className={classes.twoColumn} square={true}>
            <Typography variant="headline">Project Details</Typography>
            <form onSubmit={this.handleSubmit}>
              <FormControl className={classes.formControl}>
                <InputLabel htmlFor={FieldName.projectType}>
                Project Type
                </InputLabel>
                <Select
                  value={fieldValue(fields, FieldName.projectType)}
                  onChange={handleChange}
                  name={FieldName.projectType}
                >
                  <MenuItem value="">
                  None
                  </MenuItem>
                  <MenuItem value={ProjectType.EVENT}>Event</MenuItem>
                  <MenuItem value={ProjectType.RECURRING}>Recurring</MenuItem>
                </Select>
              </FormControl>
              {this.renderStartDate()}
              {this.renderEndDate()}
              <TextField
                name={FieldName.title}
                className={classes.textInput}
                id={FieldName.title}
                label="Title"
                onChange={handleChange}
                value={fieldValue(fields, FieldName.title)}
                error={fieldHasError(fields, FieldName.title)}
                helperText={fieldErrorText(fields, FieldName.title)}
                fullWidth
                margin="normal"
              />
              {this.renderFrequency()}
              <TextField
                name={FieldName.description}
                className={classes.textInput}
                id={FieldName.description}
                label="Description"
                onChange={handleChange}
                value={fieldValue(fields, FieldName.description)}
                error={fieldHasError(fields, FieldName.description)}
                helperText={fieldErrorText(fields, FieldName.description)}
                fullWidth
                margin="normal"
              />
              <TextField
                type="time"
                name={FieldName.time}
                className={classes.textInput}
                id={FieldName.time}
                label="Time"
                onChange={handleChange}
                value={fieldValue(fields, FieldName.time)}
                error={fieldHasError(fields, FieldName.time)}
                helperText={fieldErrorText(fields, FieldName.time)}
                fullWidth
                margin="normal"
              />
              <FormControl className={classes.formControl}>
                <InputLabel htmlFor="location-label-placeholder">
                Location
                </InputLabel>
                <Select
                  value={fieldValue(fields, FieldName.location)}
                  onChange={handleChange}
                  input={<Input name="location" id="location-label-placeholder" />}
                  name='location'
                >
                  <MenuItem value="">
                  None
                  </MenuItem>
                  <MenuItem value={ProjectLocation.CENTRAL}>{ProjectLocationDisplayMapping[ProjectLocation.CENTRAL]}</MenuItem>
                  <MenuItem value={ProjectLocation.NORTH}>{ProjectLocationDisplayMapping[ProjectLocation.NORTH]}</MenuItem>
                  <MenuItem value={ProjectLocation.SOUTH}>{ProjectLocationDisplayMapping[ProjectLocation.SOUTH]}</MenuItem>
                  <MenuItem value={ProjectLocation.EAST}>{ProjectLocationDisplayMapping[ProjectLocation.EAST]}</MenuItem>
                  <MenuItem value={ProjectLocation.WEST}>{ProjectLocationDisplayMapping[ProjectLocation.WEST]}</MenuItem>
                </Select>
              </FormControl>
              <Button
                type="submit"
                size="medium"
                className={classes.createButton}
                disabled={this.state.isSubmitting}
                variant="contained"
                color="secondary"
              >
                Submit Project
              </Button>
            </form>

            {this.state.isSubmitting && <Spinner />}
          </Paper>
        </div>
      </div>
    );
  }
}

const styles = theme => ({
  root: {
    display: 'flex',
    margin: `${theme.container.margin.vertical}px auto`,
    padding: `${theme.container.padding.vertical}px ${theme.container.padding.horizontal}px`,
    minHeight: '200px',
  },
  oneColumn: {
    width: '100%',
    padding: `${theme.container.padding.vertical}px ${theme.container.padding.horizontal}px`,
  },
  twoColumn : {
    width: '50%',
    margin: `${theme.container.margin.vertical}px 5px`,
    padding: `${theme.container.padding.vertical}px ${theme.container.padding.horizontal}px`,
    marginTop: '5px',
  },
  createButton: {
    display: 'block',
    margin: '30px auto',
    marginBottom: 0,
    color: '#FFFFFF',
  },
  formControl: {
    width: '50%',
  },
});

export const ProjectOwnerNewProjectForm = withStyles(styles)(
  withTheme()(
    withContext(AppContext)(
      withForm(
        FieldName,
      )(_ProjectOwnerNewProjectForm)
    ),
  ),
);

export const TestProjectOwnerNewProjectForm = withForm(
  FieldName,
)(_ProjectOwnerNewProjectForm);
