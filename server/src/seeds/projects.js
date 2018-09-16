import { Project } from 'models/Project';
import { seedData } from './utils';

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
    projectOwner: '5b9dc395eaf06391d3df9a90',
    issuesAddressed: ['BIODIVERSITY'],
  },
  {
    title: 'Cat Adoption Drive',
    coverImageUrl: 'www.google.com',
    description: 'Save the earth description',
    volunteerSignupUrl: '',
    volunteerRequirements: volunteerRequirementAttributes,
    projectOwner: '5b9dc395eaf06391d3df9a90',
    issuesAddressed: ['AIR_QUALITY'],
  },
  {
    title: 'Greenland Project',
    coverImageUrl: 'www.google.com',
    description: 'Greenland Project description',
    volunteerSignupUrl: '',
    volunteerRequirements: volunteerRequirementAttributes,
    projectOwner: '5b9dc395eaf06391d3df9a90',
    issuesAddressed: ['BIODIVERSITY', 'AIR_QUALITY'],

  },
];

seedData(projectAttributes, Project, 'project');
