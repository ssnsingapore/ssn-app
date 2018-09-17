import { Admin } from 'models/Admin';
import { seedData } from './utils';

const adminAttributes = [
  {
    email: 'adam@test.com',
    hashedPassword: 'xkjdkfjaksdfq928472',
  },
  {
    email: 'john@test.com',
    hashedPassword: 'xkjdkfjakdfdfdfdsdfq928472',
  },
  {
    email: 'jean@test.com',
    hashedPassword: 'xkjdkfjaksdafadfasdffq928472',
  },
];

seedData(adminAttributes, Admin, 'admins');
