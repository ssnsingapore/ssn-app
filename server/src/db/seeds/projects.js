import { Project } from 'models/Project';
import {
  seedData, getProjectOwner, connectMongoose, closeMongooseConnection,
} from './utils';

connectMongoose();

getProjectOwner().then(async (projectOwner) => {
  if (!projectOwner) {
    console.log('Please seed Project Owners first');
    return;
  }
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
      projectOwner: projectOwner.id,
      issuesAddressed: ['BIODIVERSITY'],
    },
    {
      title: 'Cat Adoption Drive',
      coverImageUrl: 'www.google.com',
      description: 'Save the earth description',
      volunteerSignupUrl: '',
      volunteerRequirements: volunteerRequirementAttributes,
      projectOwner: projectOwner.id,
      issuesAddressed: ['AIR_QUALITY'],
    },
    {
      title: 'Greenland Project',
      coverImageUrl: 'www.google.com',
      description: 'Greenland Project description',
      volunteerSignupUrl: '',
      volunteerRequirements: volunteerRequirementAttributes,
      projectOwner: projectOwner.id,
      issuesAddressed: ['BIODIVERSITY', 'AIR_QUALITY'],

    },
  ];

  await seedData(projectAttributes, Project, 'project');
}).catch((err) => {
  console.log(`error: ${err}`);
})
  .finally(() => {
    closeMongooseConnection();
  });
