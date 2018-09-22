import React from 'react';
import { withStyles, withTheme } from '@material-ui/core/styles';
import { Typography, Button, TextField } from '@material-ui/core';

function TabContainer(props) {
  const { children, dir } = props;

  return (
    <Typography component="div" dir={dir} style={{ padding: 8 * 3 }}>
      {children}
    </Typography>
  );
}

const styles = theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    position: 'relative',
    minHeight: 200,
  },
  loginButton: {
    marginTop: theme.spacing.unit * 6,
    marginBottom: theme.spacing.unit * 1,
  },
  signupButton: {
    marginTop: theme.spacing.unit * 1,
    marginBottom: theme.spacing.unit * 4,
  },
  margin3: {
    margin: theme.spacing.unit * 3,
  },
});

class _ProjectOwnerLoginForm extends React.Component {
  state = {
    value: 0,
  };

  handleChange = (event, value) => {
    this.setState({ value });
  };

  handleChangeIndex = index => {
    this.setState({ value: index });
  };

  render() {
    const { classes, theme } = this.props;
    return (
      <div className={classes.root}>
        <TabContainer dir={theme.direction}>
          <form className={classes.container} noValidate autoComplete="off">
            <TextField
              InputLabelProps={{ shrink: true }}
              placeholder="Email"
              fullWidth
              margin="normal"
            />
            <TextField
              InputLabelProps={{ shrink: true }}
              placeholder="Password"
              fullWidth
              margin="normal"
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
            <Typography component="caption" gutterBottom align="center">
              Forgot password?
            </Typography>
            <Typography
              component="caption"
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
        </TabContainer>
      </div>
    );
  }
}

export const ProjectOwnerLoginForm = withTheme()(withStyles(styles)(_ProjectOwnerLoginForm));
