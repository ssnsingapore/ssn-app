import React, { Component } from 'react';
import { Typography } from '@material-ui/core';
import { withStyles, withTheme } from '@material-ui/core/styles';


class _Project extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render() {
    return (
      <div>
        <Typography variant='headline'>Todo</Typography>
      </div>
    );
  }
}

const styles = theme => ({

});

export const Project = withTheme()(withStyles(styles)(_Project));
