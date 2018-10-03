import React from 'react';
import { withStyles, withTheme } from '@material-ui/core/styles';
import {
  Typography,
  Button,
  TextField,
} from '@material-ui/core';
import {
  getFieldNameObject,
  fieldValue,
  fieldHasError,
  fieldErrorText,
  withForm,
} from 'util/form';
import { withContext } from 'util/context';
import { AppContext } from 'components/main/AppContext';


const FieldName = getFieldNameObject(['email', 'password']);
const constraints = {
  [FieldName.email]: {
    presence: { allowEmpty: false },
    email: true,
  },
  [FieldName.password]: {
    presence: { allowEmpty: false },
    length: { minimum: 6 },
  },
};

class _AdminLoginForm extends React.Component {


  render() {
    const { fields, classes, handleChange } = this.props;
    return (      
      <div>
        <div className={classes.landingImage}>
          <Typography
            variant="display2"
            gutterBottom
            className={classes.landingHeader}
          >
            SSN Project Portal
          </Typography>
          <Typography variant="headline">
            SSN Project Portal aims to match volunteers and organisers in the
            Singapore Sustainability Space
          </Typography>
        </div>
      <div className={classes.root}>
        <form onSubmit={this.handleSubmit}>
          <TextField 
            InputLabelProps={{ shrink: true}}
            placeholder='Email'
            margin='normal'
            name={FieldName.email}
            value={fieldValue(fields, FieldName.password)}
            error={fieldHasError(fields, FieldName.password)}
            helper={fieldErrorText(fields, FieldName.password)}
            onChange={handleChange}/>
        </form>
      </div>
    );
  }
};

const styles = theme => ({
  landingImage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    [theme.breakpoints.down('sm')]: {
      paddingTop: '60px',
      justifyContent: 'flex-start',
    },

    width: '100vw',
    height: '600px',

    backgroundImage: `url(${landingImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',

    padding: '30px',

    textAlign: 'center',
  },
  landingHeader: {
    textTransform: 'uppercase',
    letterSpacing: '0.25em',
  },
  root: {
    margin: '70px auto',
    width: '80vw',
  },});

export const AdminLoginForm = withTheme()(
  withStyles(styles)(
    withContext(AppContext)(
      withForm(FieldName, constraints,)(_AdminLoginForm),
    ),
  ),
);