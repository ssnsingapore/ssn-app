import React from 'react';
import { Redirect, Link } from 'react-router-dom';
import { Typography, Paper, Button } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { AccountType } from 'components/shared/enums/AccountType';

const _AwaitingAccountConfirmation = (props) => {
  if (!props.location.state) {
    return <Redirect to="/" />;
  }
  const { projectOwner } = props.location.state;
  let message = `Please check your email at ${projectOwner.email} to activate your account`;

  projectOwner.accountType === AccountType.ORGANIZATION ?
    message = `An account has been created for ${projectOwner.name} from ${projectOwner.organisationName}. ` + message :
    message = `An account has been created for ${projectOwner.name}. ` + message;

  const { classes } = props;

  return (
    <Paper className={classes.container}>
      <Typography variant="body1" className={classes.message}>
        {message}
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        component={Link}
        to="/"
      >
        Return Home
      </Button>
    </Paper>
  );
};

const styles = theme => ({
  container: {
    width: '400px',
    padding: `${theme.container.padding.vertical}px ${theme.container.padding.horizontal}px`,
    margin: `${theme.container.margin.vertical}px auto`,

    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  message: {
    marginBottom: '30px',
  },
});

export const AwaitingAccountConfirmation = withStyles(styles)(
  _AwaitingAccountConfirmation,
);