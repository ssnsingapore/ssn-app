import { Project } from 'models/Project';
import {
  seedData,
  getProjectOwner,
  connectMongoose,
  closeMongooseConnection,
} from './utils';

connectMongoose();

getProjectOwner()
  .then(async (projectOwner) => {
    if (!projectOwner) {
      console.log('Please seed Project Owners first');
      return;
    }
    const volunteerRequirementAttributes = [
      {
        type: '',
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
        volunteerRequirementsDescription: 'requirementDescription1',
        volunteerBenefitsDescription: 'certificate',
        projectType: ['RECURRING'],
        time: '9 AM',
        location: ['CENTRAL'],
        state: ['PENDING_APPROVAL'],
        startDate: '1 NOV 2018',
        endDate: '30 NOV 2018',
        frequency: ['ONCE_A_WEEK'],
      },
      {
        title: 'Cat Adoption Drive',
        coverImageUrl: 'www.google.com',
        description: 'Save the earth description',
        volunteerSignupUrl: '',
        volunteerRequirements: volunteerRequirementAttributes,
        projectOwner: projectOwner.id,
        issuesAddressed: ['AIR_QUALITY'],
        volunteerRequirementsDescription: 'requirementDescription2',
        volunteerBenefitsDescription: 'lunch',
        projectType: ['EVENT'],
        time: '10 AM',
        location: ['WEST'],
        state: ['PENDING_APPROVAL'],
        startDate: '1 DEC 2018',
        endDate: '30 DEC 2018',
        frequency: ['ONCE_A_WEEK'],
      },
      {
        title: 'Greenland Project',
        coverImageUrl: 'www.google.com',
        description: 'Greenland Project description',
        volunteerSignupUrl: '',
        volunteerRequirements: volunteerRequirementAttributes,
        projectOwner: projectOwner.id,
        issuesAddressed: ['WASTE', 'FOOD_&_AGRICULTURE'],
        volunteerRequirementsDescription: 'requirementDescription1',
        volunteerBenefitsDescription: 'certificate',
        projectType: ['RECURRING'],
        time: '9 AM',
        location: ['EAST'],
        state: ['PENDING_APPROVAL'],
        startDate: '1 JAN 2019',
        endDate: '30 JAN 2019',
        frequency: ['A_FEW_TIMES_A_YEAR'],
      },
    ];

    await seedData(projectAttributes, Project, 'project');
  })
  .catch((err) => {
    console.log(`error: ${err}`);
  })
  .finally(() => {
    closeMongooseConnection();
  });
