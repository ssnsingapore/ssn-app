import React from 'react';
import { Link } from 'react-router-dom';
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
import { withStyles, withTheme } from '@material-ui/core/styles';
import { AppContext } from '../main/AppContext';
import { withContext } from 'util/context';
import { Spinner } from 'components/shared/Spinner';

import { IssueAddressedDisplayMapping } from 'components/shared/display_mappings/IssueAddressedDisplayMapping';
import { VolunteerRequirementTypeDisplayMapping } from 'components/shared/display_mappings/VolunteerRequirementTypeDisplayMapping';
import { ProjectStateDisplayMapping } from './display_mappings/ProjectStateDisplayMapping';

const renderIssuesAddressed = ( project, classes ) => {
  return (
    <React.Fragment>
      <Typography variant="body1">Issues addressed:</Typography>
      {project.issuesAddressed.map(issueAddressed => {
        return (
          <Chip
            key={issueAddressed}
            label={IssueAddressedDisplayMapping[issueAddressed]}
            className={classes.chip}
            color="primary"
          />
        );
      })}
    </React.Fragment>
  );
};

const renderVolunteerRequirements = ( project, classes ) => {
  return (
    <React.Fragment>
      <Typography variant="body1">We need:</Typography>
      {project.volunteerRequirements.map(requirement => {
        return (
          <Chip
            key={requirement.type}
            label={VolunteerRequirementTypeDisplayMapping[requirement.type]}
            className={classes.chip}
          />
        );
      })}
    </React.Fragment>
  );
};

const renderProjectListingCardContent = ( project, classes ) => {
  const cardContentSize = 12;

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
    </Grid>
  );
};

const _getLinkEndpoint = ( project ) => {
  return `/projects/${project._id}`;
};

const renderProjects = ( classes, projects, projectState ) => {
  if (projects.length === 0) {
    // TODO: Sabrina - remove logic in Projects, AdminDashboard and ProjectOwnerDashboard
    // for rendering this and fix the casing/display message below

    return  ( <Typography
      variant="subheading"
      // style={{ color: theme.palette.grey[500] }}
    >
      There are no {ProjectStateDisplayMapping[projectState]} projects at the moment.
    </Typography>);
  }

  return projects.map(project => {
    const linkEndpoint = _getLinkEndpoint(project);

    const contentGridSize = 9;
    const rightColumnGridSize =
      contentGridSize === 12 ? false : 12 - contentGridSize;

    return (
      <Grid style={{ alignItems: 'center' }} item xs={12} key={project._id}>
        <Grid container>
          <Grid item xs={12} md={contentGridSize}>
            <Link to={linkEndpoint} className={classes.link}>
              {renderProjectListingCardContent(project, classes)}
            </Link>
          </Grid>
          <Grid
            item
            xs={12}
            md={rightColumnGridSize}
            style={{ margin: 'auto' }}
          >
          </Grid>
        </Grid>
      </Grid>
    );
  });
};

export const _PublicProjectListing = ({ classes, theme, projects, isLoading, projectState }) => {
  if (isLoading) {
    return <Spinner />;
  }

  return (
    <Grid container spacing={theme.spacing.unit}>
      {renderProjects(classes, projects, projectState)}
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
  link: {
    textDecoration: 'none',
  },
  button: {
    margin: theme.spacing.unit,
    marginLeft: theme.spacing.unit * 1.5,
    marginRight: theme.spacing.unit * 0.5,
    minWidth: '80px',
  },
});

export const PublicProjectListing = withContext(AppContext)(
  withTheme()(withStyles(styles)(_PublicProjectListing))
);

//set displayName for tests to allow parent components to find component
PublicProjectListing.displayName = 'PublicProjectListing';
