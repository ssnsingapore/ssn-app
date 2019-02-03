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

export const PROJECT_OWNER_PROFILE_DISPLAY_WIDTH = 200;
export const PROJECT_OWNER_PROFILE_DISPLAY_HEIGHT = 200;

const DISPLAY_WIDTH = PROJECT_OWNER_PROFILE_DISPLAY_WIDTH;
const DISPLAY_HEIGHT = PROJECT_OWNER_PROFILE_DISPLAY_HEIGHT;

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
  [FieldName.socialMediaLink]: {
    isUrl: { allowEmpty: true },
  },
  [FieldName.organisationName]: (value, attributes) => {
    if (attributes.accountType === AccountType.INDIVIDUAL) return null;

    return {
      presence: { allowEmpty: false },
    };
  },
  [FieldName.password]: {
    length: {
      minimum: 6,
    },
  },
  [FieldName.passwordConfirmation]: {
    sameValueAs: {
      other: FieldName.password,
    },
  },
};

const validateGroupsMap = {
  fields: {
    [FieldName.password]: 'password',
    [FieldName.passwordConfirmation]: 'password',
  },
  validateGroups: {
    password: [FieldName.password, FieldName.passwordConfirmation],
  },
};

class _ProjectOwnerEditProfileForm extends Component {
  constructor(props) {
    super(props);

    this.profilePhotoInput = React.createRef();

    this.state = {
      isSubmitting: false,
      isLoading: true,
      isImageTooLowResolution: false,
      shouldShowPasswordChange: false,
    };
  }

  async componentDidMount() {
    const { requestWithAlert } = this.props.context.utils;
    const { authenticator } = this.props.context.utils;
    const currentUser = authenticator.getCurrentUser();

    const endPoint = `/api/v1/project_owners/${currentUser.id}`;
    const response = await requestWithAlert.get(endPoint, { authenticated: true });

    if (response.isSuccessful) {
      const { projectOwner } = await response.json();
      Object.keys(projectOwner).map(data => this.props.setField(data, projectOwner[data]));
    }

    if (response.hasError) {
      const { showAlert } = this.props.context.updaters;
      const errors = await extractErrors(response);
      showAlert('getProjectOwnerFailure', AlertType.ERROR, formatErrors(errors));
    }

    this.setState({ isLoading: false });
  }

  handleShowPasswordChange = () => {
    if (this.state.shouldShowPasswordChange) {
      this.setState({ shouldShowPasswordChange: false });
      this.props.resetField(FieldName.password);
      this.props.resetField(FieldName.passwordConfirmation);
    } else {
      this.setState({ shouldShowPasswordChange: true });
    }
  }

  handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    if (this.profilePhotoInput.current.files[0]) {
      const resizedProfilePhoto = await this.resizeImage();
      formData.append('profilePhoto', resizedProfilePhoto);
    }

    if (this.state.isImageTooLowResolution || !this.props.validateAllFields()) {
      return;
    }

    const projectOwner = { ...this.props.valuesForAllFields() };

    Object.keys(projectOwner)
      .filter(key => projectOwner[key] !== undefined)
      .forEach(key => formData.append(key, projectOwner[key]));

    const { showAlert } = this.props.context.updaters;
    const { requestWithAlert, authenticator } = this.props.context.utils;

    this.setState({ isSubmitting: true });
    const response = await requestWithAlert
      .updateForm('/api/v1/project_owner/profile', formData, { authenticated: true });
    this.setState({ isSubmitting: false });

    if (response.isSuccessful) {
      if (projectOwner.password) {
        authenticator.setCsrfToken(response);
      }
      const { user } = await response.json();
      authenticator.setCurrentUser(user);
      showAlert('editProfileSuccess', AlertType.SUCCESS, EDIT_PROFILE_SUCCESS);
    }

    if (response.hasError) {
      const errors = await extractErrors(response);
      showAlert('editProfileFailure', AlertType.ERROR, formatErrors(errors));
    }

  }

  getImageDimensions = image => {
    return new Promise(resolve => {
      image.addEventListener('load', () => {
        resolve({ width: image.width, height: image.height });
      });
    });
  };

  resizeImage = async () => {
    const image = new Image();

    const profilePhoto = this.profilePhotoInput.current.files[0];
    const profilePhotoSrc = window.URL.createObjectURL(profilePhoto);

    image.src = profilePhotoSrc;

    // Resize to cover the display width and height
    const { width, height } = await this.getImageDimensions(image);

    if (width < DISPLAY_WIDTH || height < DISPLAY_HEIGHT) {
      this.setState({ isImageTooLowResolution: true });
    } else {
      this.setState({ isImageTooLowResolution: false });
    }

    let finalWidth = width;
    let finalHeight = height;

    if (width < height && width > DISPLAY_WIDTH) {
      finalWidth = DISPLAY_WIDTH;
      finalHeight = height / width * DISPLAY_WIDTH;
    }

    if (height < width && height > DISPLAY_HEIGHT) {
      finalHeight = DISPLAY_HEIGHT;
      finalWidth = width / height * DISPLAY_HEIGHT;
    }

    const canvas = document.createElement('canvas');
    canvas.width = finalWidth;
    canvas.height = finalHeight;

    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, finalWidth, finalHeight);
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.6);
    });
  }

  render() {
    if (this.state.isLoading) {
      return <Spinner />;
    }

    return (
      <ProjectOwnerBaseProfileForm
        profilePhotoInput={this.profilePhotoInput}
        FieldName={FieldName}
        fields={this.props.fields}
        resetField={this.props.resetField}
        handleChange={this.props.handleChange}
        handleSubmit={this.handleSubmit}
        isSubmitting={this.state.isSubmitting}
        isEditProfileForm={true}
        shouldShowPasswordChange={this.state.shouldShowPasswordChange}
        handleShowPasswordChange={this.handleShowPasswordChange} />
    );
  }
}

export const ProjectOwnerEditProfileForm =
  withTheme()(
    withContext(AppContext)(
      withForm(
        FieldName,
        constraints,
        validateGroupsMap,
      )(_ProjectOwnerEditProfileForm)
    ),
  );

export const TestProjectOwnerEditProfileForm = withForm(
  FieldName,
  constraints,
  validateGroupsMap,
)(_ProjectOwnerEditProfileForm);
