import { ProjectOwner } from 'models/ProjectOwner';
import { seedData } from './utils';

const projectOwnerAttributes = [
  {
    name: 'Cat Society',
    email: 'test@test.com',
    accountType: 'ORGANIZATION',
  },
  {
    name: 'Earth Society',
    email: 'test@test.com',
    accountType: 'ORGANIZATION',
  },
];

seedData(projectOwnerAttributes, ProjectOwner, 'project owner');
