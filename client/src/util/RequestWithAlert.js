import { AlertType, NETWORK_ERROR_MESSAGE } from 'components/Alert';

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
     if (token) {
       headers['Authorization'] = `Bearer ${token}`;
     }

     return headers;
  }

  get = async (url, options = {}) => {
    const { authenticated } = options;

    return this.execute(
      url,
      {
        headers: this.constructHeaders(),
        ...(authenticated && { credentials: 'include' }),
      },
    );
  }

  put = async (url, body, token) => {
    return this.execute(
      url,
      {
        method: 'put',
        headers: this.constructHeaders(token),
        body: JSON.stringify(body),
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
        ...(authenticated && { credentials: 'include' }),
      },
    );
  }

  delete = async (url, token) => {
    return this.execute(
      url,
      {
        method: 'delete',
        headers: this.constructHeaders(token),
      },
    );
  }

  uploadFile = async (url, formData, token) => {
    const headers = this.constructHeaders(token);
    // Required to ensure that correctly sets a boundary
    // for the multipart request.
    // See https://stackoverflow.com/questions/39280438/fetch-missing-boundary-in-multipart-form-data-post
    delete headers['Content-Type'];

    return this.execute(
      url,
      {
        method: 'post',
        headers,
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
