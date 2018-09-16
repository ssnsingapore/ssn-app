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

const dropDb = async () => {
  connectMongoose();
  await mongoose.connection.dropDatabase();
  console.log(`Dropped database at URI: ${config.DATABASE_URI}`);
  mongoose.connection.close();
};

dropDb();
