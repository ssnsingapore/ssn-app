import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Button, Grid } from '@material-ui/core';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';

export class _ProjectImageUpload extends Component {
  render() {
    const { classes } = this.props;

    return (
      <Grid className={classes.coverImage}>
        <Button variant="contained" color="primary" size="medium">
          Upload Project Image <CloudUploadIcon className={classes.rightIcon} />
        </Button>
      </Grid>
    );
  }
}

const defaultImage =
  'https://webgradients.com/public/webgradients_png/053%20Soft%20Grass.png';

const styles = theme => ({
  coverImage: {
    objectFit: 'cover',
    height: '100%',
    backgroundImage: `url(${defaultImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  rightIcon: {
    marginLeft: theme.spacing.unit,
  },
});

export const ProjectImageUpload = withStyles(styles)(_ProjectImageUpload);
