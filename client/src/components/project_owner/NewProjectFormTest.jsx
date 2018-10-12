import React from 'react';
import {
  withForm, getFieldNameObject, fieldValue, fieldErrorText, fieldHasError } from '../../util/form';
import { TextField, IconButton, Button } from '@material-ui/core';
import { AddCircle as AddCircleIcon, RemoveCircle as RemoveCircleIcon } from '@material-ui/icons';
import { IssueAddressed } from 'components/shared/enums/IssueAddressed';
import { ProjectType } from 'components/shared/enums/ProjectType';
import { ProjectState } from 'components/shared/enums/ProjectState';
import { ProjectFrequency } from 'components/shared/enums/ProjectFrequency';
import { ProjectLocation } from 'components/shared/enums/ProjectLocation';

const FieldName = getFieldNameObject(['description']);
const constraints = {};

const VolunteerRequirementFieldName = getFieldNameObject(['type', 'commitmentLevel']);
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

class _NewProjectFormTest extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      volunteerRequirementRefs: [React.createRef()],
    };
  }

  validateAllSubFormFields = () => {
    return this.state.volunteerRequirementRefs.every((volunteerRequirementRef) => {
      return volunteerRequirementRef.current.validateAllFields();
    });
  }

  resetAllSubFormFields = () => {
    this.state.volunteerRequirementRefs.forEach((volunteerRequirementRef) => {
      volunteerRequirementRef.current.resetAllFields();
    });
  }

  handleSubmit = async (event) => {
    event.preventDefault();

    if (!this.props.validateAllFields() || !this.validateAllSubFormFields()) {
      return;
    }

    const volunteerRequirementFieldValues = this.state.volunteerRequirementRefs.map((volunteerRequirementRef) => {
      return volunteerRequirementRef.current.valuesForAllFields();
    });

    const { description } = this.props.valuesForAllFields();
    console.log('description', description);
    const newProject = {
      title: 'Save the Earth',
      coverImageUrl: 'https://s3-ap-southeast-1.amazonaws.com/ssn-app-maryana/Terra-recycling.jpg',
      description,
      volunteerSignupUrl: 'http://www.signup.org',
      projectOwner: '5bb8b5f5d6f16b52ab02f631',
      issuesAddressed: [IssueAddressed.LAND_AND_NOISE_POLLUTION, IssueAddressed.WASTE],
      volunteerBenefitsDescription: 'Some description', // state will be changed
      projectType: ProjectType.EVENT,
      time: '9 AM',
      location: ProjectLocation.CENTRAL,
      state: ProjectState.APPROVED_INACTIVE,
      startDate: new Date(2018, 12, 1),
      endDate: new Date(2018, 12, 2),
      frequency: ProjectFrequency.ONCE_A_WEEK,

      volunteerRequirements: volunteerRequirementFieldValues,
    };

    console.log('project', newProject);

    this.setState({ isSubmitting: true });
    await fetch('/api/v1/projects/add', { body: JSON.stringify({ project: newProject }), method: 'post', headers: { 'Content-Type': 'application/json'} });
    this.setState({ isSubmitting: false });


    this.setState({ hasSubmitted: true});
    this.props.resetAllFields();
    this.resetAllSubFormFields();
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