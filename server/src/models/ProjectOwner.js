import mongoose from 'mongoose';


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
    enum: ['ORGANIZATION', 'INDIVIDUAL'],
  },

});

export const ProjectOwner = mongoose.model('ProjectOwner', ProjectOwnerSchema);
