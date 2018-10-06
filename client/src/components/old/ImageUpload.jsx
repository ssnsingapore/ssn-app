import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Button, GridList, GridListTile } from '@material-ui/core';

import { AppContext } from '../main/AppContext';
import { withContext } from 'util/context';
import { extractErrors, formatErrors } from 'util/errors';
import { AlertType } from '../shared/Alert';

import defaultImage from 'assets/image-placeholder.svg';

const DISPLAY_WIDTH = 600;
const DISPLAY_HEIGHT = 400;

class _ImageUpload extends Component {
  constructor(props) {
    super(props);

    this.fileInput = React.createRef();
    this.state = {
      imageSrc: defaultImage,
      images: [],
    };
  }

  async componentDidMount() {
    const { requestWithAlert } = this.props.context.utils;

    const response = await requestWithAlert
      .get('/api/v1/images');

    if (response.isSuccessful) {
      const images = (await response.json()).images;
      this.setState({ images });
    }

    if (response.hasError) {
      const { showAlert } = this.props.context.updaters;
      const errors = await extractErrors(response);
      showAlert('getImagesFailure', AlertType.ERROR, formatErrors(errors));
    }
  }

  handleChange = () => {
    const file = this.fileInput.current.files[0];
    const imageSrc = window.URL.createObjectURL(file);

    // Add some logic to notify user if uploaded image is too low resolution

    this.setState({ imageSrc });
  }

  handleCancel = () => {
    this.fileInput.current.value = '';
    this.setState({ imageSrc: defaultImage });
  }

  resizeImage = () => {
    const image = new Image();
    image.src = this.state.imageSrc;

    // Resize to cover the display width and height
    const width = image.width;
    const height = image.height;
    let finalWidth = width;
    let finalHeight = height;

    if (width < height && width > DISPLAY_WIDTH) {
      finalWidth = DISPLAY_WIDTH;
      finalHeight = height / width * DISPLAY_WIDTH;
    }

    if (height < width && height > DISPLAY_HEIGHT) {
      finalHeight = DISPLAY_HEIGHT;
      finalWidth = width / height * DISPLAY_HEIGHT;
    }

    const canvas = document.createElement('canvas');
    canvas.width = finalWidth;
    canvas.height = finalHeight;

    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, finalWidth, finalHeight);
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.6);
    });
  }

  handleUpload = async (event) => {
    event.preventDefault();

    const file = this.fileInput.current.files[0];

    if (!file) {
      return;
    }

    const { requestWithAlert } = this.props.context.utils;
    const { showAlert } = this.props.context.updaters;

    const formData = new FormData();
    const resizedImage = await this.resizeImage();
    formData.append('name', file.name);
    formData.append('image', resizedImage);

    const response = await requestWithAlert
      .uploadFile('/api/v1/images', formData);

    if (response.isSuccessful) {
      // Doing this also resets the readonly FileList object (this.fileInput.current.files)
      this.fileInput.current.value = '';

      const newImage = (await response.json()).image;
      this.setState({
        imageSrc: defaultImage,
        images: [
          ...this.state.images,
          newImage,
        ],
      });
      showAlert('imageUploadSuccess', AlertType.SUCCESS, 'Your image was uploaded successfully!');
    }

    if (response.hasError) {
      const errors = await extractErrors(response);
      showAlert('imageUploadFailure', AlertType.ERROR, formatErrors(errors));
    }
  }

  renderUploadButtons = (file) => {
    const { classes } = this.props;

    if (file) {
      return (
        <div className={classes.confirmCancelButtons}>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            style={{ marginBottom: '20px' }}
          >
            Confirm Upload
          </Button>
          <Button
            color="default"
            variant="contained"
            onClick={this.handleCancel}
          >
            Cancel
          </Button>
        </div>
      );
    }

    return (
      <label htmlFor="image_upload">
        <Button
          color="primary"
          variant="contained"
          component="span"
        >
          Upload File
        </Button>
      </label>
    );
  }

  renderFileUpload = () => {
    const { classes } = this.props;
    const file = this.fileInput.current ? this.fileInput.current.files[0] : null;

    return (
      <div className={classes.uploadContainer} style={{ backgroundImage: `url(${this.state.imageSrc})` }}>
        <form onSubmit={this.handleUpload} >
          <input
            type="file"
            accept="image/*"
            ref={this.fileInput}
            onChange={this.handleChange}
            id="image_upload"
            className={classes.uploadInput}
          />
          {this.renderUploadButtons(file)}
        </form>
      </div>
    );
  }

  renderImages = () => {
    const { classes } = this.props;

    return (
      <GridList
        cellHeight={160}
        className={classes.imageGrid}
        cols={3}
      >
        {this.state.images.map(image => (
          <GridListTile key={image.imageUrl} cols={1} >
            <img src={image.imageUrl} alt={image.title} />
          </GridListTile>
        ))}
      </GridList>
    );
  }

  render() {
    return (
      <div>
        {this.renderFileUpload()}
        {this.renderImages()}
      </div>
    );
  }
}

const styles = {
  uploadContainer: {
    width: `${DISPLAY_WIDTH}px`,
    height: `${DISPLAY_HEIGHT}px`,
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundSize: 'cover',
  },
  uploadInput: {
    display: 'none',
  },
  imageGridContainer: {
    display: 'flex',
  },
  imageGrid: {
    width: '600px',
    maxHeight: '600px',
    margin: '0 auto !important',
  },
  confirmCancelButtons: {
    display: 'flex',
    flexDirection: 'column',
  },
};

export const ImageUpload = withStyles(styles)(
  withContext(AppContext)(_ImageUpload)
);
