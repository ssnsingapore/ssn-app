import mongoose from 'mongoose';


const VolunteerRequirementSchema = new mongoose.Schema({
  type: String,
  commitmentLevel: String,
  number: Number,
});

const ProjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'cannot be blank'],
    },
    coverImageUrl: {
      type: String,
      required: [true, 'cannot be blank'],
    },
    description: {
      type: String,
      required: [true, 'cannot be blank'],
    },
    volunteerSignupUrl: String,
    volunteerRequirements: [VolunteerRequirementSchema],
    projectOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectOwner' },
    issuesAddressed: {
      type: [String],
      enum: ['AIR_QUALITY', 'BIODIVERSITY'],
    },
  },
  { timestamps: true }
);

export const Project = mongoose.model('Project', ProjectSchema);
