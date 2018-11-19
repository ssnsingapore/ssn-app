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

const renderVolunteerRequirements = (project, classes) => {
  return (
    <Grid style={{ marginBottom: '10px' }}>
      <Typography variant="body1">We need:</Typography>
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
        <Typography variant="body1">-</Typography>
      )}
    </Grid>
  );
};

const renderIssuesAddressed = (project, classes) => {
  return (
    <Grid style={{ marginBottom: '10px' }}>
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
        <Typography variant="body1">-</Typography>
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
                      <Typography variant="caption">
                        {project.startDate === project.endDate
                          ? moment(project.startDate)
                            .format('dddd, Do MMMM YYYY')
                          : moment(project.startDate)
                            .format('dddd, Do MMMM YYYY') +
                          ' - ' +
                          moment(project.endDate)
                            .format('dddd, Do MMMM YYYY')}
                      </Typography>
                      <Typography variant="headline" gutterBottom>
                        {project.title}
                      </Typography>
                      <Typography
                        variant="subheading"
                        color="textSecondary"
                        gutterBottom
                      >
                        <List className={classes.removePadding}>
                          <ListItem className={classes.removePadding}>
                            <Avatar
                              alt="Profile Photo"
                              src={project.projectOwner.profilePhotoUrl}
                              className={classes.smallAvatar}
                            />
                            <ListItemText
                              className={classes.removePadding}
                              primary={project.projectOwner.name}
                            />
                          </ListItem>
                        </List>
                      </Typography>
                    </Grid>
                    <Grid item xs={1}>
                      <Paper elevation={0} className={classes.dateBadge}>
                        <Typography variant="caption">
                          {moment(project.startDate)
                            .format('MMM')}
                        </Typography>
                        <Typography variant="title" color="secondary">
                          <strong>
                            {moment(project.startDate)
                              .format('DD')}
                          </strong>
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                  <Grid container className={classes.subContentContainer}>
                    <Grid item xs={8} className={classes.projectDescription}>
                      <Typography variant="caption">
                        {project.description.length <= 320
                          ? project.description
                          : project.description.slice(0, 320) + '...'}
                      </Typography>
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
