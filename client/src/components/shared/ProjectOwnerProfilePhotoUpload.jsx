import React, { Component } from 'react';
import { Button } from '@material-ui/core';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import { withStyles } from '@material-ui/core/styles';
import classnames from 'classnames';
import { PROJECT_OWNER_PROFILE_DISPLAY_HEIGHT, PROJECT_OWNER_PROFILE_DISPLAY_WIDTH } from '../public/ProjectOwnerSignUpForm';

export class _ProjectOwnerProfilePhotoUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imageSrc: '',
      isImageTooLowResolution: false,
    };

  }

  handleChange = () => {
    const file = this.props.profilePhotoInput.current.files[0];
    const imageSrc = window.URL.createObjectURL(file);

    const image = new Image();
    image.src = imageSrc;
    image.addEventListener('load', () => {
      if (image.height < PROJECT_OWNER_PROFILE_DISPLAY_HEIGHT ||
        image.width < PROJECT_OWNER_PROFILE_DISPLAY_WIDTH) {
        this.setState({ isImageTooLowResolution: true });
      }
    });

    this.setState({ imageSrc });
  }

  handleCancel = () => {
    this.props.profilePhotoInput.current.value = '';
    this.setState({ imageSrc: '', isImageTooLowResolution: false });
  }

  renderButton = () => {
    const { classes } = this.props;
    const { imageSrc } = this.state;

    return (
      !imageSrc ? (
        <label htmlFor="profile_photo_upload">
          <Button
            color="primary"
            variant="contained"
            className={classes.button}
            component="span"
          >
            Upload profile photo
            <CloudUploadIcon className={classes.rightIcon} />
          </Button>
          <p style={{ fontSize: '0.75rem' }}>
            The display size will be 200 x 200 pixels
          </p>
        </label>

      ) : (
        <Button
          color="default"
          variant="contained"
          className={classes.button}
          onClick={this.handleCancel}
        >
            Cancel
        </Button>
      )
    );

  }

  render() {

    const { classes } = this.props;
    const { imageSrc, isImageTooLowResolution } = this.state;

    const { profilePhotoUrl } = this.props;

    const imageClass = isImageTooLowResolution ?
      classnames(classes.image, classes.imageWithError) : classes.image;

    return (
      <div>

        {(profilePhotoUrl || imageSrc) &&
          <img
            alt="New profile"
            src={imageSrc ? imageSrc : profilePhotoUrl.value}
            className={imageClass}
          />
        }
        {isImageTooLowResolution &&
          <p className={classes.errorText}>
            The image you have uploaded is smaller than the display resolution of 200 x 200 pixels.
          </p>
        }
        <input
          type="file"
          accept="image/*"
          ref={this.props.profilePhotoInput}
          onChange={this.handleChange}
          id="profile_photo_upload"
          className={classes.uploadInput}
        />
        {this.renderButton()}
      </div>
    );
  }
}
const styles = theme => ({
  uploadInput: {
    display: 'none',
  },
  button: {
    marginTop: theme.spacing.unit * 2,
  },
  image: {
    width: '200px',
    height: '200px',
    objectFit: 'cover',
    display: 'block',
    paddingTop: '20px',
  },
  imageWithError: {
    border: `1px solid ${theme.palette.error.main}`,
  },
  rightIcon: {
    marginLeft: theme.spacing.unit,
  },
  errorText: {
    color: theme.palette.error.main,
    fontSize: '0.75rem',
  },
});

export const ProjectOwnerProfilePhotoUpload = withStyles(styles)(_ProjectOwnerProfilePhotoUpload);