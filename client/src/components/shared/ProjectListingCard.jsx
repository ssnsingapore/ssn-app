import React from 'react';
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

const _isRejected = project => {
  return project.state === ProjectState.REJECTED;
};

const renderRejectionMessage = (project, classes, rejectionMessageSize) => {
  if (!_isRejected(project)) {
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
  const cardContentSize = _isRejected(project) ? 8 : 12;
  const rejectionMessageSize =
    cardContentSize === 12 ? false : 12 - cardContentSize;

  return (
    <Grid container key={`${project.title}-main`}>
      <Grid item xs={cardContentSize}>
        <Grid container>
          <Card className={classes.card} square>
            <Grid container key={`${project.title}-cardContent`}>
              <Grid item xs={3}>
                <CardMedia
                  className={classes.cardMedia}
                  image={project.coverImageUrl}
                />
              </Grid>
              <Grid item xs={9}>
                <CardContent className={classes.content}>
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
                  <div className={classes.tagsContainer}>
                    {renderVolunteerRequirements(project, classes)}
                    {renderIssuesAddressed(project, classes)}
                  </div>
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
  tagsContainer: {
    marginTop: '30px',
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
});

export const ProjectListingCard = withStyles(styles)(_ProjectListingCard);
