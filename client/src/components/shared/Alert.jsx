import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Snackbar, SnackbarContent, IconButton } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { green } from '@material-ui/core/colors';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
  Info as InfoIcon,
} from '@material-ui/icons';

export const AlertType = {
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
  INFO: 'INFO',
};

export const NETWORK_ERROR_MESSAGE = 'Looks like we\'re having some trouble connecting to our server. Please try again!';

class _Alert extends Component {
  renderMessage = () => {
    const { classes, type, message } = this.props;
    const Icon = icons[type];

    return (
      <span className={classes.messageSpan}>
        <Icon className={classnames(classes.icon, classes.iconType)} />
        {message}
      </span>
    );
  }

  renderAction = () => {
    const { classes, onClose } = this.props;

    return (
      <IconButton
        aria-label="Close"
        color="inherit"
        onClick={onClose}
      >
        <CloseIcon className={classes.icon} />
      </IconButton>
    );
  }

  renderContent = () => {
    const { classes, type } = this.props;

    return (
      <SnackbarContent
        classes={{ message: classes.message }}
        className={classes[type]}
        message={this.renderMessage()}
        action={this.renderAction()}
      />
    );
  }

  render() {
    return (
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={this.props.isVisible}
        onClose={this.props.onClose}
      >
        {this.renderContent()}
      </Snackbar>
    );
  }
}

_Alert.propTypes = {
  classes: PropTypes.object,
  isVisible: PropTypes.bool,
  type: PropTypes.oneOf(Object.keys(AlertType)),
  message: PropTypes.string,
  onClose: PropTypes.func,
};

const icons = {
  [AlertType.SUCCESS]: CheckCircleIcon,
  [AlertType.INFO]: InfoIcon,
  [AlertType.ERROR]: ErrorIcon,
};

const styles = theme => ({
  [AlertType.SUCCESS]: {
    backgroundColor: green[300],
  },
  [AlertType.INFO]: {
    backgroundColor: theme.palette.primary.light,
  },
  [AlertType.ERROR]: {
    backgroundColor: theme.palette.error.light,
  },
  icon: {
    fontSize: 20,
  },
  iconType: {
    opacity: 0.9,
    marginRight: 2 * theme.spacing.unit,
  },
  messageSpan: {
    display: 'flex',
    alignItems: 'center',
  },
  message: {
    flex: 1,
  },
});

export const Alert = withStyles(styles)(_Alert);
