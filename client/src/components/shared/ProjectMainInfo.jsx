import React from 'react';
import moment from 'moment';
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

import { IssueAddressedDisplayMapping } from 'components/shared/display_mappings/IssueAddressedDisplayMapping';
import { ProjectFrequencyDisplayMapping } from 'components/shared/display_mappings/ProjectFrequencyDisplayMapping';
import { ProjectRegionDisplayMapping } from 'components/shared/display_mappings/ProjectRegionDisplayMapping';
import { ProjectTypeDisplayMapping } from 'components/shared/display_mappings/ProjectTypeDisplayMapping';
import { VolunteerRequirementTypeDisplayMapping } from 'components/shared/display_mappings/VolunteerRequirementTypeDisplayMapping';
import { ProjectType } from 'components/shared/enums/ProjectType';

import { capitalizeWords } from 'util/capitalizeWords';
import { convertToAbsoluteUrl } from 'util/url';

const renderRow = (label, value) => (
  <Typography variant="body1" gutterBottom>
    <strong>{label}: </strong>
    {value ? value : '-'}
  </Typography>
);

const renderVolunteerDetailsTable = (volunteerRequirements, classes) => (
  <React.Fragment>
    <Typography variant="body1" data-test-id="volunteerRequirementHeadline">
      We need the following volunteers:
    </Typography>
    <Table className={classes.table}>
      <TableHead>
        <TableRow>
          <TableCell>Volunteer Roles</TableCell>
          <TableCell align="right">No. of Volunteers</TableCell>
          <TableCell align="right">Commitment Level</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {volunteerRequirements.map(requirement => {
          return (
            <TableRow key={requirement._id}>
              <TableCell component="th" scope="row">
                {VolunteerRequirementTypeDisplayMapping[requirement.type]
                  ? VolunteerRequirementTypeDisplayMapping[requirement.type]
                  : '-'}
              </TableCell>
              <TableCell align="right">
                {requirement.number ? `${requirement.number} volunteers` : '-'}
              </TableCell>
              <TableCell align="right">
                {requirement.commitmentLevel
                  ? requirement.commitmentLevel
                  : '-'}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </React.Fragment>
);

const renderAllVolunteerRequirements = (
  volunteerRequirements,
  volunteerRequirementsDescription,
  classes
) => (
  <React.Fragment>
    {volunteerRequirements && volunteerRequirements.length !== 0
      ? renderVolunteerDetailsTable(volunteerRequirements, classes)
      : ''}
    {volunteerRequirementsDescription ? (
      <Typography
        variant="body1"
        data-test-id="volunteerRequirementDescription"
      >
        {volunteerRequirementsDescription}
      </Typography>
    ) : (
      ''
    )}
  </React.Fragment>
);

const renderIssuesAddressed = (classes, project) => {
  const { issuesAddressed } = project;

  if (issuesAddressed && issuesAddressed.length !== 0) {
    return (
      <React.Fragment>
        <br />
        {issuesAddressed.map(issueAddressed => {
          return (
            <Chip
              key={issueAddressed}
              label={IssueAddressedDisplayMapping[issueAddressed]}
              className={classes.chip}
            />
          );
        })}
      </React.Fragment>
    );
  }
  return '-';
};

const renderProjectBaseDetails = (classes, project, role) => {
  const { title, description, volunteerSignupUrl, coverImageUrl } = project;
  const inputUrl = convertToAbsoluteUrl(volunteerSignupUrl);

  return (
    <Card className={classes.card} square>
      <CardContent className={classes.content}>
        {title ? (
          <Typography
            variant="h5"
            gutterBottom
            className={classes.headline}
          >
            {capitalizeWords(title)}
          </Typography>
        ) : (
          <Typography
            variant="h5"
            color="error"
            gutterBottom
            className={classes.headline}
          >
              Project Title (Required)
          </Typography>
        )}
        {description ? (
          description.split('\n').map((i, key) => {
            return (
              <Typography key={key} variant="body1" gutterBottom paragraph>
                {i}
              </Typography>
            );
          })
        ) : (
          <Typography color="error" gutterBottom>
              Project description (required)
          </Typography>
        )}
        {volunteerSignupUrl ? (
          <Button
            variant="contained"
            href={inputUrl}
            fullWidth
            target="_blank"
            color="secondary"
            size="large"
            style={{ textAlign: 'center', marginBottom: '8px' }}
          >
            Sign up as a volunteer!
          </Button>
        ) : (
          ''
        )}
        {role === 'ADMIN' && volunteerSignupUrl ? (
          <Typography variant="caption" gutterBottom align="center">
            <em>This button redirects the project viewer to {inputUrl}.</em>
          </Typography>
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

  const isVolunteerRequirementsAndDescriptionEmpty =
    (!volunteerRequirements || volunteerRequirements.length === 0) &&
    !volunteerRequirementsDescription;

  return (
    <Paper className={classes.paper} square>
      <Typography variant="h5" gutterBottom className={classes.headline}>
        Volunteer Details
      </Typography>
      <div className={classes.tableWrapper}>
        {isVolunteerRequirementsAndDescriptionEmpty
          ? '-'
          : renderAllVolunteerRequirements(
            volunteerRequirements,
            volunteerRequirementsDescription,
            classes
          )}
      </div>
      <Typography variant="body1">Volunteer benefits:</Typography>
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
    region,
    address,
    projectType,
    frequency,
  } = project;

  return (
    <Paper className={classes.paper} square>
      <Typography variant="h5" gutterBottom className={classes.headline}>
        Project Details
      </Typography>
      {renderRow('Project Type', ProjectTypeDisplayMapping[projectType])}
      {projectType === ProjectType.EVENT &&
        renderRow(
          'Start date',
          moment(startDate)
            .format('dddd, Do MMMM YYYY')
        )}
      {projectType === ProjectType.EVENT &&
        renderRow(
          'End date',
          moment(endDate)
            .format('dddd, Do MMMM YYYY')
        )}
      {projectType === ProjectType.RECURRING &&
        renderRow('Frequency', ProjectFrequencyDisplayMapping[frequency])}
      {renderRow(
        'Time',
        time ? moment(time, 'HH:mm').format('h:mm A') : undefined
      )}
      {renderRow('Region', ProjectRegionDisplayMapping[region])}
      {renderRow('Address', address)}
      {renderRow('Issues Addressed', renderIssuesAddressed(classes, project))}
    </Paper>
  );
};

const _ProjectMainInfo = ({ classes, project, role }) => {
  return (
    <Grid container spacing={16}>
      <Grid item xs={12}>
        {renderProjectBaseDetails(classes, project, role)}
      </Grid>
      <Grid item xs={12} sm={6}>
        {renderVolunteerDetails(classes, project)}
      </Grid>
      <Grid item xs={12} sm={6}>
        {renderProjectDetails(classes, project)}
      </Grid>
    </Grid>
  );
};

const styles = theme => ({
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
    minHeight: '480px',
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

export const _testExports = {
  ProjectMainInfo: _ProjectMainInfo,
};
