import { AlertType, NETWORK_ERROR_MESSAGE } from 'components/Alert';

export class RequestWithAlert {
  constructor(showAlert) {
    this.showAlert = showAlert;
  }

  onNetworkError = (handler) => {
    this.networkErrorHandler = handler;
    return this;
  }

  get = async (url) => {
    return this.execute(
      url,
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  put = async (url, body) => {
    return this.execute(
      url,
      {
        method: 'put',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    );
  }

  post = async (url, body) => {
    return this.execute(
      url,
      {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    );
  }

  delete = async (url) => {
    return this.execute(
      url,
      {
        method: 'delete',
        headers: { 'Content-Type': 'application/json' },
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
