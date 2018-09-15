import React from 'react';
import { withStyles, withTheme } from '@material-ui/core/styles';
import { AppBar, Tabs, Tab, Typography, Button, TextField } from '@material-ui/core';

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
  button: {
    marginTop: theme.spacing.unit * 5,
  },
});

class _LoginSignup extends React.Component {
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
        <AppBar position="static" color="default">
          <Tabs
            value={this.state.value}
            onChange={this.handleChange}
            indicatorColor="primary"
            textColor="primary"
            fullWidth
          >
            <Tab label="Login" />
            <Tab label="Sign Up" />
          </Tabs>
        </AppBar>
        <TabContainer dir={theme.direction}>
          <form className={classes.container} noValidate autoComplete="off">
            <TextField
              InputLabelProps={{
                shrink: true,
              }}
              placeholder="Username"
              fullWidth
              margin="normal"
            />
            <TextField
              InputLabelProps={{
                shrink: true,
              }}
              placeholder="Password"
              fullWidth
              margin="normal"
            />
            <Button variant="contained" color="secondary" size="large" fullWidth className={classes.button}>
              Login
            </Button>
          </form>
        </TabContainer>
        <TabContainer dir={theme.direction}><form className={classes.container} noValidate autoComplete="off">
          <TextField
            InputLabelProps={{
              shrink: true,
            }}
            placeholder="Username"
            fullWidth
            margin="normal"
          />
          <TextField
            InputLabelProps={{
              shrink: true,
            }}
            placeholder="Password"
            fullWidth
            margin="normal"
          />
          <Button variant="contained" color="primary" size="large" fullWidth className={classes.button}>
            Sign Up
          </Button>
        </form></TabContainer>
      </div>
    );
  }
}

export const LoginSignup =
  withTheme()(
    withStyles(styles)(_LoginSignup)
  );

