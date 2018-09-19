import mongoose from 'mongoose';

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
    required: [true, 'cannot be blank'],
  },
  accountType: {
    type: String,
    enum: Object.keys(AccountType),
  },

});

export const ProjectOwner = mongoose.model('ProjectOwner', ProjectOwnerSchema);
