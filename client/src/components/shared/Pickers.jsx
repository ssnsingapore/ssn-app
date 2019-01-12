import React, { PureComponent } from 'react';
import moment from 'moment';
import MomentUtils from '@date-io/moment';
import {
  MuiPickersUtilsProvider,
  DatePicker,
  TimePicker,
} from 'material-ui-pickers';

import TimeIcon from '@material-ui/icons/AccessTime';

import { fieldErrorText, fieldHasError, fieldValue } from 'util/form';
import { FieldName } from 'components/project_owner/new_project_form/ProjectFormFields';

export class DatePickers extends PureComponent {
  handleStartDateChange = dateMoment => {
    const event = {
      target: {
        name: FieldName.startDate,
        value: dateMoment !== null ? dateMoment.startOf('day').format() : '',
      },
    };
    console.log(dateMoment);
    this.props.handleChange(event);
  };

  handleEndDateChange = dateMoment => {
    const event = {
      target: {
        name: FieldName.endDate,
        value: dateMoment !== null ? dateMoment.startOf('day').format() : '',
      },
    };
    this.props.handleChange(event);
  };

  render() {
    return (
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <div className="picker">
          <DatePicker
            keyboard
            clearable
            label="Start Date"
            placeholder={moment(new Date()).format('DD/MM/YYYY')}
            format="DD/MM/YYYY"
            mask={value =>
              value
                ? [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/]
                : []
            }
            value={fieldValue(this.props.fields, FieldName.startDate) || ''}
            onChange={this.handleStartDateChange}
            animateYearScrolling
            minDate={new Date()}
            disableOpenOnEnter
            InputLabelProps={{ shrink: true }}
            error={fieldHasError(this.props.fields, FieldName.startDate)}
            helperText={fieldErrorText(this.props.fields, FieldName.startDate)}
            style={{ marginRight: '20px' }}
          />
        </div>

        <div className="picker">
          <DatePicker
            keyboard
            clearable
            label="End Date"
            placeholder={moment(new Date()).format('DD/MM/YYYY')}
            format="DD/MM/YYYY"
            mask={value =>
              value
                ? [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/]
                : []
            }
            value={fieldValue(this.props.fields, FieldName.endDate) || ''}
            onChange={this.handleEndDateChange}
            animateYearScrolling
            minDate={this.props.fields.startDate}
            disableOpenOnEnter
            minDateMessage="Please select a date on or after the start date"
            InputLabelProps={{ shrink: true }}
            error={fieldHasError(this.props.fields, FieldName.endDate)}
            helperText={fieldErrorText(this.props.fields, FieldName.endDate)}
          />
        </div>
      </MuiPickersUtilsProvider>
    );
  }
}

export class TimePickers extends PureComponent {
  handleTimeChange = time => {
    this.props.onChange(time);
  };

  render() {
    return (
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <div className="picker">
          <TimePicker
            keyboard
            clearable
            label="Time"
            placeholder={moment(new Date()).format('hh:mm A')}
            keyboardIcon={<TimeIcon />}
            mask={value => {
              return value
                ? [/\d/, /\d/, ':', /\d/, /\d/, ' ', /a|p/i, 'M']
                : [];
            }}
            value={this.props.value}
            onChange={this.handleTimeChange}
            disableOpenOnEnter
            InputLabelProps={{ shrink: true }}
            style={{ display: 'inline' }}
          />
        </div>
      </MuiPickersUtilsProvider>
    );
  }
}
