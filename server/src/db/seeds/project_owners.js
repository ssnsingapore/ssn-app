import { ProjectOwner } from 'models/ProjectOwner';
import { seedData, connectMongoose, closeMongooseConnection } from './utils';

const projectOwnerAttributes = [
  {
    name: 'Cat Society',
    email: 'test@test.com',
    accountType: 'ORGANIZATION',
    websiteUrl: 'https://thecatsite.com/',
    socialMediaLink: 'https://twitter.com/awyeahcatgifs',
    profilePhotoUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0-6cOe8ak3u1PWfiFXOmDrOgKan1exVg-T4lryx41j-W_78Hubg',
    organisationName: 'Cat Society',
    description: 'Everything cats.',
  },
  {
    name: 'Earth Society',
    email: 'test1@test.com',
    accountType: 'ORGANIZATION',
    websiteUrl: 'https://www.earthsocietysg.com/',
    socialMediaLink: '',
    profilePhotoUrl:
      'https://s3-eu-west-1.amazonaws.com/nusdigital/group/images/12287/medium/logo.jpg',
    organisationName: 'Earth Society (Singapore)',
    description:
      'Earth Society is a non-profit organization formed by a team of individuals who are passionate about environmental protection.',
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
  },
];
const projectOwners = async () => {
  connectMongoose();
  await seedData(projectOwnerAttributes, ProjectOwner, 'project owner');
  closeMongooseConnection();
};
projectOwners();
