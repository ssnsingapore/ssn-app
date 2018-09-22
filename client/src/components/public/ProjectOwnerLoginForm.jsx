import React from 'react';
import { withStyles, withTheme } from '@material-ui/core/styles';
import {
  Typography,
  Button,
  TextField,
} from '@material-ui/core';
import { PasswordResetDialog } from './PasswordResetDialog';

const styles = theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    position: 'relative',
    minHeight: 200,

    padding: theme.spacing.unit * 4,
  },
  loginButton: {
    marginTop: theme.spacing.unit * 6,
    marginBottom: theme.spacing.unit * 1,
  },
  signupButton: {
    marginTop: theme.spacing.unit * 1,
    marginBottom: theme.spacing.unit * 4,
  },
  forgotPasswordButton: {
    textTransform: 'none',
    fontWeight: 'normal',
  },
  margin3: {
    margin: theme.spacing.unit * 3,
  },
});

class _ProjectOwnerLoginForm extends React.Component {
  state = {
    passwordResetDialogOpen: false,
  }

  handlePasswordResetDialog = () => {
    this.setState({ passwordResetDialogOpen: true });
  }

  handlePasswordResetDialogClose = () => {
    console.log('CLOSING');
    this.setState({ passwordResetDialogOpen: false });
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <PasswordResetDialog
          open={this.state.passwordResetDialogOpen}
          handleClose={this.handlePasswordResetDialogClose}
        />
        <form className={classes.container} noValidate autoComplete="off">
          <TextField
            InputLabelProps={{ shrink: true }}
            placeholder="Email"
            margin="normal"
            fullWidth
          />
          <TextField
            InputLabelProps={{ shrink: true }}
            placeholder="Password"
            margin="normal"
            fullWidth
          />
          <Button
            variant="contained"
            color="secondary"
            size="large"
            fullWidth
            className={classes.loginButton}
          >
            Login
          </Button>
          <Button
            size="small"
            fullWidth
            onClick={this.handlePasswordResetDialog}
            className={classes.forgotPasswordButton}
          >
            Forgot password?
          </Button>
          <Typography
            gutterBottom
            align="center"
            className={classes.margin3}
          >
            or
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            className={classes.signupButton}
          >
            Sign Up
          </Button>
        </form>
      </div>
    );
  }
}

export const ProjectOwnerLoginForm =
  withTheme()(
    withStyles(styles)(
      _ProjectOwnerLoginForm
    )
  );