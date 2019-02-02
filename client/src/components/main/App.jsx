import React, { Component } from 'react';
import ReactGA from 'react-ga';
import { CssBaseline } from '@material-ui/core';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import { RequestWithAlert } from 'util/RequestWithAlert';
import { Authenticator } from 'util/Authenticator';

import { AppContext } from './AppContext';
import { Routes } from './Routes';
import { Alert } from 'components/shared/Alert';

const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
  },
  palette: {
    primary: { main: '#3E9992' },
    secondary: { main: '#FF9391' },
  },
  container: {
    margin: {
      vertical: 60,
    },
    padding: {
      vertical: 45,
      horizontal: 45,
    },
  },
  overrides: {
    MuiFab: {
      secondary: {
        color: 'white',
      },
    },
    MuiFab: {
      secondary: {
        color: 'white',
      },
    },
    MuiFab: {
      secondary: {
        color: 'white',
      },
    },
  },
  formInput: {
    margin: {
      vertical: 16,
    },
  },
});

class App extends Component {
  constructor(props) {
    super(props);

    const requestWithAlert = new RequestWithAlert(this.showAlert);
    const authenticator = new Authenticator(
      requestWithAlert,
      this.setAuthState
    );
    requestWithAlert.onAuthenticationError(authenticator.clearAuthState);

    this.state = {
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

    ReactGA.initialize(process.env.REACT_APP_TRACKING_ID);
  }

  setAuthState = authState => {
    this.setState({ isAuthenticated: authState });
  };

  showAlert = (key, type, message) => {
    this.setState({
      alerts: {
        ...this.state.alerts,
        [key]: { type, message, isVisible: true },
      },
    });

    setTimeout(() => this.hideAlert(key), 5000);
  };

  hideAlert = key => {
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
  };

  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {this.renderAlerts()}
        <AppContext.Provider value={this.state}>
          <Routes />
        </AppContext.Provider>
      </MuiThemeProvider>
    );
  }
}

export default App;
