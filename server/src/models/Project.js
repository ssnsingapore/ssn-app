import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'cannot be blank'],
    },
  },
  { timestamps: true }
);

export const Project = mongoose.model('Project', ProjectSchema);
