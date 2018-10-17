import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
} from '@material-ui/core';

import { AppContext } from '../main/AppContext';
import { withContext } from 'util/context';
import { extractErrors, formatErrors } from 'util/errors';
import { AlertType } from 'components/shared/Alert';
import { Spinner } from 'components/shared/Spinner';
import { ProjectOwnerDetails } from 'components/shared/ProjectOwnerDetails';

const renderRow = (label, value) => (
  <Typography variant="body1" gutterBottom>
    <strong>{label} </strong>
    {value}
  </Typography>
);

class _ProjectMainInfo extends Component {
  state = {
    isLoading: true,
    issuesAddressed: [],
    title: '',
    description: '',
    volunteerSignupUrl: '',
    volunteerRequirements: [],
    projectOwner: {},
    volunteerRequirementsDescription: '',
    volunteerBenefitsDescription: '',
    projectType: '',
    time: '',
    location: '',
    frequency: '',
    coverImageUrl: '',
  };

  async componentDidMount() {
    const { requestWithAlert } = this.props.context.utils;
    const endpoint = '/api/v1/projects/';
    const { id } = this.props;
    const response = await requestWithAlert.get(endpoint + id);

    if (response.isSuccessful) {
      const project = (await response.json()).project;
      this.setState({ ...project });
    }

    if (response.hasError) {
      const { showAlert } = this.props.context.updaters;
      const errors = await extractErrors(response);
      showAlert('getProjectsFailure', AlertType.ERROR, formatErrors(errors));
    }

    this.setState({ isLoading: false });
  }

  renderIssuesAddressed = () => {
    const { classes } = this.props;
    const { issuesAddressed } = this.state;

    return (
      <React.Fragment>
        {issuesAddressed.map(issueAddressed => {
          return (
            <Chip
              key={issueAddressed}
              label={issueAddressed}
              className={classes.chip}
            />
          );
        })}
      </React.Fragment>
    );
  };

  renderProjectBaseDetails = () => {
    const { classes } = this.props;
    const {
      title,
      description,
      volunteerSignupUrl,
      coverImageUrl,
    } = this.state;

    return (
      <Card className={classes.card} square>
        <CardContent className={classes.content}>
          <Typography
            variant="headline"
            gutterBottom
            className={classes.headline}
          >
            {title}
          </Typography>
          <Typography
            variant="body1"
            gutterBottom
            style={{ marginBottom: '60px' }}
          >
            {description}
          </Typography>
          <Button
            variant="contained"
            href={volunteerSignupUrl}
            fullWidth
            color="secondary"
            size="large"
          >
            Sign up as a volunteer!
          </Button>
        </CardContent>
        <CardMedia className={classes.cover} image={coverImageUrl} />
      </Card>
    );
  };

  renderVolunteerDetails = () => {
    const { classes } = this.props;
    const {
      volunteerRequirements,
      volunteerRequirementsDescription,
      volunteerBenefitsDescription,
    } = this.state;

    return (
      <Paper className={classes.paper} square>
        <Typography
          variant="headline"
          gutterBottom
          className={classes.headline}
        >
          Volunteer Details
        </Typography>
        <Typography variant="body2">
          We need the following volunteers:
        </Typography>
        <div className={classes.tableWrapper}>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell>Volunteer Roles</TableCell>
                <TableCell numeric>No. of Volunteers</TableCell>
                <TableCell numeric>Commitment Level</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {volunteerRequirements.map(requirement => {
                return (
                  <TableRow key={requirement._id}>
                    <TableCell component="th" scope="row">
                      {requirement.type}
                    </TableCell>
                    <TableCell numeric>
                      {requirement.number} volunteers
                    </TableCell>
                    <TableCell numeric>{requirement.commitmentLevel}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <Typography variant="body1">
            {volunteerRequirementsDescription}
          </Typography>
        </div>
        <Typography variant="body2">Volunteer benefits:</Typography>
        <Typography variant="body1">{volunteerBenefitsDescription}</Typography>
      </Paper>
    );
  };

  renderProjectDetails = () => {
    const { classes } = this.props;
    const {
      startDate,
      endDate,
      time,
      location,
      projectType,
      frequency,
    } = this.state;

    return (
      <Paper className={classes.paper} square>
        <Typography
          variant="headline"
          gutterBottom
          className={classes.headline}
        >
          Project Details
        </Typography>
        {renderRow('Start date:', startDate)}
        {renderRow('End date:', endDate)}
        {renderRow('Time:', time)}
        {renderRow('Location:', location)}
        {renderRow('Project Type:', projectType)}
        {renderRow('Frequency:', frequency)}
        {renderRow('Issues Addressed:')}
        {this.renderIssuesAddressed()}
      </Paper>
    );
  };

  render() {
    if (this.state.isLoading) {
      return <Spinner />;
    }

    console.log(this.state);
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <Grid container spacing={16}>
          <Grid item xs={12}>
            {this.renderProjectBaseDetails()}
          </Grid>
          <Grid item xs={12} sm={6}>
            {this.renderVolunteerDetails()}
          </Grid>
          <Grid item xs={12} sm={6}>
            {this.renderProjectDetails()}
          </Grid>
          <Grid item xs={12}>
            <ProjectOwnerDetails projectOwner={this.state.projectOwner} />
          </Grid>
        </Grid>
      </div>
    );
  }
}

const styles = theme => ({
  root: {},
  paper: {
    padding: theme.spacing.unit * 3,
  },
  card: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  content: {
    flexGrow: 1,
    flexDirection: 'column',
  },
  headline: {
    paddingTop: theme.spacing.unit,
    paddingBottom: theme.spacing.unit * 2,
  },
  cover: {
    minWidth: '45vw',
    objectFit: 'cover',
  },
  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
    marginBottom: theme.spacing.unit * 4,
  },
  table: {
    minWidth: 300,
    marginBottom: theme.spacing.unit * 2.5,
  },
  chip: {
    margin: theme.spacing.unit / 2,
    fontSize: '12px',
    height: '25px',
  },
});

export const ProjectMainInfo = withContext(AppContext)(
  withStyles(styles)(_ProjectMainInfo)
);
