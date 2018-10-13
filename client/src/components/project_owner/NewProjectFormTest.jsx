import React from 'react';
import {
  withForm, getFieldNameObject, fieldValue, fieldErrorText, fieldHasError } from 'util/form';
import { TextField, IconButton, Button } from '@material-ui/core';
import { AddCircle as AddCircleIcon, RemoveCircle as RemoveCircleIcon } from '@material-ui/icons';

// Put the VolunteerRequirementForm in a separate file
const VolunteerRequirementFieldName = getFieldNameObject(['type', 'commitmentLevel']);
// verify these constraints are correct
const volunteerRequirementConstraints = {
  [VolunteerRequirementFieldName.type]: {
    presence: { allowEmpty: false },
  },
  [VolunteerRequirementFieldName.commitmentLevel]: {
    presence: { allowEmpty: false },
  },
};

class _VolunteerRequirementForm extends React.Component {
  render() {
    const { fields, handleChange } = this.props;
    return (
      <div>
        <TextField
          label="Type"
          type="text"
          name={VolunteerRequirementFieldName.type}
          // id={dName.email}
          placeholder="Volunteer Type"
          value={fieldValue(fields, VolunteerRequirementFieldName.type)}
          onChange={handleChange}
          error={fieldHasError(fields, VolunteerRequirementFieldName.type)}
          helperText={fieldErrorText(fields, VolunteerRequirementFieldName.type)}
        />
        <TextField
          style={{ margin: '10px' }}
          label="Commitment Level"
          type="text"
          name={VolunteerRequirementFieldName.commitmentLevel}
          // id={FieldName.email}
          placeholder="Volunteer Commitment Level"
          value={fieldValue(fields, VolunteerRequirementFieldName.commitmentLevel)}
          onChange={handleChange}
          error={fieldHasError(fields, VolunteerRequirementFieldName.commitmentLevel)}
          helperText={fieldErrorText(fields, VolunteerRequirementFieldName.commitmentLevel)}
        />
      </div>
    );
  }
}

const VolunteerRequirementForm = withForm(
  VolunteerRequirementFieldName,
  volunteerRequirementConstraints
)(_VolunteerRequirementForm);

// dummy fields for now, change to the proper ones
const FieldName = getFieldNameObject(['description']);
const constraints = {};

class _NewProjectFormTest extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // read up about refs at https://reactjs.org/docs/refs-and-the-dom.html
      volunteerRequirementRefs: [
        React.createRef(), 
        React.createRef(),
      ],
    };
  }

  // implement and figure out where to use this
  validateAllSubFormFields = () => {
  }

  // implement figure out where to use this
  resetAllSubFormFields = () => {
  }

  handleSubmit = async (event) => {
    // implement this
  }

  handleAddVolunteerRequirement = () => {
    this.setState({
      volunteerRequirementRefs: [...this.state.volunteerRequirementRefs, React.createRef()],
    });
  }

  handleDeleteVolunteerRequirement = (i) => {
    const newVolunteerRequirementRefs = [ ...this.state.volunteerRequirementRefs];
    newVolunteerRequirementRefs.splice(i, 1);
    this.setState({
      volunteerRequirementRefs: newVolunteerRequirementRefs,
    });
  }

  renderVolunteerRequirements = () => {
    const { volunteerRequirementRefs } = this.state;

    return volunteerRequirementRefs.map((volunteerRequirementRef, i) => {
      return (
        <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
          <VolunteerRequirementForm ref={volunteerRequirementRef} />
          <IconButton onClick={() => this.handleDeleteVolunteerRequirement(i)}>
            <RemoveCircleIcon />
          </IconButton>
        </div>
      );
    });
  }

  render() {
    const { fields, handleChange } = this.props;

    return (
      <form onSubmit={this.handleSubmit}>
        <TextField
          label="Description"
          type="text"
          name={FieldName.description}
          // id={FieldName.email}
          placeholder="Description"
          value={fieldValue(fields, FieldName.description)}
          onChange={handleChange}
          error={fieldHasError(fields, FieldName.description)}
          helperText={fieldErrorText(fields, FieldName.description)}
        />
        {this.renderVolunteerRequirements()}
        <IconButton onClick={this.handleAddVolunteerRequirement}>
          <AddCircleIcon />
        </IconButton>
        <Button
          type="submit"
          variant="contained"
          color="secondary"
        >
          Submit
        </Button>
      </form>
    );
  }
}

export const NewProjectFormTest = withForm(FieldName, constraints)(_NewProjectFormTest);