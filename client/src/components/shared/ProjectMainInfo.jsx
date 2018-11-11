import React from 'react';
import moment from 'moment';
import capitalizeTitle from 'capitalize-title';
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

const renderRow = (label, value) => (
  <Typography variant="body1" gutterBottom>
    <strong>{label}: </strong>
    {value ? value : '-'}
  </Typography>
);

const renderVolunteerDetailsTable = (volunteerRequirements, classes) => (
  <React.Fragment>
    <Typography variant="body2" data-test-id="volunteerRequirementHeadline">
      We need the following volunteers:
    </Typography>
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
                {VolunteerRequirementTypeDisplayMapping[requirement.type] ? VolunteerRequirementTypeDisplayMapping[requirement.type] : '-'}
              </TableCell>
              <TableCell numeric>
                {requirement.number
                  ? `${requirement.number} volunteers`
                  : '-'}
              </TableCell>
              <TableCell numeric>
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
        {title ? (
          <Typography
            variant="headline"
            gutterBottom
            className={classes.headline}
          >
            {capitalizeTitle(title)}
          </Typography>
        ) : (
          <Typography
            variant="headline"
            color="error"
            gutterBottom
            className={classes.headline}
          >
              Project Title (Required)
          </Typography>
        )}
        <div style={{ marginBottom: '60px' }}>
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
        </div>
        {volunteerSignupUrl ? (
          <Button
            variant="contained"
            href={inputUrl}
            fullWidth
            color="secondary"
            size="large"
            style={{ textAlign: 'center' }}
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

  const isVolunteerRequirementsAndDescriptionEmpty =
    (!volunteerRequirements || volunteerRequirements.length === 0) &&
    !volunteerRequirementsDescription;

  return (
    <Paper className={classes.paper} square>
      <Typography variant="headline" gutterBottom className={classes.headline}>
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
    region,
    address,
    projectType,
    frequency,
  } = project;

  return (
    <Paper className={classes.paper} square>
      <Typography variant="headline" gutterBottom className={classes.headline}>
        Project Details
      </Typography>
      {renderRow('Project Type', ProjectTypeDisplayMapping[projectType])}
      {projectType === ProjectType.EVENT &&
        renderRow(
          'Start date',
          moment(startDate)
            .utc()
            .format('dddd, Do MMMM YYYY')
        )}
      {projectType === ProjectType.EVENT &&
        renderRow(
          'End date',
          moment(endDate)
            .utc()
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

const _ProjectMainInfo = ({ classes, project }) => {
  return (
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
