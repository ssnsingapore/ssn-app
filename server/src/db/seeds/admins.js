import { Admin } from 'models/Admin';
import { Role } from 'models/Role';
import { seedData, connectMongoose, closeMongooseConnection } from './utils';

const admin = new Admin();

admin.setPassword('test123').then(async () => {
  const adminAttributes = [
    {
      email: 'adam4@example.com',
      role: Role.ADMIN,
      hashedPassword: admin.hashedPassword,
    },
    {
      email: 'adam6@example.com',
      role: Role.ADMIN,
      hashedPassword: admin.hashedPassword,
    },
    {
      email: 'adam8@example.com',
      role: Role.ADMIN,
      hashedPassword: admin.hashedPassword,
    },
  ];

  connectMongoose();
  await seedData(adminAttributes, Admin, 'admin');
  closeMongooseConnection();
});
