import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { withStyles, withTheme } from '@material-ui/core/styles';
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardMedia,
  TextField,
  IconButton,
  Icon,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Input,
  Chip,
  BottomNavigation,
  Button,
} from '@material-ui/core';

import { extractErrors, formatErrors } from 'util/errors';
import {
  fieldErrorText,
  fieldHasError,
  getFieldNameObject,
  withForm,
  fieldValue,
} from 'util/form';
import { AppContext } from 'components/main/AppContext';
import { withContext } from 'util/context';

import { AlertType } from 'components/shared/Alert';
import { ProjectOwnerDetails } from 'components/shared/ProjectOwnerDetails';
import { ProjectType } from 'components/shared/enums/ProjectType';
import { ProjectLocation } from 'components/shared/enums/ProjectLocation';
import { ProjectState } from 'components/shared/enums/ProjectState';
import { ProjectFrequency } from 'components/shared/enums/ProjectFrequency';

class _ProjectOwnerNewProject extends Component {
  state = {
    project: {},
    projectType: '',
    issue: [],
    isSubmitting: false,
    hasSubmitted: false,
  };

  handleProjectTypeChange = prop => event => {
    this.setState({ [prop]: event.target.value });
  };

  handleIssueAddressedChange = event => {
    this.setState({ issue: event.target.value });
  };

  renderAddNewProject() {
    const { classes, handleChange, fields } = this.props;

    return (
      <Card className={classes.card} square>
        <div className={classes.details}>
          <CardContent className={classes.content}>
            <Typography variant="headline" gutterBottom>
              Add a New Project
            </Typography>
            <TextField
              required
              label="Project Name"
              placeholder=""
              fullWidth
              margin="normal"
              style={{ paddingBottom: 16 }}
              InputLabelProps={{ shrink: true }}
              name={FieldName.title}
              id={FieldName.title}
              key={FieldName.title}
              value={fieldValue(fields, FieldName.title)}
              error={fieldHasError(fields, FieldName.title)}
              helper={fieldErrorText(fields, FieldName.title)}
              onChange={handleChange}
            />
            <TextField
              required
              /* id="standard-multiline-static" */
              label="Description"
              placeholder=""
              fullWidth
              multiline
              rows="4"
              margin="normal"
              style={{ paddingBottom: 16 }}
              InputLabelProps={{ shrink: true }}
              name={FieldName.description}
              id={FieldName.description}
              key={FieldName.description}
              value={fieldValue(fields, FieldName.description)}
              error={fieldHasError(fields, FieldName.description)}
              helper={fieldErrorText(fields, FieldName.description)}
              onChange={handleChange}
            />
            <TextField
              label="URL for volunteer sign-up"
              placeholder=""
              fullWidth
              margin="normal"
              style={{ paddingBottom: 16 }}
              InputLabelProps={{ shrink: true }}
              name={FieldName.volunteerSignupUrl}
              id={FieldName.volunteerSignupUrl}
              key={FieldName.volunteerSignupUrl}
              value={fieldValue(fields, FieldName.volunteerSignupUrl)}
              error={fieldHasError(fields, FieldName.volunteerSignupUrl)}
              helper={fieldErrorText(fields, FieldName.volunteerSignupUrl)}
              onChange={handleChange}
            />
          </CardContent>
        </div>
        <CardMedia
          className={classes.cover}
          image="https://d3cbihxaqsuq0s.cloudfront.net/images/43959970_xl.jpg"
        />
      </Card>
    );
  }

  renderVolunteerDetails() {
    const { classes } = this.props;

    return (
      <Paper className={classes.paper} square>
        <Typography variant="headline" gutterBottom>
          Volunteer Details
        </Typography>
        <TextField
          id="standard-multiline-static"
          label="Description of Volunteers Needed"
          placeholder=""
          fullWidth
          multiline
          rows="4"
          margin="normal"
          style={{ paddingBottom: 16 }}
          InputLabelProps={{ shrink: true }}
        />
        <Typography variant="caption" gutterBottom>
          Type of Volunteers Needed
        </Typography>
        <Grid container className={classes.textFieldGroup} spacing={24}>
          <Grid item xs={12} sm={4}>
            <TextField
              id="standard-name"
              placeholder="Volunteer Role"
              margin="normal"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              id="standard-name"
              placeholder="No. of Volunteers"
              margin="normal"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              id="standard-name"
              placeholder="Commitment Level"
              margin="normal"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={1}>
            <IconButton>
              <Icon color="secondary">remove_circle</Icon>
            </IconButton>
          </Grid>
          <IconButton>
            <Icon color="primary">add_circle</Icon>
          </IconButton>
        </Grid>
        <TextField
          id="standard-multiline-static"
          label="Volunteer Benefits"
          placeholder=""
          fullWidth
          multiline
          rows="4"
          margin="normal"
          style={{ paddingBottom: 16 }}
          InputLabelProps={{ shrink: true }}
        />
      </Paper>
    );
  }

  renderProjectDetails() {
    const { classes, theme } = this.props;

    return (
      <Paper className={classes.paper} square>
        <Typography variant="headline" gutterBottom>
          Project Details
        </Typography>
        <Grid container className={classes.textFieldGroup} spacing={24}>
          <Grid item xs={8} sm={6}>
            <TextField
              id="date"
              type="date"
              label="Start Date"
              margin="normal"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={8} sm={6}>
            <TextField
              id="date"
              type="date"
              label="End Date"
              margin="normal"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
        <TextField
          id="standard-multiline-static"
          label="Time"
          placeholder=""
          fullWidth
          margin="normal"
          style={{ paddingBottom: 16 }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          id="standard-multiline-static"
          label="Location"
          placeholder=""
          fullWidth
          margin="normal"
          style={{ paddingBottom: 16 }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          select
          label="Project Type"
          placeholder="Pick a Project Type"
          value={this.state.projectType}
          onChange={this.handleProjectTypeChange('projectType')}
          style={{ width: 200 }}
        >
          {projectType.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <FormControl className={classes.formControl} required fullWidth>
          <InputLabel htmlFor="select-multiple-chip" shrink>
            Issues Addressed
          </InputLabel>
          <Select
            multiple
            value={this.state.issue}
            onChange={this.handleIssueAddressedChange}
            input={<Input id="select-multiple-chip" />}
            renderValue={selected => (
              <div className={classes.chips}>
                {selected.map(value => (
                  <Chip key={value} label={value} className={classes.chip} />
                ))}
              </div>
            )}
            MenuProps={MenuProps}
          >
            {issueAddressed.map(issue => (
              <MenuItem
                key={issue}
                value={issue}
                style={{
                  fontWeight:
                    this.state.issue.indexOf(issue) === -1
                      ? theme.typography.fontWeightRegular
                      : theme.typography.fontWeightMedium,
                }}
              >
                {issue}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>
    );
  }

  handleSubmit = async event => {
    event.preventDefault();

    if (!this.props.validateAllFields()) {
      return;
    }

    const { authenticator } = this.props.context.utils;
    const currentUser = authenticator.getCurrentUser();

    const filledInProjectDetails = { ...this.props.valuesForAllFields() };
    const { title, description, volunteerSignupUrl } = filledInProjectDetails;

    const newProject = {
      title: title,
      coverImageUrl:
        'https://s3-ap-southeast-1.amazonaws.com/ssn-app-maryana/greenland.png',
      description: description,
      volunteerSignupUrl: volunteerSignupUrl,
      volunteerRequirements: '',
      projectOwner: currentUser.id,
      issuesAddressed: [],
      volunteerRequirementsDescription: '',
      volunteerBenefitsDescription: '',
      projectType: ProjectType.RECURRING,
      time: '9 AM',
      location: ProjectLocation.WEST,
      state: ProjectState.PENDING_APPROVAL,
      startDate: new Date(2018, 10, 1),
      endDate: new Date(2018, 10, 1),
      frequency: ProjectFrequency.A_FEW_TIMES_A_YEAR,
    };

    this.setState({ project: newProject });
    
    const { showAlert } = this.props.context.updaters;
    const { requestWithAlert } = this.props.context.utils;
    
    this.setState({ isSubmitting: true });
    const response = await requestWithAlert.post(
      '/api/v1/projects/new',
      { project: newProject },
      { authenticated: true }
    );
    this.setState({ isSubmitting: false });
    
    if (response.isSuccessful) {
      showAlert(
        'projectAddedSuccess',
        AlertType.SUCCESS,
        ADD_PROJECT_SUCCESS_MESSAGE
      );
      this.props.resetAllFields();
      this.setState({ hasSubmitted: true });
    }

    if (response.hasError) {
      const errors = await extractErrors(response);
      showAlert('projectAddedFailure', AlertType.ERROR, formatErrors(errors));
      this.setState({ hasSubmitted: false });
    }
  };

  render() {
    const { classes } = this.props;
    const { hasSubmitted } = this.state;
    if (hasSubmitted) {
      return (
        <Redirect
          to={{
            pathname: '/project_owner/dashboard',
          }}
        />
      );
    }

    return (
      <form onSubmit={this.handleSubmit}>
        <div className={classes.root}>
          <Grid container spacing={16}>
            <Grid item xs={12}>
              {this.renderAddNewProject()}
            </Grid>
            <Grid item xs={12} sm={6}>
              {this.renderVolunteerDetails()}
            </Grid>
            <Grid item xs={12} sm={6}>
              {this.renderProjectDetails()}
            </Grid>
            <Grid item xs={12}>
              <ProjectOwnerDetails />
            </Grid>
          </Grid>
        </div>
        <BottomNavigation className={classes.bottomNavigation}>
          <div className={classes.buttonGroup}>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              className={classes.button}
            >
              Submit
            </Button>
            <Button
              variant="contained"
              className={classes.button}
              component={Link}
              to="/preview"
            >
              Preview
            </Button>
          </div>
        </BottomNavigation>
      </form>
    );
  }
}

const styles = theme => ({
  root: {
    flexGrow: 1,
    width: '80vw',
    margin: '0 auto',
    padding: '60px 0',
  },
  paper: {
    padding: theme.spacing.unit * 2,
  },
  card: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: '1 0 auto',
  },
  cover: {
    minWidth: '600px',
    objectFit: 'cover',
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
  bottomNavigation: {
    backgroundColor: '#EBEBEB',
    width: '100%',
    position: 'fixed',
    bottom: 0,
    paddingBottom: theme.spacing.unit * 8,
  },
  buttonGroup: {
    width: '80vw',
  },
  button: {
    margin: theme.spacing.unit * 1.5,
    float: 'right',
  },
});

const projectType = [
  {
    value: 'Event',
    label: 'Event',
  },
  {
    value: 'Recurring',
    label: 'Recurring',
  },
];

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const issueAddressed = [
  'AIR_QUALITY',
  'AWARENESS_AND_EDUCATION',
  'BIODIVERSITY',
  'CLIMATE',
  'CONSERVATION',
  'ENERGY',
  'FOOD_AND_AGRICULTURE',
  'GREEN_LIFESTYLE',
  'LAND_AND_NOISE_POLLUTION',
  'PLANNING_AND_TRANSPORTATION',
  'PRODUCTION_AND_CONSUMPTION',
  'OTHER',
  'SPORTS_AND_RECREATION',
  'WASTE',
  'WATER',
  'GREEN_TECHNOLOGY',
];

const ADD_PROJECT_SUCCESS_MESSAGE =
  'You have successfully added a new project!';

const FieldName = getFieldNameObject([
  'title',
  'description',
  'volunteerSignupUrl',
]);

const constraints = {
  [FieldName.title]: {
    presence: { allowEmpty: false },
    length: { maximum: 50 },
  },
  [FieldName.description]: {
    presence: { allowEmpty: false },
    length: { maximum: 5000 },
  },
  [FieldName.volunteerSignupUrl]: {
    isUrl: { allowEmpty: true },
  },
};

export const ProjectOwnerNewProject = withForm(FieldName, constraints)(
  withContext(AppContext)(
    withTheme()(withStyles(styles)(_ProjectOwnerNewProject))
  )
);
