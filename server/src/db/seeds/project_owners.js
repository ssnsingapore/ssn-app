import { ProjectOwner } from 'models/ProjectOwner';
import { Role } from 'models/Role';
import { seedData, connectMongoose, closeMongooseConnection } from './utils';

const projectOwner = new ProjectOwner();


projectOwner.setPassword('test123').then(async () => {
  const projectOwnerAttributes = [
    {
      name: 'Cat Society',
      email: 'test@test.com',
      accountType: 'ORGANISATION',
      websiteUrl: 'https://thecatsite.com/',
      socialMediaLink: 'https://twitter.com/awyeahcatgifs',
      profilePhotoUrl:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0-6cOe8ak3u1PWfiFXOmDrOgKan1exVg-T4lryx41j-W_78Hubg',
      organisationName: 'Cat Society',
      description: 'Everything cats.',
      role: Role.PROJECT_OWNER,
      hashedPassword: projectOwner.hashedPassword,
      confirmedAt: new Date(),
    },
    {
      name: 'Earth Society',
      email: 'earthsoc@test.com',
      accountType: 'ORGANISATION',
      websiteUrl: 'https://www.earthsocietysg.com/',
      socialMediaLink: '',
      profilePhotoUrl:
        'https://s3-eu-west-1.amazonaws.com/nusdigital/group/images/12287/medium/logo.jpg',
      organisationName: 'Earth Society (Singapore)',
      description:
        'Earth Society is a non-profit organisation formed by a team of individuals who are passionate about environmental protection.',
      role: Role.PROJECT_OWNER,
      hashedPassword: projectOwner.hashedPassword,
      confirmedAt: new Date(),
    },
    {
      name: 'Winnie the Pooh',
      email: 'big.pooh@hundredacrewoods.net',
      accountType: 'INDIVIDUAL',
      websiteUrl: 'moarhoney.com',
      socialMediaLink: 'twiiter.com/moarhoney',
      profilePhotoUrl:
        'http://img.photobucket.com/albums/v252/bellper/1B61C472-A0F6-4ED1-8EFD-3D86B8ABA8EB.gif',
      personalBio: 'Save the bees for the betterment of hungry bears.',
      role: Role.PROJECT_OWNER,
      hashedPassword: projectOwner.hashedPassword,
      confirmedAt: new Date(),
    },
    {
      name: 'Test user 1',
      email: 'test1@test.com',
      accountType: 'INDIVIDUAL',
      role: Role.PROJECT_OWNER,
      hashedPassword: projectOwner.hashedPassword,
      confirmedAt: new Date(),
    },
    {
      name: 'Test user 2',
      email: 'test2@test.com',
      accountType: 'INDIVIDUAL',
      role: Role.PROJECT_OWNER,
      hashedPassword: projectOwner.hashedPassword,
      confirmedAt: new Date(),
    },
    {
      name: 'Test user 3',
      email: 'test3@test.com',
      accountType: 'INDIVIDUAL',
      role: Role.PROJECT_OWNER,
      hashedPassword: projectOwner.hashedPassword,
      confirmedAt: new Date(),
    },
    {
      name: 'Test user 4',
      email: 'test4@test.com',
      accountType: 'INDIVIDUAL',
      role: Role.PROJECT_OWNER,
      hashedPassword: projectOwner.hashedPassword,
      confirmedAt: new Date(),
    },
    {
      name: 'Test user 5',
      email: 'test5@test.com',
      accountType: 'INDIVIDUAL',
      role: Role.PROJECT_OWNER,
      hashedPassword: projectOwner.hashedPassword,
      confirmedAt: new Date(),
    },
    {
      name: 'Test user 6',
      email: 'test6@test.com',
      accountType: 'INDIVIDUAL',
      role: Role.PROJECT_OWNER,
      hashedPassword: projectOwner.hashedPassword,
      confirmedAt: new Date(),
    },
    {
      name: 'Test user 7',
      email: 'test7@test.com',
      accountType: 'INDIVIDUAL',
      role: Role.PROJECT_OWNER,
      hashedPassword: projectOwner.hashedPassword,
      confirmedAt: new Date(),
    },
    {
      name: 'Test user 8',
      email: 'test8@test.com',
      accountType: 'INDIVIDUAL',
      role: Role.PROJECT_OWNER,
      hashedPassword: projectOwner.hashedPassword,
      confirmedAt: new Date(),
    },
    {
      name: 'Other user 1',
      email: 'testing1@testing.com',
      accountType: 'INDIVIDUAL',
      role: Role.PROJECT_OWNER,
      hashedPassword: projectOwner.hashedPassword,
      confirmedAt: new Date(),
    },
    {
      name: 'Other user 2',
      email: 'testing2@testing.com',
      accountType: 'INDIVIDUAL',
      role: Role.PROJECT_OWNER,
      hashedPassword: projectOwner.hashedPassword,
      confirmedAt: new Date(),
    },
    {
      name: 'Other user 3',
      email: 'testing3@testing.com',
      accountType: 'INDIVIDUAL',
      role: Role.PROJECT_OWNER,
      hashedPassword: projectOwner.hashedPassword,
      confirmedAt: new Date(),
    },
    {
      name: 'Other user 4',
      email: 'testing4@testing.com',
      accountType: 'INDIVIDUAL',
      role: Role.PROJECT_OWNER,
      hashedPassword: projectOwner.hashedPassword,
      confirmedAt: new Date(),
    },
    {
      name: 'Other user 5',
      email: 'testing5@testing.com',
      accountType: 'INDIVIDUAL',
      role: Role.PROJECT_OWNER,
      hashedPassword: projectOwner.hashedPassword,
      confirmedAt: new Date(),
    },
    {
      name: 'Other user 6',
      email: 'testing6@testing.com',
      accountType: 'INDIVIDUAL',
      role: Role.PROJECT_OWNER,
      hashedPassword: projectOwner.hashedPassword,
      confirmedAt: new Date(),
    },
    {
      name: 'Other user 7',
      email: 'testing7@testing.com',
      accountType: 'INDIVIDUAL',
      role: Role.PROJECT_OWNER,
      hashedPassword: projectOwner.hashedPassword,
      confirmedAt: new Date(),
    },
    {
      name: 'Other user 8',
      email: 'testing8@testing.com',
      accountType: 'INDIVIDUAL',
      role: Role.PROJECT_OWNER,
      hashedPassword: projectOwner.hashedPassword,
      confirmedAt: new Date(),
    },
  ];
  connectMongoose();
  await seedData(projectOwnerAttributes, ProjectOwner, 'project owner');
  closeMongooseConnection();
});
