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

  _getCorrectUrl = (url) => {
    return url.includes('//') ? url : `//${url}`;
  }

  _getWebsiteUrl = () => {
    const { projectOwner } = this.state;
    if (projectOwner.websiteUrl) {
      return this._getCorrectUrl(projectOwner.websiteUrl);
    }
  }

  _getSocialMediaUrl = () => {
    const { projectOwner } = this.state;
    if (projectOwner.socialMediaLink) {
      return this._getCorrectUrl(projectOwner.socialMediaLink);
    }
  }

  renderTitleAndName = () => {
    const { projectOwner } = this.state;
    const { type } = this.props;

    return (
      <React.Fragment>
        {type !== 'list' &&
          <Typography variant="headline" gutterBottom>
            Project Owner Details
          </Typography>
        }

        {type !== 'list' ?
          <Typography>
            <strong>Name: </strong>
            {projectOwner.name}
          </Typography> :
          <Typography variant='headline' gutterBottom>
            {projectOwner.name}
          </Typography>
        }
      </React.Fragment>
    );
  }

  render = () => {

    const { classes } = this.props;
    const { projectOwner } = this.state;
    const websiteUrl = this._getWebsiteUrl();
    const socialMediaLink = this._getSocialMediaUrl();

    return (
      <Card className={classes.card} square>
        <CardMedia
          className={classes.cover}
          image={projectOwner.profilePhotoUrl}
        />
        <div className={classes.details}>
          <CardContent className={classes.content}>
            {this.renderTitleAndName()}
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
                <a target='_blank' href={websiteUrl} className={classes.links}>
                  {projectOwner.websiteUrl}
                </a> :
                '-'
              }
            </Typography>
            <Typography>
              <strong>Social Media Link: </strong>
              {projectOwner.socialMediaLink ?
                <a target='_blank' href={socialMediaLink} className={classes.links}>
                  {projectOwner.socialMediaLink}
                </a> :
                '-'
              }
            </Typography>
            {this.renderDescriptionOrPersonalBio()}
          </CardContent>
        </div>
      </Card >
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
  },
});

export const ProjectOwnerDetails = withContext(AppContext)(
  withStyles(styles)(_ProjectOwnerDetails)
);

export const _testExports = {
  ProjectOwnerDetails: _ProjectOwnerDetails,
};
