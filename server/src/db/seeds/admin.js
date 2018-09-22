import { Admin } from 'models/Admin';
import { seedData, connectMongoose, closeMongooseConnection } from './utils';

const admin = new Admin();

admin.setPassword('test123').then(async () => {
  const adminAttributes = [
    {
      email: 'adam4@test.com',
      hashedPassword: admin.hashedPassword,
    },
    {
      email: 'adam6@test.com',
      hashedPassword: admin.hashedPassword,
    },
    {
      email: 'adam8@test.com',
      hashedPassword: admin.hashedPassword,
    },
  ];

  connectMongoose();
  await seedData(adminAttributes, Admin, 'admins');
  closeMongooseConnection();
});
