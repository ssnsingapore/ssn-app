import React from 'react';

const defaultAppContext = {
  currentUser: null,
  isAuthenticated: false,
  alerts: {},
  updaters: {
    showAlert: (key, type, message) => {},
    hideAlert: (key) => {},
  },
  utils: {
    authenticator: null,
    requestWithAlert: null,
  },
};

export const AppContext = React.createContext(defaultAppContext);
