import { Admin } from 'models/Admin';
import { seedData } from './utils';

const admin = new Admin();

// const password1 = admin.setPassword('test1231').then(() => console.log(admin.hashedPassword));
// const password2 = admin.setPassword('testing153').then(() => console.log(admin.hashedPassword));
// const password3 = admin.setPassword('testpass12!').then(() => console.log(admin.hashedPassword));

const adminAttributes = [
  {
    email: 'adam1@test.com',
    hashedPassword: '$2b$10$pAg6TJHp5hmmAJczObReWelEeElhEJXBDg3A1t18De2adR6jq1Sb.',
    // password1
  },
  {
    email: 'john1@test.com',
    hashedPassword: '$2b$10$nYJyuUNvtgdtrM1IEQRmouAPNjDx79omyiSgCKb492xem50Lnw2gW',
    // password2
  },
  {
    email: 'jean1@test.com',
    hashedPassword: '$2b$10$lR2/NtLCnrTQ3c0CumGk6.aKn6C5CnMoIEioChdrJYAPfVYDIfZG6',
    // password3
  },
];

seedData(adminAttributes, Admin, 'admins');
