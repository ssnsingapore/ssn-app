import React from 'react';
import { withStyles, withTheme } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';

import { AppContext } from '../main/AppContext';
import { withContext } from 'util/context';

const styles = theme => ({
  card: {
    display: 'flex',
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: '1 0 auto',
  },
  cover: {
    minWidth: '200px',
    minHeight: '200px',
    objectFit: 'cover',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
  },
  playIcon: {
    height: 38,
    width: 38,
  },
});

function _ProjectOwnerDetails(props) {
  const { classes } = props;

  return (
    <Card className={classes.card}>
      <CardMedia
        className={classes.cover}
        image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0-6cOe8ak3u1PWfiFXOmDrOgKan1exVg-T4lryx41j-W_78Hubg"
      />
      <div className={classes.details}>
        <CardContent className={classes.content}>
          <Typography variant="headline" gutterBottom>
            Project Owner Details
          </Typography>
          <Typography>
            <strong>Name: </strong>
            Lee Ling
          </Typography>
          <Typography>
            <strong>Email: </strong>
            leeling@STE.com
          </Typography>
          <Typography>
            <strong>Password: </strong>
            **********
          </Typography>
          <Typography>
            <strong>Account Type: </strong>
            Organisation
          </Typography>
          <Typography>
            <strong>Organisation Name: </strong>
            Save the Earth
          </Typography>
          <Typography>
            <strong>Web URL: </strong>
            www.savetheearth.org
          </Typography>
          <Typography>
            <strong>Social Media: </strong>
            fb.com/savetheearth
          </Typography>
          <Typography>
            <strong>Description: </strong>
            We are a non-profit organisation dedicated to awareness-raising
            events to save the Earth.
          </Typography>
        </CardContent>
      </div>
    </Card>
  );
}

export const ProjectOwnerDetails = withContext(AppContext)(
  withTheme()(withStyles(styles)(_ProjectOwnerDetails))
);
