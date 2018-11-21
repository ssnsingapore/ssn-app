import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Typography, Paper, Button, TextField } from '@material-ui/core';
import { withStyles, withTheme } from '@material-ui/core/styles';
import { withContext } from '../../util/context';
import { AppContext } from '../main/AppContext';
import { getFieldNameObject, withForm, fieldValue } from '../../util/form';
import { AlertType } from '../shared/Alert';
import { extractErrors, formatErrors } from '../../util/errors';

import landingImage from 'assets/bg.jpg';

const LOGIN_SUCCESS_MESSAGE = 'You\'ve successfully logged in!';
const LOGIN_FAILURE_MESSAGE = 'Looks like you\'ve keyed in the wrong credentials. Try again!';

const FieldName = getFieldNameObject([
  'email',
  'hashedPassword',
]);

const constraints = {
  [FieldName.email]: {
    presence: { allowEmpty: false },
    email: true,
  },
  [FieldName.hashedPassword]: {
    presence: { allowEmpty: false },
  },
};

export class _AdminLoginPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      shouldRedirect: false,
    };
  }

  handleSubmit = async (event) => {
    event.preventDefault();

    if (!this.props.validateAllFields()) {
      return;
    }

    const { showAlert } = this.props.context.updaters;
    const { authenticator } = this.props.context.utils;

    this.setState({ isLoading: true });

    const { email, hashedPassword } = this.props.valuesForAllFields();
    const response = await authenticator.loginAdmin(email, hashedPassword);

    this.setState({ isLoading: false });

    if (response.isSuccessful) {
      this.setState({ shouldRedirect: true });
      showAlert('loginSuccess', AlertType.SUCCESS, LOGIN_SUCCESS_MESSAGE);
    }

    if (response.hasError) {
      if (response.status === 401) {
        showAlert('loginFailure', AlertType.ERROR, LOGIN_FAILURE_MESSAGE);
      } else {
        const errors = await extractErrors(response);
        showAlert('loginFailure', AlertType.ERROR, formatErrors(errors));
      }
    }
  }

  getRedirectReferrer = () => {
    const locationState = this.props.location.state;
    if (locationState && locationState.referrerPath) {
      return locationState.referrerPath;
    }
    return '/admin/dashboard';
  }

  render() {
    const { classes, fields, handleChange } = this.props;

    if (this.state.shouldRedirect) {
      return <Redirect to={this.getRedirectReferrer()} />;
    }

    return (
      <div>
        <div className={classes.landingImage}>
          <Typography
            variant="display2"
            gutterBottom
            className={classes.landingHeader}
          >
            SSN Admin Portal
          </Typography>
        </div>

        <form onSubmit={this.handleSubmit}>
          <Paper elevation={2} className={classes.root} square={true}>
            <TextField
              name={FieldName.email}
              className={classes.textInput}
              id={FieldName.email}
              label="Username"
              required={true}
              onChange={handleChange}
              value={fieldValue(fields, FieldName.email) || ''}
              fullWidth />
            <TextField
              name={FieldName.hashedPassword}
              className={classes.textInput}
              id={FieldName.hashedPassword}
              label="Password"
              type="password"
              required={true}
              onChange={handleChange}
              value={fieldValue(fields, FieldName.hashedPassword) || ''}
              fullWidth />
            <Button
              type="submit"
              size="medium"
              className={classes.createButton}
              disabled={this.state.isLoading}
              variant="contained"
              color="secondary"
            >
              Login
            </Button>
          </Paper>
        </form>
      </div>
    );
  }
}

const styles = theme => ({
  landingImage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    [theme.breakpoints.down('sm')]: {
      paddingTop: '60px',
      justifyContent: 'flex-start',
    },

    width: '100vw',
    height: '600px',

    backgroundImage: `url(${landingImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',

    padding: '30px',

    textAlign: 'center',
  },
  landingHeader: {
    textTransform: 'uppercase',
    letterSpacing: '0.25em',
  },
  root: {
    maxWidth: '500px',
    margin: '3% auto',
    padding: '2%',
  },
  textInput: {
    marginBottom: '5%',
  },
  checked: {},
  createButton: {
    display: 'block',
    margin: '30px auto',
  },
  headline: {
    paddingBottom: '30px',
  },
});

export const AdminLoginPage = withStyles(styles)(
  withTheme()(
    withContext(AppContext)(
      withForm(
        FieldName,
        constraints,
      )(_AdminLoginPage)
    ),
  ),
);
