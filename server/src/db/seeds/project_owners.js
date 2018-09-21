import { ProjectOwner } from 'models/ProjectOwner';
import { seedData, connectMongoose, closeMongooseConnection } from './utils';

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
const projectOwners = async () => {
  connectMongoose();
  await seedData(projectOwnerAttributes, ProjectOwner, 'project owner');
  closeMongooseConnection();
};
projectOwners();
