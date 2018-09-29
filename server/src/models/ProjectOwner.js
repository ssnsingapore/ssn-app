import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import uniqueValidator from 'mongoose-unique-validator';
import uid from 'uid-safe';

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

  hashedPassword: String,

  // Account confirmation
  confirmedAt: Date,
  confirmationToken: String,
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
  const saltRounds = 10;
  this.hashedPassword = await bcrypt.hash(password, saltRounds);
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

export const ProjectOwner = mongoose.model('ProjectOwner', ProjectOwnerSchema);
