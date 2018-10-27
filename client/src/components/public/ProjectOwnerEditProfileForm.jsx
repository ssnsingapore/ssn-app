import { withTheme } from '@material-ui/core/styles';
import React, { Component } from 'react';
import { withContext } from 'util/context';
import { extractErrors, formatErrors } from 'util/errors';
import { getFieldNameObject, withForm } from 'util/form';

import { AccountType } from 'components/shared/enums/AccountType';
import { AlertType } from 'components/shared/Alert';
import { AppContext } from 'components/main/AppContext';
import { ProjectOwnerBaseProfileForm } from 'components/shared/ProjectOwnerBaseProfileForm';
import { Spinner } from 'components/shared/Spinner';

const EDIT_PROFILE_SUCCESS = 'You\'ve successfully updated your profile!';
const FieldName = getFieldNameObject([
  'email',
  'name',
  'accountType',
  'organisationName',
  'websiteUrl',
  'socialMediaLink',
  'description',
  'personalBio',
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
  [FieldName.organisationName]: (value, attributes) => {
    if (attributes.accountType ===  AccountType.INDIVIDUAL) return null;

    return {
      presence: { allowEmpty: false },
    };
  },
};

class _ProjectOwnerEditProfileForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isSubmitting: false,
      isLoading: true,
    };
  }

  async componentDidMount () {
    const { requestWithAlert } = this.props.context.utils;
    const { authenticator } = this.props.context.utils;
    const currentUser = authenticator.getCurrentUser();

    const endPoint = `/api/v1/project_owners/${currentUser.id}`;
    const response = await requestWithAlert.get(endPoint, 
      { authenticated: true });

    if (response.isSuccessful) {
      const projectOwner = (await response.json()).projectOwner;
      Object.keys(projectOwner).map (data => this.props.setField(data, projectOwner[data]));
    }

    if (response.hasError) {
      const { showAlert } = this.props.context.updaters;
      const errors = await extractErrors(response);
      showAlert('getProjectOwnerFailure', AlertType.ERROR, formatErrors(errors));
    }

    this.setState({ isLoading: false });
  }

  handleSubmit = async (event) => {
    event.preventDefault();

    console.log('submitting');
    if (!this.props.validateAllFields()) {
      return;
    }
    console.log('submitting after');


    const { showAlert } = this.props.context.updaters;
    const { requestWithAlert, authenticator} = this.props.context.utils;

    const projectOwner = { ...this.props.valuesForAllFields() };

    this.setState({ isSubmitting: true });

    const currentUser = authenticator.getCurrentUser();
    const data = { projectOwner };
    
    const response = await requestWithAlert
      .put(`/api/v1/project_owners/${currentUser.id}`, data, { authenticated: true });
    
    this.setState({ isSubmitting: false });

    if (response.isSuccessful) {
      const newUser = (await response.json()).projectOwner;
      authenticator.setCurrentUser(newUser);
      showAlert('editProfileSuccess', AlertType.SUCCESS, EDIT_PROFILE_SUCCESS);
      window.location.reload();
    }

    if (response.hasError) {
      const errors = await extractErrors(response);
      showAlert('editProfileFailure', AlertType.ERROR, formatErrors(errors));
    }
    
  }

  render () {
    if (this.state.isLoading) {
      return <Spinner/>;
    }
    
    return (
      <ProjectOwnerBaseProfileForm FieldName={FieldName}
        fields={this.props.fields}
        handleChange={this.props.handleChange} 
        handleSubmit={this.handleSubmit}
        isSubmitting={this.state.isSubmitting}
        isEditProfileForm={true}/>
    );
  }
}

export const ProjectOwnerEditProfileForm = 
  withTheme()(
    withContext(AppContext)(
      withForm(
        FieldName,
        constraints,
      )(_ProjectOwnerEditProfileForm)
    ),
  );

export const TestProjectOwnerEditProfileForm = withForm(
  FieldName,
  constraints,
)(_ProjectOwnerEditProfileForm);
