import React from 'react';
import * as SpinKitSpinner from 'react-spinkit';
import { withStyles } from '@material-ui/core/styles';

const styles = {
  root: {
    flex: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '30px',
  },
};

export const Spinner = withStyles(styles)(({ classes }) => (
  <div className={classes.root}>
    <SpinKitSpinner name="circle" />
  </div>
));
