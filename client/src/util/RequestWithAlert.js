import { AlertType, NETWORK_ERROR_MESSAGE } from 'components/shared/Alert';

export class RequestWithAlert {
  constructor(showAlert) {
    this.showAlert = showAlert;
  }

  onNetworkError = (handler) => {
    this.networkErrorHandler = handler;
    return this;
  }

  constructHeaders = (token) => {
    const headers = { 'Content-Type': 'application/json' };
    return headers;
  }

  setCredentials = (authenticated) => {
    // Set to 'include' to allow CORS
    return authenticated? 'same-origin' : 'omit';
  }

  get = async (url, options = {}) => {
    const { authenticated } = options;

    return this.execute(
      url,
      {
        headers: this.constructHeaders(),
        credentials: this.setCredentials(authenticated),
      },
    );
  }

  put = async (url, body, options = {}) => {
    const { authenticated } = options;

    return this.execute(
      url,
      {
        method: 'put',
        headers: this.constructHeaders(),
        body: JSON.stringify(body),
        credentials: this.setCredentials(authenticated),
      },
    );
  }

  post = async (url, body, options = {}) => {
    const { authenticated } = options;

    return this.execute(
      url,
      {
        method: 'post',
        headers: this.constructHeaders(),
        body: JSON.stringify(body),
        credentials: this.setCredentials(authenticated),
      },
    );
  }

  delete = async (url, options = {}) => {
    const { authenticated } = options;

    return this.execute(
      url,
      {
        method: 'delete',
        headers: this.constructHeaders(),
        credentials: this.setCredentials(authenticated),
      },
    );
  }

  uploadFile = async (url, formData, token) => {
    // Do not includea any headers to
    // ensure that browser correctly sets a boundary
    // for the multipart request.
    // See https://stackoverflow.com/questions/39280438/fetch-missing-boundary-in-multipart-form-data-post
    return this.execute(
      url,
      {
        method: 'post',
        body: formData,
      },
    );
  }

  execute = async (url, options) => {
    try {
      const response = await fetch(url, options);

      if (response.ok) {
        response.isSuccessful = true;
      } else {
        response.hasError = true;
      }

      return response;
    } catch(err) {
      if (this.networkErrorHandler) {
        this.networkErrorHandler();
      }

      this.showAlert(
        'networkError',
        AlertType.ERROR,
        NETWORK_ERROR_MESSAGE,
      );
      return {};
    }
  }
}
