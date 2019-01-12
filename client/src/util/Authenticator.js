import { RequestWithAlert } from './RequestWithAlert';
import { CURRENT_USER_KEY, CSRF_TOKEN_KEY } from './storage_keys';

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

  setCurrentUser = (newUser) => {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
  }

  setSuccessfulAuthState = async (response) => {
    const { user } = await response.json();
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

    const csrfToken = response.headers.get('csrf-token');
    localStorage.setItem(CSRF_TOKEN_KEY, csrfToken);

    this.setAuthState(true);
  }

  clearAuthState = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(CSRF_TOKEN_KEY);
    this.setAuthState(false);
  }

  signUpProjectOwner = async (
    projectOwnerFormData,
    networkErrorHandler,
  ) => {
    const response = await this.requestWithAlert
      .onNetworkError(networkErrorHandler)
      .uploadForm('/api/v1/project_owners', projectOwnerFormData);

    return response;
  }

  signUp = async (
    user,
    networkErrorHandler,
  ) => {
    const data = { user };
    const response = await this.requestWithAlert
      .onNetworkError(networkErrorHandler)
      .post('/api/v1/users', data, { authenticated: true });

    return response;
  }

  loginUser = async (
    email,
    password,
  ) => {
    return this._baseLogin('/api/v1/login', email, password);
  }

  loginAdmin = async (
    email,
    password,
  ) => {
    return this._baseLogin('/api/v1/admins/login', email, password);
  }

  loginProjectOwner = async (
    email,
    password,
  ) => {
    return this._baseLogin('/api/v1/project_owners/login', email, password);
  }

  _baseLogin = async (
    loginPath,
    email,
    password,
  ) => {
    const data = { user: { email, password } };
    const response = await this.requestWithAlert
      .post(loginPath, data, { authenticated: true });

    if (response.isSuccessful) {
      await this.setSuccessfulAuthState(response);
    }

    return response;
  }

  logoutAdmin = async () => {
    return this._baseLogout('/api/v1/admins/logout');
  }

  logoutProjectOwner = async () => {
    return this._baseLogout('/api/v1/project_owners/logout');
  }

  _baseLogout = async (
    logoutPath,
  ) => {
    const response = await this.requestWithAlert
      .delete(logoutPath, { authenticated: true });

    if (response.isSuccessful) {
      this.clearAuthState();
    }

    return response;
  }
}
