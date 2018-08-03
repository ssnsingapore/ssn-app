import { RequestWithAlert } from './RequestWithAlert';

const TOKEN_KEY = 'token';
const CURRENT_USER_KEY = 'currentUser';

export class Authenticator {
  constructor(requestWithAlert, setAuthState, setCurrentUser) {
    if (!(requestWithAlert instanceof RequestWithAlert)) {
      throw Error('Authenticator must be instantiated with a RequestWithAlert instance');
    }

    if (!setAuthState) {
      throw Error('Authenticator must be instantianted with a setAuthState function');
    }

    if (!setCurrentUser) {
      throw Error('Authenticator must be instantianted with a setCurrentUser function');
    }

    this.requestWithAlert = requestWithAlert;
    this.setAuthState = setAuthState;
    this.setCurrentUser = setCurrentUser;
  }

  isAuthenticated = () => {
    return !!localStorage.getItem(TOKEN_KEY);
  }

  getCurrentUser = () => {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
  }

  login = async (
    email,
    password,
    networkErrorHandler,
  ) => {
    const data = { user: { email, password } };
    const response = await this.requestWithAlert
      .onNetworkError(networkErrorHandler)
      .post('/api/v1/login', data);

    if (response.isSuccessful) {
      const { token, user } = await response.json();
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      this.setAuthState(true);
      this.setCurrentUser(user);
    }

    return response;
  }

  logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    this.setAuthState(false);
  }
}
