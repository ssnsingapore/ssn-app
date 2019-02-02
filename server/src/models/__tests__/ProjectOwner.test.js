import mongoose from 'mongoose';
import { UnprocessableEntityErrorView } from 'util/errors';

import { ProjectOwner } from '../ProjectOwner';

describe('Project Owner', () => {
  beforeAll(async () => {
    await mongoose.connect(global.mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('email', () => {
    it('has to be unique', async () => {
      const email = 'test@test.com';

      const existingUser = new ProjectOwner({
        name: 'existing',
        email,
      });
      const user = await existingUser.save();
      expect(user.email).toEqual(email);

      const newUser = new ProjectOwner({
        name: 'new',
        email,
      });

      await expect(newUser.save()).rejects.toContainEqual(new UnprocessableEntityErrorView(
        'Email is taken',
        'The email address you have entered is already associated with another account',
      ));
    });
  });
});
