import React from 'react';
import { Link } from 'react-router-dom';
import { Grid, Typography } from '@material-ui/core';
import { withStyles, withTheme } from '@material-ui/core/styles';
import { AppContext } from '../main/AppContext';
import { withContext } from 'util/context';
import { Spinner } from 'components/shared/Spinner';
import { ProjectListingCard } from 'components/shared/ProjectListingCard';

import { ProjectStateDisplayMapping } from './display_mappings/ProjectStateDisplayMapping';

const _getProjectStateString = (projectState) => {
  return (
    projectState === 'PENDING_APPROVAL' ?
      ` projects ${ProjectStateDisplayMapping[projectState].toLowerCase()} ` :
      ` ${ProjectStateDisplayMapping[projectState].toLowerCase()} projects `
  );
};

const renderProjects = (classes, projects, projectState, theme) => {
  if (projects.length === 0) {
    return (
      <Typography variant="subtitle1" style={{ color: theme.palette.grey[500], padding: '20px' }} >
        There are no {_getProjectStateString(projectState)} at the moment.
      </Typography>
    );
  }

  return projects.map(project => {
    const linkEndpoint = `/projects/${project._id}`;
    return (
      <Grid style={{ alignItems: 'center' }} item xs={12} key={project._id}>
        <Link
          to={linkEndpoint}
          className={classes.link}
        >
          <ProjectListingCard project={project} />
        </Link>
      </Grid>
    );
  });
};

export const _PublicProjectListing = ({
  classes,
  theme,
  projects,
  isLoading,
  projectState,
}) => {
  if (isLoading) {
    return <Spinner />;
  }

  return (
    <Grid container spacing={theme.spacing.unit}>
      {renderProjects(classes, projects, projectState, theme)}
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
