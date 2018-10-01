import React, { Component } from 'react';
import { Typography } from '@material-ui/core';
import { withStyles, withTheme } from '@material-ui/core/styles';

class _Project extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  // Check projectlisting for example

  render() {
    const {id} = this.props.match.params;
    return (
      <div>
        <Typography variant='headline'>Todo for {id}</Typography>
        
      </div>
    );
  }
}

const styles = theme => ({

});

export const Project = withTheme()(withStyles(styles)(_Project));
