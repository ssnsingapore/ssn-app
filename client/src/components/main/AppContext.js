import React from 'react';

export const defaultAppContext = {
  currentUser: null,
  isAuthenticated: false,
  alerts: {},
  updaters: {
    showAlert: (_key, _type, _message) => {},
    hideAlert: (_key) => {},
  },
  utils: {
    authenticator: null,
    requestWithAlert: null,
  },
};

export const AppContext = React.createContext(defaultAppContext);
