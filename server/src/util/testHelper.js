import moment from 'moment';
import { ProjectOwner } from 'models/ProjectOwner';
import {
  Project,
  VolunteerRequirementType,
  ProjectType,
  IssueAddressed,
  ProjectRegion,
  ProjectFrequency,
  ProjectState,
} from 'models/Project';
import { Role } from 'models/Role';

export const constructQueryString = params => Object.keys(params)
  .map(key => (key ? `${key}=${params[key]}` : ''))
  .filter(queryString => !!queryString)
  .join('&');

export const createProjectOwner = (overrideAttributes = {}) => {
  const projectOwner = new ProjectOwner();
  projectOwner.setPassword('test123');

  return new ProjectOwner({
    name: 'Cat Society',
    email: 'test@test.com',
    accountType: 'ORGANISATION',
    websiteUrl: 'https://thecatsite.com/',
    socialMediaLink: 'https://twitter.com/awyeahcatgifs',
    profilePhotoUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0-6cOe8ak3u1PWfiFXOmDrOgKan1exVg-T4lryx41j-W_78Hubg',
    organisationName: 'Cat Society',
    description: 'Everything cats.',
    role: Role.PROJECT_OWNER,
    hashedPassword: projectOwner.hashedPassword,
    confirmedAt: new Date(),
    ...overrideAttributes,
  });
};

export const saveProjectOwner = async (overrideAttributes = {}) => createProjectOwner(overrideAttributes).save();

export const createProject = (projectOwner, overrideAttributes = {}) => new Project({
  title: 'Cat Adoption Drive',
  coverImageUrl:
    'https://s3-ap-southeast-1.amazonaws.com/ssn-app-maryana/Singapore-Cat-Festival-2018.jpg',
  description: 'Save the earth description',
  volunteerSignupUrl: '',
  volunteerRequirements: [
    {
      type: [VolunteerRequirementType.INTERACTION],
      commitmentLevel: 'Once a Week',
      number: 5,
    },
  ],
  projectOwner: projectOwner.id,
  issuesAddressed: [IssueAddressed.AIR_QUALITY],
  volunteerRequirementsDescription: 'requirementDescription2',
  volunteerBenefitsDescription: 'lunch',
  projectType: ProjectType.EVENT,
  time: '10 AM',
  location: ProjectRegion.WEST,
  state: ProjectState.PENDING_APPROVAL,
  startDate: moment('2018-10-1').toDate(),
  endDate: moment('2018-10-1').toDate(),
  frequency: ProjectFrequency.ONCE_A_WEEK,
  ...overrideAttributes,
  rejectionReason: 'rejected',
});

export const saveProject = async (projectOwner, overrideAttributes = {}) => createProject(projectOwner, overrideAttributes).save();
