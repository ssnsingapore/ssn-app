import mongoose from 'mongoose';
import { ProjectOwner } from 'models/ProjectOwner';
import { config } from 'config/environment';

const options = config.MONGO_USERNAME
  ? {
    auth: {
      user: config.MONGO_USERNAME,
      password: config.MONGO_PASSWORD,
    },
  } : {};
mongoose.connect(config.DATABASE_URI, options);

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

projectOwnerAttributes.forEach((projectOwnerAttribute) => {
  const projectOwner = new ProjectOwner(projectOwnerAttribute);
  projectOwner.save();
});
