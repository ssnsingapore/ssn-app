import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import uniqueValidator from 'mongoose-unique-validator';
import uid from 'uid-safe';
import jwt from 'jsonwebtoken';

import { config } from 'config/environment';
import { constructMongooseValidationError } from 'util/errors';
import { Role } from './Role';

export const AccountType = {
  ORGANIZATION: 'ORGANIZATION',
  INDIVIDUAL: 'INDIVIDUAL',
};

const ProjectOwnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'cannot be blank'],
  },
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: [true, 'cannot be blank'],
    match: [/\S+@\S+\.\S+/, 'is invalid'],
    index: true,
  },
  accountType: {
    type: String,
    enum: Object.values(AccountType),
  },
  websiteUrl: {
    type: String,
    match: [
      // eslint-disable-next-line no-useless-escape
      /[-a-zA-Z0-9@:%_\+.~#?&\/\/=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)?/i,
      'is invalid',
    ],
  },
  socialMediaLink: {
    type: String,
    match: [
      // eslint-disable-next-line no-useless-escape
      /[-a-zA-Z0-9@:%_\+.~#?&\/\/=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)?/i,
      'is invalid',
    ],
  },
  profilePhotoUrl: {
    type: String,
  },
  organisationName: {
    type: String,
    required: [
      function () {
        return this.accountType === AccountType.ORGANIZATION;
      },
      'cannot be blank',
    ],
  },
  description: {
    type: String,
    // TODO: Not required on the front-end. Clarify with Ying Tong
    // required: [
    //   function () {
    //     return this.accountType === AccountType.ORGANIZATION;
    //   },
    //   'cannot be blank',
    // ],
    // TODO: add length validation
  },
  personalBio: {
    type: String,
    // TODO: Not required on the front-end. Clarify with Ying Tong
    // required: [
    //   function () {
    //     return this.accountType === AccountType.INDIVIDUAL;
    //   },
    //   'cannot be blank',
    // ],
    // TODO: add length validation
  },

  hashedPassword: String,

  // Account confirmation
  confirmedAt: Date,
  confirmationToken: String,
  role: {
    type: String,
    enum: [Role.project_owner],
    default: [Role.project_owner],
    required: [true, 'cannot be blank'],
  },
});

ProjectOwnerSchema.plugin(uniqueValidator, { message: 'is already taken.' });

ProjectOwnerSchema.methods.toJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    accountType: this.accountType,
    websiteUrl: this.websiteUrl,
    socialMediaLink: this.socialMediaLink,
    profilePhotoUrl: this.profilePhotoUrl,
    organisationName: this.organisationName,
    description: this.description,
    personalBio: this.personalBio,
  };
};

ProjectOwnerSchema.methods.setPassword = async function (password) {
  if (password.length < 6) {
    throw constructMongooseValidationError('password', 'should be a minimum of 6 characters');
  }
  const saltRounds = 10;
  this.hashedPassword = await bcrypt.hash(password, saltRounds);
};

ProjectOwnerSchema.methods.isValidPassword = async function (password) {
  return bcrypt.compare(password, this.hashedPassword);
};

ProjectOwnerSchema.methods.generateConfirmationToken = async function () {
  const confirmationToken = await uid(18);

  this.set({ confirmationToken });
  await this.save();

  return confirmationToken;
};

ProjectOwnerSchema.methods.confirm = async function () {
  this.set({ confirmedAt: new Date() });
  await this.save();
};

ProjectOwnerSchema.methods.isConfirmed = function () {
  return !!this.confirmedAt;
};

ProjectOwnerSchema.methods.generateJwt = function (csrfToken) {
  return jwt.sign(
    {
      userid: this._id,
      name: this.name,
      email: this.email,
      role: this.role,
      csrfToken,
    },
    `${config.AUTH_SECRET}-${this.hashedPassword}-${this.lastLogoutTime}`,
    {
      expiresIn: config.JWT_EXPIRES_IN,
    },
  );
};

export const ProjectOwner = mongoose.model('ProjectOwner', ProjectOwnerSchema);
