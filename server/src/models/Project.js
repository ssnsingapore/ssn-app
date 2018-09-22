import mongoose from 'mongoose';

export const IssueAddressed = {
  AIR_QUALITY: 'AIR_QUALITY',
  AWARENESS_AND_EDUCATION: 'AWARENESS_AND_EDUCATION',
  BIODIVERSITY: 'BIODIVERSITY',
  CLIMATE: 'CLIMATE',
  CONSERVATION: 'CONSERVATION',
  ENERGY: 'ENERGY',
  FOOD_AND_AGRICULTURE: 'FOOD_AND_AGRICULTURE',
  GREEN_LIFESTYLE: 'GREEN_LIFESTYLE',
  LAND_AND_NOISE_POLLUTION: 'LAND_AND_NOISE_POLLUTION',
  PLANNING_AND_TRANSPORTATION: 'PLANNING_AND_TRANSPORTATION',
  PRODUCTION_AND_CONSUMPTION: 'PRODUCTION_AND_CONSUMPTION',
  OTHER: 'OTHER',
  SPORTS_AND_RECREATION: 'SPORTS_AND_RECREATION',
  WASTE: 'WASTE',
  WATER: 'WATER',
  GREEN_TECHNOLOGY: 'GREEN_TECHNOLOGY',
};

export const ProjectState = {
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED_ACTIVE: 'APPROVED_ACTIVE',
  APPROVED_INACTIVE: 'APPROVED_INACTIVE',
  REJECTED: 'REJECTED',
};

export const ProjectType = {
  EVENT: 'EVENT',
  RECURRING: 'RECURRING',
};

export const ProjectLocation = {
  CENTRAL: 'CENTRAL',
  NORTH: 'NORTH',
  SOUTH: 'SOUTH',
  EAST: 'EAST',
  WEST: 'WEST',
};

export const ProjectFrequency = {
  EVERY_DAY: 'EVERY_DAY',
  A_FEW_TIMES_A_WEEK: 'A_FEW_TIMES_A_WEEK',
  ONCE_A_WEEK: 'ONCE_A_WEEK',
  FORTNIGHTLY: 'FORTNIGHTLY',
  A_FEW_TIMES_A_MONTH: 'A_FEW_TIMES_A_MONTH',
  ONCE_A_MONTH: 'ONCE_A_MONTH',
  A_FEW_TIMES_A_YEAR: 'A_FEW_TIMES_A_YEAR',
  ONCE_A_YEAR: 'ONCE_A_YEAR',
};

export const VolunteerRequirementType = {
  INTERACTION: 'INTERACTION',
  CONTENT_CREATION: 'CONTENT_CREATION',
  EVENT_PLANNING: 'EVENT_PLANNING',
  MEDIA_AND_SOCIAL_MEDIA: 'MEDIA_AND_SOCIAL_MEDIA',
  EXPERT_VOLUNTEERS: 'EXPERT_VOLUNTEERS',
  ADHOC_MANPOWER_SUPPORT: 'ADHOC_MANPOWER_SUPPORT',
  OTHERS_SKILLED: 'OTHERS_SKILLED',
  OTHERS_ADHOC: 'OTHERS_ADHOC',
};

const VolunteerRequirementSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: Object.values(VolunteerRequirementType),
  },
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
      enum: Object.values(IssueAddressed),
    },
    volunteerRequirementsDescription: String,
    volunteerBenefitsDescription: String,
    projectType: {
      type: String,
      required: [true, 'cannot be blank'],
      enum: Object.values(ProjectType),
    },
    time: {
      type: String,
      required: [true, 'cannot be blank'],
    },
    location: {
      type: String,
      required: [true, 'cannot be blank'],
      enum: Object.values(ProjectLocation),
    },
    state: {
      type: String,
      enum: Object.values(ProjectState),
    },
    startDate: {
      type: Date,
      required: [function () {
        return (this.projectType === ProjectType.EVENT);
      }, 'cannot be blank'],
    },
    endDate: {
      type: Date,
      required: [function () {
        return (this.projectType === ProjectType.EVENT);
      }, 'cannot be blank'],
    },
    frequency: {
      type: String,
      required: [function () {
        return (this.projectType === ProjectType.RECURRING);
      }, 'cannot be blank'],
      enum: Object.values(ProjectFrequency),
    },
  },
  { timestamps: true }
);

export const Project = mongoose.model('Project', ProjectSchema);
