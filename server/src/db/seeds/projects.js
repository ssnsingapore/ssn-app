import {
  Project,
  IssueAddressed,
  ProjectState,
  ProjectType,
  ProjectLocation,
  ProjectFrequency,
  VolunteerRequirementType,
} from 'models/Project';

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
        type: [VolunteerRequirementType.INTERACTION],
        commitmentLevel: 'Once a Week',
        number: 5,
      },
    ];

    const projectAttributes = [
      {
        title: 'Save the Earth',
        coverImageUrl: 'https://s3-ap-southeast-1.amazonaws.com/ssn-app-maryana/Terra-recycling.jpg',
        description: 'Save the earth description',
        volunteerSignupUrl: '',
        volunteerRequirements: volunteerRequirementAttributes,
        projectOwner: projectOwner.id,
        issuesAddressed: [IssueAddressed.LAND_AND_NOISE_POLLUTION, IssueAddressed.WASTE],
        volunteerRequirementsDescription: 'requirementDescription1',
        volunteerBenefitsDescription: 'certificate',
        projectType: ProjectType.EVENT,
        time: '9 AM',
        location: ProjectLocation.CENTRAL,
        state: ProjectState.APPROVED,
        startDate: new Date(),
        endDate: new Date(2016, 1, 1),
        frequency: ProjectFrequency.ONCE_A_WEEK,
      },
      {
        title: 'Cat Adoption Drive',
        coverImageUrl: 'https://s3-ap-southeast-1.amazonaws.com/ssn-app-maryana/Singapore-Cat-Festival-2018.jpg',
        description: 'Save the earth description',
        volunteerSignupUrl: '',
        volunteerRequirements: volunteerRequirementAttributes,
        projectOwner: projectOwner.id,
        issuesAddressed: [IssueAddressed.AIR_QUALITY],
        volunteerRequirementsDescription: 'requirementDescription2',
        volunteerBenefitsDescription: 'lunch',
        projectType: ProjectType.EVENT,
        time: '10 AM',
        location: ProjectLocation.WEST,
        state: ProjectState.PENDING_APPROVAL,
        startDate: new Date(),
        endDate: new Date(2016, 1, 1),
        frequency: ProjectFrequency.ONCE_A_WEEK,
      },
      {
        title: 'Greenland Project',
        coverImageUrl: 'https://s3-ap-southeast-1.amazonaws.com/ssn-app-maryana/greenland.png',
        description: 'Greenland Project description',
        volunteerSignupUrl: '',
        volunteerRequirements: volunteerRequirementAttributes,
        projectOwner: projectOwner.id,
        issuesAddressed: [IssueAddressed.WASTE, IssueAddressed.GREEN_LIFESTYLE],
        volunteerRequirementsDescription: 'requirementDescription1',
        volunteerBenefitsDescription: 'certificate',
        projectType: ProjectType.RECURRING,
        time: '9 AM',
        location: ProjectLocation.WEST,
        state: ProjectState.PENDING_APPROVAL,
        startDate: new Date(),
        endDate: new Date(),
        frequency: ProjectFrequency.A_FEW_TIMES_A_YEAR,
      },
      {
        title: 'Default Image Project',
        description: 'Default Image Project description',
        volunteerSignupUrl: '',
        volunteerRequirements: volunteerRequirementAttributes,
        projectOwner: projectOwner.id,
        issuesAddressed: [IssueAddressed.WASTE, IssueAddressed.GREEN_LIFESTYLE],
        volunteerRequirementsDescription: 'requirementDescription1',
        volunteerBenefitsDescription: 'certificate',
        projectType: ProjectType.RECURRING,
        time: '9 AM',
        location: ProjectLocation.WEST,
        state: ProjectState.APPROVED_ACTIVE,
        startDate: new Date(),
        endDate: new Date(),
        frequency: ProjectFrequency.A_FEW_TIMES_A_YEAR,
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
