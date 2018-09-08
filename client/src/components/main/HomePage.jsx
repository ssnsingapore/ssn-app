import React, { Component }  from 'react';
import { Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

import defaultImage from 'assets/image-placeholder.svg';

class _HomePage extends Component {
  render() {
    const { classes } = this.props;

    return (
      <div>
        <div className={classes.landingImage}>
          <Typography variant="display3">
          SSN Project Portal
          </Typography>
          <Typography variant="headline">
            SSN Project Portal aims to match volunteers and organisers in the Singapore Sustainability Space
          </Typography>
        </div>
      </div>
    );
  }
}

const styles = {
  landingImage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',

    width: '100vw',
    height: '400px',

    backgroundImage: `url(${defaultImage})`,
    backgroundSize: 'cover',
  },
};


export const HomePage = withStyles(styles)(_HomePage);