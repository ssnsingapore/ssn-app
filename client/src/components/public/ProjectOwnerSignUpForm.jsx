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

export const PROJECT_OWNER_PROFILE_DISPLAY_WIDTH = 200;
export const PROJECT_OWNER_PROFILE_DISPLAY_HEIGHT = 200;

const DISPLAY_WIDTH = PROJECT_OWNER_PROFILE_DISPLAY_WIDTH;
const DISPLAY_HEIGHT = PROJECT_OWNER_PROFILE_DISPLAY_HEIGHT;

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
    if (attributes.accountType === AccountType.INDIVIDUAL) return null;

    return {
      presence: { allowEmpty: false },
    };
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

class _ProjectOwnerSignUpForm extends Component {
  constructor(props) {
    super(props);

    this.profilePhotoInput = React.createRef();

    this.state = {
      isImageTooLowResolution: false,
      isSubmitting: false,
      createdUser: null,
    };

    props.setField(FieldName.accountType, AccountType.ORGANISATION);
  }

  getImageDimensions = (image) => {
    return new Promise((resolve) => {
      image.addEventListener('load', () => {
        resolve({ width: image.width, height: image.height });
      });
    });
  }

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

    const { authenticator } = this.props.context.utils;
    const { showAlert } = this.props.context.updaters;

    this.setState({ isSubmitting: true });
    const response = await authenticator.signUpProjectOwner(formData);
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

  render() {
    if (this.state.createdUser) {
      return <Redirect to={{
        pathname: '/signup/confirmation',
        state: { projectOwner: this.state.createdUser },
      }} />;
    }
    return (
      <ProjectOwnerBaseProfileForm
        resetField={this.props.resetField}
        profilePhotoInput={this.profilePhotoInput}
        FieldName={FieldName}
        fields={this.props.fields}
        handleChange={this.props.handleChange}
        handleSubmit={this.handleSubmit}
        isSubmitting={this.state.isSubmitting}
      />
    );
  }
}

export const ProjectOwnerSignUpForm =
  withTheme()(
    withContext(AppContext)(
      withForm(
        FieldName,
        constraints,
        validateGroupsMap,
      )(_ProjectOwnerSignUpForm)
    ),
  );

export const TestProjectOwnerSignUpForm = withForm(
  FieldName,
  constraints,
  validateGroupsMap,
)(_ProjectOwnerSignUpForm);
