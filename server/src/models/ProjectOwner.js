import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

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
    // TODO: Validation is somehow failing for some of the seeds
    // match: [
    //   // eslint-disable-next-line no-useless-escape
    //   /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi,
    //   'is invalid',
    // ],
  },
  socialMediaLink: {
    type: String,
    // TODO: Validation is somehow failing for some of the seeds
    // match: [
    //   // eslint-disable-next-line no-useless-escape
    //   /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi,
    //   'is invalid',
    // ],
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
    required: [
      function () {
        return this.accountType === AccountType.ORGANIZATION;
      },
      'cannot be blank',
    ],
  },
  personalBio: {
    type: String,
    required: [
      function () {
        return this.accountType === AccountType.INDIVIDUAL;
      },
      'cannot be blank',
    ],
  },
});

ProjectOwnerSchema.plugin(uniqueValidator, { message: 'is already taken.' });

export const ProjectOwner = mongoose.model('ProjectOwner', ProjectOwnerSchema);
