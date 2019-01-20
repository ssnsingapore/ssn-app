import mongoose from 'mongoose';
import { config } from 'config/environment';
import { ProjectOwner } from 'models/ProjectOwner';

export const connectMongoose = () => {
  const options = config.MONGO_USERNAME
    ? {
      auth: {
        user: config.MONGO_USERNAME,
        password: config.MONGO_PASSWORD,
      },
      useCreateIndex: true,
      useNewUrlParser: true,
    } : {};
  mongoose.connect(config.DATABASE_URI, options);
};

export const closeMongooseConnection = () => {
  mongoose.connection.close();
};

export const seedData = async (modelAttributes, Model, modelName) => {
  try {
    const savePromises = modelAttributes.map((projectAttribute) => {
      console.log('Seeding one record...');
      const model = new Model(projectAttribute);
      return model.save();
    });

    await Promise.all(savePromises);
    console.log('====== SEEDING DONE ======');
    console.log(`Total of ${modelAttributes.length} ${modelName}s seeded`);
  } catch (err) {
    console.error(`Seeding ${modelName} failed with error:`, err);
  }
};

export const getProjectOwner = async () => {
  let owner;
  try {
    console.log('Retrieving all ProjectOwners...');
    owner = await ProjectOwner.findOne({});
  } catch (err) {
    console.error('Finding project owner failed with error:', err);
  }
  return owner;
};
