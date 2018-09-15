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

const projectAttributes = [
  {
    title: 'Save the Earth',
  },
  {
    title: 'Cat Adoption Drive',
  },
];

projectAttributes.forEach((projectAttribute) => {
  const project = new Project(projectAttribute);
  project.save();
});

