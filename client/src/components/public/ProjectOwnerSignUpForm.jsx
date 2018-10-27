import { withTheme } from '@material-ui/core/styles';
import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { withContext } from 'util/context';
import { extractErrors, formatErrors } from 'util/errors';
import { getFieldNameObject, withForm } from 'util/form';

import { AccountType } from 'components/shared/enums/AccountType';
import { AlertType } from 'components/shared/Alert';
import { AppContext } from 'components/main/AppContext';
import { ProjectOwnerBaseProfileForm } from 'components/shared/ProjectOwnerBaseProfileForm';

const SIGNUP_SUCCESS_MESSAGE = 'You\'ve successfully created a new account!';
const FieldName = getFieldNameObject([
  'email',
  'name',
  'accountType',
  'organisationName',
  'websiteUrl',
  'socialMediaLink',
  'description',
  'personalBio',
  'password',
  'passwordConfirmation',
]);

const constraints = {
  [FieldName.name]: {
    presence: { allowEmpty: false },
    length: { maximum: 50 },
  },
  [FieldName.email]: {
    presence: { allowEmpty: false },
    email: true,
  }, [FieldName.accountType]: {
    presence: { allowEmpty: false },
    inclusion: Object.values(AccountType),
  },
  [FieldName.websiteUrl]: {
    isUrl: { allowEmpty: true },
  },
  [FieldName.password]: {
    presence: { allowEmpty: false },
    length: {
      minimum: 6,
    },
  },
  [FieldName.passwordConfirmation]: {
    presence: { allowEmpty: false },
    sameValueAs: {
      other: FieldName.password,
    },
  },
  [FieldName.organisationName]: (value, attributes) => {
    if (attributes.accountType ===  AccountType.INDIVIDUAL) return null;

    return {
      presence: { allowEmpty: false },
    };
  },
};

class _ProjectOwnerSignUpForm extends Component {
  constructor(props) {
    super(props);

    this.profilePhotoInput = React.createRef();

    this.state = {
      isSubmitting: false,
      createdUser: null,
    };

    props.setField(FieldName.accountType, AccountType.ORGANISATION);
  }

  handleSubmit = async (event) => {
    event.preventDefault();

    if (!this.props.validateAllFields()) {
      return;
    }

    const { authenticator } = this.props.context.utils;
    const { showAlert } = this.props.context.updaters;

    const projectOwner = { ...this.props.valuesForAllFields() };

    this.setState({ isSubmitting: true });
    const response = await authenticator.signUpProjectOwner(projectOwner);
    this.setState({ isSubmitting: false });

    if (response.isSuccessful) {
      const createdUser = (await response.json()).projectOwner;
      this.setState({
        createdUser,
      });
      showAlert('signupSuccess', AlertType.SUCCESS, SIGNUP_SUCCESS_MESSAGE);
    }

    if (response.hasError) {
      const errors = await extractErrors(response);
      showAlert('signupFailure', AlertType.ERROR, formatErrors(errors));
    }
  }

  render () {
    if (this.state.createdUser) {
      return <Redirect to={{
        pathname: '/signup/confirmation',
        state: { projectOwner: this.state.createdUser },
      }} />;
    }
    return (
      <ProjectOwnerBaseProfileForm
        profilePhotoInput={this.profilePhotoInput}
        FieldName={FieldName}
        fields={this.props.fields}
        handleChange={this.props.handleChange}
        handleSubmit={this.handleSubmit}
        isSubmitting={this.state.isSubmitting}/>
    );
  }
}

export const ProjectOwnerSignUpForm =
  withTheme()(
    withContext(AppContext)(
      withForm(
        FieldName,
        constraints,
      )(_ProjectOwnerSignUpForm)
    ),
  );

export const TestProjectOwnerSignUpForm = withForm(
  FieldName,
  constraints,
)(_ProjectOwnerSignUpForm);
