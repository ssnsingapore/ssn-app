import React, { Component } from 'react';
import { withStyles, withTheme } from '@material-ui/core/styles';
import { Card, CardContent, CardMedia, Typography } from '@material-ui/core';

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

class _ProjectOwnerDetails extends Component {
  constructor(props) {
    super(props);

    this.state = {
      projectOwner: {},
    };
  }
  async componentDidMount() {
    const { authenticator } = this.props.context.utils;
    const currentUser = authenticator.getCurrentUser();

    this.setState({ projectOwner: currentUser });
  }

  renderProjectOwnerDetails = () => {
    const { classes } = this.props;
    const { projectOwner } = this.state;

    return (
      <Card className={classes.card}>
        <CardMedia
          className={classes.cover}
          image={projectOwner.profilePhotoUrl}
        />
        <div className={classes.details}>
          <CardContent className={classes.content}>
            <Typography variant="headline" gutterBottom>
              Project Owner Details
            </Typography>
            <Typography>
              <strong>Name: </strong>
              {projectOwner.name}
            </Typography>
            <Typography>
              <strong>Email: </strong>
              {projectOwner.email}
            </Typography>
            <Typography>
              <strong>Account Type: </strong>
              {projectOwner.accountType}
            </Typography>
            <Typography>
              <strong>Organisation Name: </strong>
              {projectOwner.organisationName}
            </Typography>
            <Typography>
              <strong>Web URL: </strong>
              {projectOwner.websiteUrl}
            </Typography>
            <Typography>
              <strong>Social Media: </strong>
              {projectOwner.socialMediaLink}
            </Typography>
            <Typography>
              <strong>Description: </strong>
              {projectOwner.description}
            </Typography>
          </CardContent>
        </div>
      </Card>
    );
  };

  render() {
    return <div>{this.renderProjectOwnerDetails()}</div>;
  }
}

export const ProjectOwnerDetails = withContext(AppContext)(
  withTheme()(withStyles(styles)(_ProjectOwnerDetails))
);
