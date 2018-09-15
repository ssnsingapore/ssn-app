import mongoose from 'mongoose';
import { Project } from 'models/Project';
import { config } from 'config/environment';

const options = config.MONGO_USERNAME
  ? {
    auth: {
      user: config.MONGO_USERNAME,
      password: config.MONGO_PASSWORD,
    },
  } : {};
mongoose.connect(config.DATABASE_URI, options);
const volunteerRequirementAttributes = [
  {
    type: 'Booth Assistant',
    commitmentLevel: 'Once a Week',
    number: 5,
  },
];
const projectAttributes = [
  {
    title: 'Save the Earth',
    coverImageUrl: 'www.google.com',
    description: 'Save the earth description',
    volunteerSignupUrl: '',
    volunteerRequirements: volunteerRequirementAttributes,
    projectOwner: '5b9cd06c1c22696a2f87c93b',
    issuesAddressed: ['BIODIVERSITY'],
  },
  {
    title: 'Cat Adoption Drive',
    coverImageUrl: 'www.google.com',
    description: 'Save the earth description',
    volunteerSignupUrl: '',
    volunteerRequirements: volunteerRequirementAttributes,
    projectOwner: '5b9cd06c1c22696a2f87c93b',
    issuesAddressed: ['AIR_QUALITY'],
  },
  {
    title: 'Greenland Project',
    coverImageUrl: 'www.google.com',
    description: 'Greenland Project description',
    volunteerSignupUrl: '',
    volunteerRequirements: volunteerRequirementAttributes,
    projectOwner: '5b9cd06c1c22696a2f87c93b',
    issuesAddressed: ['BIODIVERSITY', 'AIR_QUALITY'],

  },
];

projectAttributes.forEach((projectAttribute) => {
  const project = new Project(projectAttribute);
  project.save();
});
