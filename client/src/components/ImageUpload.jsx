import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';

import { AppContext } from './AppContext';
import { withContext } from 'util/context';
import { extractErrors, formatErrors } from 'util/errors';
import { AlertType } from './Alert';

import defaultImage from 'assets/image-placeholder.svg';

class _ImageUpload extends Component {
  constructor(props) {
    super(props);

    this.fileInput = React.createRef();
    this.state = {
      imageSrc: defaultImage,
    };
  }

  handleChange = () => {
    const file = this.fileInput.current.files[0];
    const imageSrc = window.URL.createObjectURL(file);

    this.setState({ imageSrc });
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
    formData.append('name', file.name);
    formData.append('image', file);

    const response = await requestWithAlert
      .uploadFile('/api/v1/images', formData);

    if (response.isSuccessful) {
      // Doing this also resets the readonly FileList object (this.fileInput.current.files)
      this.fileInput.current.value = '';
      this.setState({ imageSrc: defaultImage });
      showAlert('imageUploadSuccess', AlertType.SUCCESS, 'Your image was uploaded successfully!');
    }

    if (response.hasError) {
      const errors = await extractErrors(response);
      showAlert('imageUploadFailure', AlertType.ERROR, formatErrors(errors));
    }
  }

  render() {
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
          {file ?
            <Button
              type="submit"
              color="default"
              variant="contained"
            >
              Confirm Upload
            </Button>
            :
            <label htmlFor="image_upload">
              <Button
                color="primary"
                variant="contained"
                component="span"
              >
                Upload File
              </Button>
            </label>
          }
        </form>
      </div>
    );
  }
}

const styles = {
  uploadContainer: {
    width: '600px',
    height: '400px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundSize: 'cover',
  },
  uploadInput: {
    display: 'none',
  },
};

export const ImageUpload = withStyles(styles)(
  withContext(AppContext)(_ImageUpload)
);
