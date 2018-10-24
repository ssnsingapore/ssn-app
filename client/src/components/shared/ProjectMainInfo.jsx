import React from 'react';
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
import { IssuesAddressedDisplayMapping } from 'components/shared/display_mappings/IssuesAddressedDisplayMapping';
import { ProjectFrequencyDisplayMapping } from 'components/shared/display_mappings/ProjectFrequencyDisplayMapping';
import { ProjectLocationDisplayMapping } from 'components/shared/display_mappings/ProjectLocationDisplayMapping';
import { ProjectTypeDisplayMapping } from 'components/shared/display_mappings/ProjectTypeDisplayMapping';
import { VolunteerRequirementTypeDisplayMapping } from 'components/shared/display_mappings/VolunteerRequirementTypeDisplayMapping';

const renderRow = (label, value) => (
  <Typography variant="body1" gutterBottom>
    <strong>{label}: </strong>
    {value ? value : '-'}
  </Typography>
);

const renderVolunteerDetailsTable = (volunteerRequirements, classes) => (
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
              {VolunteerRequirementTypeDisplayMapping[requirement.type]}
            </TableCell>
            <TableCell numeric>{requirement.number} volunteers</TableCell>
            <TableCell numeric>{requirement.commitmentLevel}</TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  </Table>
);

const renderAllVolunteerRequirements = (
  volunteerRequirements,
  volunteerRequirementsDescription,
  classes
) => (
  <React.Fragment>
    {volunteerRequirements
      ? renderVolunteerDetailsTable(volunteerRequirements, classes)
      : ''}
    {volunteerRequirementsDescription ? (
      <Typography variant="body1">
        {volunteerRequirementsDescription}
      </Typography>
    ) : (
      ''
    )}
  </React.Fragment>
);

const dateFormatter = inputDate => {
  const newDate = new Date(inputDate);
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const day = days[newDate.getUTCDay()];

  const date = newDate.getUTCDate();
  function getOrdinal(n) {
    return ['st', 'nd', 'rd'][((((n + 90) % 100) - 10) % 10) - 1] || 'th';
  }

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const month = months[newDate.getUTCMonth()];
  const year = newDate.getUTCFullYear();

  return day + ', ' + date + getOrdinal(date) + ' ' + month + ' ' + year;
};

const renderIssuesAddressed = (classes, project) => {
  const { issuesAddressed } = project;

  if (issuesAddressed) {
    return (
      <React.Fragment>
        <br />
        {issuesAddressed.map(issueAddressed => {
          return (
            <Chip
              key={issueAddressed}
              label={IssuesAddressedDisplayMapping[issueAddressed]}
              className={classes.chip}
            />
          );
        })}
      </React.Fragment>
    );
  }
  return '-';
};

const renderProjectBaseDetails = (classes, project) => {
  const { title, description, volunteerSignupUrl, coverImageUrl } = project;

  const httpPatternRegex = /^http(s?):\/\//;

  let inputUrl = volunteerSignupUrl;
  if (!httpPatternRegex.test(volunteerSignupUrl)) {
    inputUrl = 'http://' + volunteerSignupUrl;
  }

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
        {volunteerSignupUrl ? (
          <Button
            variant="contained"
            href={inputUrl}
            fullWidth
            color="secondary"
            size="large"
          >
            Sign up as a volunteer!
          </Button>
        ) : (
          ''
        )}
      </CardContent>
      <CardMedia className={classes.cover} image={coverImageUrl} />
    </Card>
  );
};

const renderVolunteerDetails = (classes, project) => {
  const {
    volunteerRequirements,
    volunteerRequirementsDescription,
    volunteerBenefitsDescription,
  } = project;

  const isVolunteerRequirementsEmpty = !(
    volunteerRequirements && volunteerRequirementsDescription
  );

  return (
    <Paper className={classes.paper} square>
      <Typography variant="headline" gutterBottom className={classes.headline}>
        Volunteer Details
      </Typography>
      <Typography variant="body2">We need the following volunteers:</Typography>
      <div className={classes.tableWrapper}>
        {isVolunteerRequirementsEmpty
          ? '-'
          : renderAllVolunteerRequirements(
            volunteerRequirements,
            volunteerRequirementsDescription,
            classes
          )}
      </div>
      <Typography variant="body2">Volunteer benefits:</Typography>
      {volunteerBenefitsDescription ? (
        <Typography variant="body1">{volunteerBenefitsDescription}</Typography>
      ) : (
        '-'
      )}
    </Paper>
  );
};

const renderProjectDetails = (classes, project) => {
  const {
    startDate,
    endDate,
    time,
    location,
    projectType,
    frequency,
  } = project;

  return (
    <Paper className={classes.paper} square>
      <Typography variant="headline" gutterBottom className={classes.headline}>
        Project Details
      </Typography>
      {renderRow('Start date', dateFormatter(startDate))}
      {renderRow('End date', dateFormatter(endDate))}
      {renderRow('Time', time)}
      {renderRow('Location', ProjectLocationDisplayMapping[location])}
      {renderRow('Project Type', ProjectTypeDisplayMapping[projectType])}
      {renderRow('Frequency', ProjectFrequencyDisplayMapping[frequency])}
      {renderRow('Issues Addressed', renderIssuesAddressed(classes, project))}
    </Paper>
  );
};

const _ProjectMainInfo = ({ classes, project }) => {
  return (
    <div className={classes.root}>
      <Grid container spacing={16}>
        <Grid item xs={12}>
          {renderProjectBaseDetails(classes, project)}
        </Grid>
        <Grid item xs={12} sm={6}>
          {renderVolunteerDetails(classes, project)}
        </Grid>
        <Grid item xs={12} sm={6}>
          {renderProjectDetails(classes, project)}
        </Grid>
      </Grid>
    </div>
  );
};

const styles = theme => ({
  root: {},
  paper: {
    padding: theme.spacing.unit * 3,
    height: '100%',
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
    marginRight: theme.spacing.unit / 2,
    marginTop: theme.spacing.unit,
    fontSize: '12px',
    height: '25px',
  },
});

export const ProjectMainInfo = withStyles(styles)(_ProjectMainInfo);
