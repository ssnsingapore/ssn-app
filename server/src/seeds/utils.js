import mongoose from 'mongoose';
import { config } from 'config/environment';

const connectMongoose = () => {
  const options = config.MONGO_USERNAME
    ? {
      auth: {
        user: config.MONGO_USERNAME,
        password: config.MONGO_PASSWORD,
      },
    } : {};
  mongoose.connect(config.DATABASE_URI, options);
};

export const seedData = async (modelAttributes, Model, modelName) => {
  connectMongoose();

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
  } finally {
    mongoose.connection.close();
  }
};
