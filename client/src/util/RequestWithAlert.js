import { AlertType, NETWORK_ERROR_MESSAGE } from 'components/shared/Alert';
import { CSRF_TOKEN_KEY } from './storage_keys';

export class RequestWithAlert {
  constructor(showAlert) {
    this.showAlert = showAlert;
  }

  onAuthenticationError = (handler) => {
    this.authenticationErrorHandler = handler;
    return this;
  }

  onNetworkError = (handler) => {
    this.networkErrorHandler = handler;
    return this;
  }

  getCsrfToken = () => {
    return localStorage.getItem(CSRF_TOKEN_KEY);
  }

  constructHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'CSRF-Token': this.getCsrfToken(),
    };
  }

  setCredentials = (authenticated) => {
    // Set to 'include' to allow CORS
    return authenticated ? 'same-origin' : 'omit';
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

  uploadForm = async (url, formData, options = {}) => {
    // Do not include any content-type headers to
    // ensure that browser correctly sets a boundary
    // for the multipart request.
    // See https://stackoverflow.com/questions/39280438/fetch-missing-boundary-in-multipart-form-data-post
    const headers = this.constructHeaders();
    const { authenticated } = options;

    delete headers['Content-Type'];

    return this.execute(
      url,
      {
        method: 'post',
        headers,
        body: formData,
        credentials: this.setCredentials(authenticated),
      },
    );
  }

  updateForm = async (url, formData, options = {}) => {
    // Do not include any content-type headers to
    // ensure that browser correctly sets a boundary
    // for the multipart request.
    // See https://stackoverflow.com/questions/39280438/fetch-missing-boundary-in-multipart-form-data-post
    const headers = this.constructHeaders();
    const { authenticated } = options;

    delete headers['Content-Type'];

    return this.execute(
      url,
      {
        method: 'put',
        headers,
        body: formData,
        credentials: this.setCredentials(authenticated),
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

      if (response.status === 401) {
        if (this.authenticationErrorHandler) {
          this.authenticationErrorHandler();
        }
      }

      return response;
    } catch (err) {
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
