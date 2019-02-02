import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Card, CardContent, CardMedia, Typography } from '@material-ui/core';

import { AppContext } from '../main/AppContext';
import { withContext } from 'util/context';
import { AccountType } from 'components/shared/enums/AccountType';
import { convertToAbsoluteUrl } from 'util/url';
import { AccountTypeDisplayMapping } from 'components/shared/display_mappings/AccountTypeDisplayMapping';

class _ProjectOwnerDetails extends Component {
  renderDescriptionOrPersonalBio = (projectOwner) => {

    if (projectOwner.accountType === AccountType.ORGANISATION) {
      return (
        <Typography>
          <strong>Description: </strong>
          {projectOwner.description || '-'}
        </Typography>
      );
    }

    return (
      <Typography>
        <strong>Personal Bio: </strong>
        {projectOwner.personalBio || '-'}
      </Typography>
    );
  };

  renderTitleAndName = (projectOwner) => {
    const { type } = this.props;

    return (
      <React.Fragment>
        {type !== 'list' &&
          <Typography variant="h5" gutterBottom>
            Project Owner Details
          </Typography>
        }

        {type !== 'list' ?
          <Typography>
            <strong>Name: </strong>
            {projectOwner.name}
          </Typography> :
          <Typography variant='h5' gutterBottom>
            {projectOwner.name}
          </Typography>
        }
      </React.Fragment>
    );
  }

  render = () => {

    const { classes } = this.props;

    const projectOwner = this.props.projectOwner
      ? this.props.projectOwner
      : this.props.context.utils.authenticator.getCurrentUser();


    return (
      <Card className={classes.card} square>
        <CardMedia
          className={classes.cover}
          image={projectOwner.profilePhotoUrl}
        />
        <div className={classes.details}>
          <CardContent className={classes.content}>
            {this.renderTitleAndName(projectOwner)}
            <Typography>
              <strong>Email: </strong>
              <a href={`mailto:${projectOwner.email}`} className={classes.links}>
                {projectOwner.email}
              </a>
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
              {projectOwner.websiteUrl ?
                <a
                  target='_blank'
                  rel='noopener noreferrer'
                  href={convertToAbsoluteUrl(projectOwner.websiteUrl)}
                  className={classes.links}>
                  {projectOwner.websiteUrl}
                </a> : '-'}
            </Typography>
            <Typography>
              <strong>Social Media Link: </strong>
              {projectOwner.socialMediaLink ?
                <a
                  target='_blank'
                  rel='noopener noreferrer'
                  href={convertToAbsoluteUrl(projectOwner.socialMediaLink)}
                  className={classes.links}>
                  {projectOwner.socialMediaLink}
                </a> : '-'}
            </Typography>
            {this.renderDescriptionOrPersonalBio(projectOwner)}
          </CardContent>
        </div>
      </Card>
    );
  };
}

const styles = () => ({
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
  links: {
    textDecoration: 'none',
    color: '#3E9992',
  },
});

export const ProjectOwnerDetails = withContext(AppContext)(
  withStyles(styles)(_ProjectOwnerDetails)
);

export const _testExports = {
  ProjectOwnerDetails: _ProjectOwnerDetails,
};
