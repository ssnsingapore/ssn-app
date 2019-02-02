import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import {
  Button,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fab,
} from '@material-ui/core';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import DeleteIcon from '@material-ui/icons/Delete';

import uploadImageBackground from 'assets/image-placeholder.svg';
import {
  PROJECT_IMAGE_DISPLAY_HEIGHT,
  PROJECT_IMAGE_DISPLAY_WIDTH,
} from './Constants';

class _ProjectImageUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imageSrc: '',
      isImageResolutionTooLow: false,
      shouldUseCoverImage: true,
    };
  }

  handleChange = () => {
    const file = this.props.projectImageInput.current.files[0];
    const imageSrc = window.URL.createObjectURL(file);

    const image = new Image();
    image.src = imageSrc;
    image.addEventListener('load', () => {
      if (
        image.height < PROJECT_IMAGE_DISPLAY_HEIGHT ||
        image.width < PROJECT_IMAGE_DISPLAY_WIDTH
      ) {
        this.setState({ isImageResolutionTooLow: true });
      }
    });

    this.setState({ imageSrc });
  };

  handleCancel = () => {
    this.props.projectImageInput.current.value = '';
    this.setState({
      imageSrc: '',
      isImageResolutionTooLow: false,
      shouldUseCoverImage: false,
    });
  };

  renderDialog() {
    return (
      <div>
        <Dialog
          open={this.state.isImageResolutionTooLow}
          keepMounted
          onClose={this.handleCancel}
          aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle id="alert-dialog-slide-title">
            {'Your image resolution is too low'}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              Please pick an image larger than 640 x 480 pixels.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleCancel} color="primary">
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }

  renderButton = () => {
    const { classes } = this.props;
    const {
      imageSrc,
      isImageResolutionTooLow,
      shouldUseCoverImage,
    } = this.state;
    const coverImageRender = shouldUseCoverImage
      ? this.props.coverImageUrl
      : '';

    return !(imageSrc || coverImageRender) ? (
      <Grid className={classes.defaultImage}>
        <label htmlFor="project_image_upload">
          <Button
            variant="contained"
            color="primary"
            size="medium"
            component="span"
          >
            Upload Project Image
            <CloudUploadIcon className={classes.rightIcon} />
          </Button>
        </label>
      </Grid>
    ) : (
      <Grid
        className={classes.projectImage}
        style={{
          backgroundImage: `url(${imageSrc ? imageSrc : coverImageRender})`,
        }}
      >
        <Fab
          aria-label="Delete"
          className={classes.fabutton}
          onClick={this.handleCancel}
        >
          <DeleteIcon />
        </Fab>
        {isImageResolutionTooLow && this.renderDialog()}
      </Grid>
    );
  };

  render() {
    const { classes } = this.props;

    return (
      <React.Fragment>
        <input
          type="file"
          accept="image/*"
          ref={this.props.projectImageInput}
          onChange={this.handleChange}
          id="project_image_upload"
          className={classes.uploadInput}
        />
        {this.renderButton()}
      </React.Fragment>
    );
  }
}

const styles = theme => ({
  defaultImage: {
    objectFit: 'cover',
    height: '100%',
    backgroundImage: `url(${uploadImageBackground})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectImage: {
    objectFit: 'cover',
    height: '100%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
  },
  rightIcon: {
    marginLeft: theme.spacing.unit,
  },
  uploadInput: {
    display: 'none',
  },
  iconButton: {
    margin: theme.spacing.unit,
  },
  fabutton: {
    margin: 3 * theme.spacing.unit,
  },
});

export const ProjectImageUpload = withStyles(styles)(_ProjectImageUpload);
