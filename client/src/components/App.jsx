import React, { Component } from 'react';
import { CssBaseline } from '@material-ui/core';

import { RequestWithAlert } from 'util/RequestWithAlert';
import { Authenticator } from 'util/Authenticator';

import { AppContext } from './AppContext';
import { Routes } from './Routes';
import { Alert } from './Alert';

class App extends Component {
  constructor(props) {
    super(props);

    const requestWithAlert = new RequestWithAlert(this.showAlert);
    const authenticator = new Authenticator(
      requestWithAlert,
      this.setAuthState,
      this.setCurrentUser,
    );

    this.state = {
      currentUser: authenticator.getCurrentUser(),
      isAuthenticated: authenticator.isAuthenticated(),
      alerts: {},
      updaters: {
        showAlert: this.showAlert,
        hideAlert: this.hideAlert,
      },
      utils: {
        requestWithAlert,
        authenticator,
      },
    };
  }

  setAuthState = (authState) => {
    this.setState({ isAuthenticated: authState });
  }

  setCurrentUser = (user) => {
    this.setState({ currentUser: user });
  }

  showAlert = (key, type, message) => {
    this.setState({
      alerts: {
        ...this.state.alerts,
        [key]: { type, message, isVisible: true },
      },
    });
  }

  hideAlert = (key) => {
    const alert = this.state.alerts[key];

    this.setState({
      alerts: {
        ...this.state.alerts,
        [key]: { ...alert, isVisible: false },
      },
    });
  };

  renderAlerts = () => {
    const { alerts } = this.state;

    return Object.keys(alerts).map(key => (
      <Alert
        key={key}
        type={alerts[key].type}
        message={alerts[key].message}
        isVisible={alerts[key].isVisible}
        onClose={() => this.hideAlert(key)}
      />
    ));
  }

  render() {
    return (
      <React.Fragment>
        <CssBaseline />
        {this.renderAlerts()}
        <AppContext.Provider value={this.state}>
          <Routes />
        </AppContext.Provider>
      </React.Fragment>
    );
  }
}

export default App;
