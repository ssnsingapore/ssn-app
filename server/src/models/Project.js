import mongoose from 'mongoose';

export const IssueAddressed = {
  AIR_QUALITY: 'Air Quality',
  AWARENESS_AND_EDUCATION: 'Awareness and Education',
  BIODIVERSITY: 'Biodiversity',
  CLIMATE: 'Climate',
  CONSERVATION: 'Conservation',
  ENERGY: 'Energy',
  FOOD_AND_AGRICULTURE: 'Food and Agriculture',
  GREEN_LIFESTYLE: 'Green Lifestyle',
  LAND_AND_NOISE_POLLUTION: 'Land and Noise Pollution',
  PLANNING_AND_TRANSPORTATION: 'Planning and Transportation',
  PRODUCTION_AND_CONSUMPTION: 'Production and Consumption',
  OTHER: 'Other',
  SPORTS_AND_RECREATION: 'Sports and Recreation',
  WASTE: 'Waste',
  WATER: 'Water',
  GREEN_TECHNOLOGY: 'Green Technology',
};

export const ProjectState = {
  PENDING_APPROVAL: 'Pending Approval',
  APPROVED_ACTIVE: 'Approved Active',
  APPROVED_INACTIVE: 'Approved Inactive',
  REJECTED: 'Rejected',
};

export const ProjectType = {
  EVENT: 'Event',
  RECURRING: 'Recurring',
};

export const ProjectLocation = {
  CENTRAL: 'Central',
  NORTH: 'North',
  SOUTH: 'South',
  EAST: 'East',
  WEST: 'West',
};

export const ProjectFrequency = {
  EVERY_DAY: 'Every Day',
  A_FEW_TIMES_A_WEEK: 'A Few Times a Week',
  ONCE_A_WEEK: 'Once a Week',
  FORTNIGHTLY: 'Fortnightly',
  A_FEW_TIMES_A_MONTH: 'A Few Times a Month',
  ONCE_A_MONTH: 'Once a Month',
  A_FEW_TIMES_A_YEAR: 'A Few Times a Year',
  ONCE_A_YEAR: 'Once a Year',
};

export const VolunteerRequirementType = {
  INTERACTION: 'Interaction (Hosting / Moderating, etc)',
  CONTENT_CREATION: 'Content Creation (Design, Writing, etc)',
  EVENT_PLANNING: 'Event Planning (Logistics, Programme, etc)',
  MEDIA_AND_SOCIAL_MEDIA: 'Media & Social Media (Photography, Publicity, etc',
  EXPERT_VOLUNTEERS: 'Expert Volunteers (Technologist, Mentors, etc',
  ADHOC_MANPOWER_SUPPORT: 'Ad-Hoc Manpower Support (Ushering, Administrative Work, Working Booths, etc)',
  OTHERS_SKILLED: 'Others (Skilled)',
  OTHERS_ADHOC: 'Others (Ad-hoc)',
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
      type: [String],
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
      type: String,
      required: [true, 'cannot be blank'], // only if event
    },
    endDate: {
      type: String,
      required: [true, 'cannot be blank'], // only if event
    },
    frequency: {
      type: String,
      required: [true, 'cannot be blank'], // only if recurring
      enum: Object.values(ProjectFrequency),
    },
  },
  { timestamps: true }
);

export const Project = mongoose.model('Project', ProjectSchema);
