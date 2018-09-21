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
    enum: Object.keys(AccountType),
  },
  websiteUrl: {
    type: String,
    /* match: [
       /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm,
      'is invalid',
    ], */
  },
  socialMediaLink: {
    type: String,
    /* match: [
      /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm,
      'is invalid',
    ], */
  },
  profilePhotoUrl: {
    type: String,
  },
  organisationName: {
    type: String,
    accountType: { enum: 'ORGANIZATION' },
  },
  description: {
    type: String,
    accountType: { enum: 'ORGANIZATION' },
  },
  personalBio: {
    type: String,
    accountType: { enum: 'INDIVIDUAL' },
  },
});

ProjectOwnerSchema.plugin(uniqueValidator, { message: 'is already taken.' });

export const ProjectOwner = mongoose.model('ProjectOwner', ProjectOwnerSchema);
