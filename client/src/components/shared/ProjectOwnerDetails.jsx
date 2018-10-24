import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Card, CardContent, CardMedia, Typography } from '@material-ui/core';

import { AppContext } from '../main/AppContext';
import { withContext } from 'util/context';
import { AccountType } from 'components/shared/enums/AccountType';
import { AccountTypeDisplayMapping } from 'components/shared/display_mappings/AccountTypeDisplayMapping';

class _ProjectOwnerDetails extends Component {
  constructor(props) {
    super(props);

    this.state = {
      projectOwner: {},
    };
  }

  async componentDidMount() {
    const { authenticator } = this.props.context.utils;
    const projectOwner = this.props.projectOwner
      ? this.props.projectOwner
      : authenticator.getCurrentUser();

    this.setState({ projectOwner });
  }

  renderDescriptionOrPersonalBio = () => {
    const { projectOwner } = this.state;

    if (projectOwner.accountType === AccountType.ORGANISATION) {
      return (
        <Typography>
          <strong>Description: </strong>
          {projectOwner.description}
        </Typography>
      );
    }

    return (
      <Typography>
        <strong>Personal Bio: </strong>
        {projectOwner.personalBio}
      </Typography>
    );
  };

  render = () => {
    const { classes } = this.props;
    const { projectOwner } = this.state;

    return (
      <Card className={classes.card} square>
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
              {AccountTypeDisplayMapping[projectOwner.accountType]}
            </Typography>
            {projectOwner.accountType === AccountType.ORGANISATION && (
              <Typography>
                <strong>Organisation Name: </strong>
                {projectOwner.organisationName}
              </Typography>
            )}
            <Typography>
              <strong>Web URL: </strong>
              {projectOwner.websiteUrl || '-'}
            </Typography>
            <Typography>
              <strong>Social Media Link: </strong>
              {projectOwner.socialMediaLink || '-'}
            </Typography>
            {this.renderDescriptionOrPersonalBio()}
          </CardContent>
        </div>
      </Card>
    );
  };
}

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
});

export const ProjectOwnerDetails = withContext(AppContext)(
  withStyles(styles)(_ProjectOwnerDetails)
);

export const _testExports = {
  ProjectOwnerDetails: _ProjectOwnerDetails,
};
