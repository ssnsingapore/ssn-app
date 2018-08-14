import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';

import { AppContext } from './AppContext';
import { withContext } from 'util/context';
import { extractErrors, formatErrors } from 'util/errors';
import { AlertType } from './Alert';

class _ImageUpload extends Component {
  constructor(props) {
    super(props);
    this.fileInput = React.createRef();
  }

  handleChange = () => {
    const file = this.fileInput.current.files[0];
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

    if (response.hasError) {
      const errors = await extractErrors(response);
      showAlert('imageUploadFailure', AlertType.ERROR, formatErrors(errors));
    }
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleUpload} >
          <input type="file" ref={this.fileInput} onChange={this.handleChange} />
          <input type="submit" />
        </form>
      </div>
    );
  }
}

const styles = {
  uploadButton: {
    borderRadius: '50%',
  },
};

export const ImageUpload = withStyles(styles)(
  withContext(AppContext)(_ImageUpload)
);
