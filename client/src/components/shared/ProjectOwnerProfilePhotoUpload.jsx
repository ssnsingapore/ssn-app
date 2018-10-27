import React, { Component } from 'react';
import { Button } from '@material-ui/core';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import { withStyles } from '@material-ui/core/styles';

export class _ProjectOwnerProfilePhotoUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imageSrc: '',
    };

  }

  handleChange = () => {
    const file = this.props.profilePhotoInput.current.files[0];
    const imageSrc = window.URL.createObjectURL(file);

    // Add some logic to notify user if uploaded image is too low resolution
    const image = new Image();
    image.src = imageSrc;
    image.onload(() => console.log(image.width, image.height));

    this.setState({ imageSrc });
  }

  handleCancel = () => {
    this.props.profilePhotoInput.current.value = '';
    this.setState({imageSrc: ''});
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
        </label>) : (
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
    const { imageSrc } = this.state;

    return (
      <React.Fragment>
        {imageSrc && <img alt="Profile" src={imageSrc} className={classes.image} />}
        <input
          type="file"
          accept="image/*"
          ref={this.props.profilePhotoInput}
          onChange={this.handleChange}
          id="profile_photo_upload"
          className={classes.uploadInput}
        />
        {this.renderButton()}
      </React.Fragment>
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
  },
  rightIcon: {
    marginLeft: theme.spacing.unit,
  },
});

export const ProjectOwnerProfilePhotoUpload = withStyles(styles)(_ProjectOwnerProfilePhotoUpload);