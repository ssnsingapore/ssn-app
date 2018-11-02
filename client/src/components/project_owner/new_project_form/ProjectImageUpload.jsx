import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Button, Grid, IconButton } from '@material-ui/core';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';

export class _ProjectImageUpload extends Component {
  state = {
    imageSrc: '',
  };

  handleChange = () => {
    const file = this.props.projectImageInput.current.files[0];
    const imageSrc = window.URL.createObjectURL(file);
    const image = new Image();
    image.src = imageSrc;
    // image.onload(() => console.log(image.width, image.height));
    this.setState({ imageSrc });
  };

  handleCancel = () => {
    this.props.projectImageInput.current.value = '';
    this.setState({ imageSrc: '' });
  };

  renderButton = () => {
    const { classes } = this.props;
    const { imageSrc } = this.state;

    return !imageSrc ? (
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
          backgroundImage: `url(${imageSrc})`,
        }}
      >
        <IconButton className={classes.iconButton} onClick={this.handleCancel}>
          <HighlightOffIcon />
        </IconButton>
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

const defaultImage =
  'https://webgradients.com/public/webgradients_png/053%20Soft%20Grass.png';

const styles = theme => ({
  defaultImage: {
    objectFit: 'cover',
    height: '100%',
    backgroundImage: `url(${defaultImage})`,
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
});

export const ProjectImageUpload = withStyles(styles)(_ProjectImageUpload);
