import React from 'react';
import moment from 'moment';
import {
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Paper,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

import { VolunteerRequirementTypeDisplayMapping } from 'components/shared/display_mappings/VolunteerRequirementTypeDisplayMapping';
import { IssueAddressedDisplayMapping } from 'components/shared/display_mappings/IssueAddressedDisplayMapping';
import { ProjectState } from 'components/shared/enums/ProjectState';
import { ProjectType } from 'components/shared/enums/ProjectType';
import { ProjectFrequencyDisplayMapping } from 'components/shared/display_mappings/ProjectFrequencyDisplayMapping';
import { capitalizeWords } from 'util/capitalizeWords';

const renderVolunteerRequirements = (project, classes) => {
  return (
    <Grid style={{ marginBottom: '10px' }} data-testid="volunteer-requirements">
      <Typography variant="body1">We need volunteers for:</Typography>
      {project.volunteerRequirements.length !== 0 ? (
        project.volunteerRequirements.map(requirement => {
          return (
            <Chip
              key={requirement.type}
              label={VolunteerRequirementTypeDisplayMapping[requirement.type]}
              className={classes.chip}
            />
          );
        })
      ) : (
        <Typography variant="body1" data-testid="no-volunteer-requirements">-</Typography>
      )}
    </Grid>
  );
};

const renderIssuesAddressed = (project, classes) => {
  return (
    <Grid style={{ marginBottom: '10px' }} data-testid="issues-addressed">
      <Typography variant="body1">Issues addressed:</Typography>
      {project.issuesAddressed.length !== 0 ? (
        project.issuesAddressed.map(issueAddressed => {
          return (
            <Chip
              key={issueAddressed}
              label={IssueAddressedDisplayMapping[issueAddressed]}
              className={classes.chip}
              color="primary"
            />
          );
        })
      ) : (
        <Typography variant="body1" data-testid="no-issues-addressed">-</Typography>
      )}
    </Grid>
  );
};

const renderRejectionMessage = (project, classes, rejectionMessageSize) => {
  if (!(project.state === ProjectState.REJECTED)) {
    return null;
  }
  return (
    <Grid item xs={rejectionMessageSize} className={classes.rejectionMessage}>
      <Typography variant="body2">Rejection comments:</Typography>
      <Typography variant="body1">{project.rejectionReason}</Typography>
    </Grid>
  );
};

const renderFrequencyOrEventDateInfo = (project) => {
  if (project.projectType === ProjectType.RECURRING) {
    return (
      <Typography variant="caption" data-testid="frequency">
        Recurs {ProjectFrequencyDisplayMapping[project.frequency].toLowerCase()}
      </Typography>
    );
  }

  const startDate = moment(project.startDate).format('dddd, Do MMMM YYYY');
  const endDate = moment(project.endDate).format('dddd, Do MMMM YYYY');
  const eventDatesString =
    startDate === endDate ? startDate : `${startDate} - ${endDate}`;

  return (
    <Typography variant="caption" data-testid="event-dates">
      {eventDatesString}
    </Typography>
  );
};

const renderProjectTitle = project => (
  <Typography variant="h5" gutterBottom data-testid="title">
    {capitalizeWords(project.title)}
  </Typography>
);
const renderProjectOwnerWithAvatar = (project, classes) => (
  <Typography variant="subtitle1" color="textSecondary" gutterBottom>
    <List className={classes.removePadding}>
      <ListItem className={classes.removePadding}>
        <Avatar
          alt="Profile Photo"
          src={project.projectOwner.profilePhotoUrl}
          className={classes.smallAvatar}
          data-testid="project-owner-avatar"
        />
        <ListItemText
          className={classes.removePadding}
          primary={project.projectOwner.name}
          data-testid="project-owner-name"
        />
      </ListItem>
    </List>
  </Typography>
);

const renderDateBadge = (project, classes) => {
  if (project.projectType !== ProjectType.EVENT) {
    return null;
  }

  return (
    <Paper elevation={0} className={classes.dateBadge} data-testid="date-badge">
      <Typography variant="caption">
        {moment(project.startDate).format('MMM')}
      </Typography>
      <Typography variant="subtitle1" color="secondary">
        <strong>{moment(project.startDate).format('DD')}</strong>
      </Typography>
    </Paper>
  );
};

const renderProjectDescription = project => (
  <Typography variant="caption" data-testid="description">
    {project.description.length <= 320
      ? project.description
      : project.description.slice(0, 320) + '...'}
  </Typography>
);

const _ProjectListingCard = ({ project, classes }) => {
  const cardContentSize = project.state === ProjectState.REJECTED ? 8 : 12;
  const rejectionMessageSize =
    cardContentSize === 12 ? false : 12 - cardContentSize;

  return (
    <Grid container key={`${project.title}-main`}>
      <Grid item xs={cardContentSize}>
        <Grid container>
          <Card className={classes.card}>
            <Grid container key={`${project.title}-cardContent`}>
              <Grid item xs={3}>
                <CardMedia
                  className={classes.cardMedia}
                  image={project.coverImageUrl}
                />
              </Grid>
              <Grid item xs={9}>
                <CardContent className={classes.content}>
                  <Grid container>
                    <Grid item xs={11}>
                      {renderFrequencyOrEventDateInfo(project)}
                      {renderProjectTitle(project)}
                      {renderProjectOwnerWithAvatar(project, classes)}
                    </Grid>
                    <Grid item xs={1}>
                      {renderDateBadge(project, classes)}
                    </Grid>
                  </Grid>
                  <Grid container className={classes.subContentContainer}>
                    <Grid item xs={8} className={classes.projectDescription}>
                      {renderProjectDescription(project)}
                    </Grid>
                    <Grid item xs={4}>
                      {renderVolunteerRequirements(project, classes)}
                      {renderIssuesAddressed(project, classes)}
                    </Grid>
                  </Grid>
                </CardContent>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
      {renderRejectionMessage(project, classes, rejectionMessageSize)}
    </Grid>
  );
};

const styles = theme => ({
  card: {
    display: 'flex',
    marginBottom: theme.spacing.unit,
    width: '100%',
  },
  content: {
    flex: '1 0 auto',
  },
  cardMedia: {
    width: '100%',
    height: '100%',
    minHeight: '200px',
    backgroundSize: 'cover',
  },
  subContentContainer: {
    marginTop: theme.spacing.unit * 4,
  },
  chip: {
    margin: theme.spacing.unit / 2,
    marginLeft: 0,
    fontSize: '12px',
    height: '25px',
  },
  smallAvatar: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  removePadding: {
    padding: 0,
  },
  rejectionMessage: {
    padding: theme.spacing.unit * 2,
    textAlign: 'justify',
    wordWrap: 'break-word',
  },
  projectDescription: {
    paddingRight: theme.spacing.unit * 4,
    wordWrap: 'break-word',
  },
  dateBadge: {
    backgroundColor: theme.palette.grey[200],
    border: '1px solid lightgrey',
    textAlign: 'center',
    width: theme.spacing.unit * 6,
    height: theme.spacing.unit * 6,
  },
});

export const ProjectListingCard = withStyles(styles)(_ProjectListingCard);
