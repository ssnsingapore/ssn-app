import { RequestWithAlert } from './RequestWithAlert';

const CURRENT_USER_KEY = 'currentUser';

export class Authenticator {
  constructor(requestWithAlert, setAuthState) {
    if (!(requestWithAlert instanceof RequestWithAlert)) {
      throw Error('Authenticator must be instantiated with a RequestWithAlert instance');
    }

    if (!setAuthState) {
      throw Error('Authenticator must be instantianted with a setAuthState function');
    }

    this.requestWithAlert = requestWithAlert;
    this.setAuthState = setAuthState;
  }

  isAuthenticated = () => {
    return !!localStorage.getItem(CURRENT_USER_KEY);
  }

  getCurrentUser = () => {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
  }

  signUp = async (
    user,
    networkErrorHandler,
  ) => {
    const data = { user };
    const response = await this.requestWithAlert
      .onNetworkError(networkErrorHandler)
      .post('/api/v1/users', data, { authenticated: true });

    if (response.isSuccessful) {
      const { user } = await response.json();
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      this.setAuthState(true);
    }

    return response;
  }

  login = async (
    email,
    password,
    networkErrorHandler,
  ) => {
    const data = { user: { email, password } };
    const response = await this.requestWithAlert
      .onNetworkError(networkErrorHandler)
      .post('/api/v1/login', data, { authenticated: true });

    if (response.isSuccessful) {
      const { user } = await response.json();
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      this.setAuthState(true);
    }

    return response;
  }

  logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    this.setAuthState(false);
  }
}
