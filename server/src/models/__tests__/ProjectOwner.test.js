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
    it('throws custom Validation Error when email is not unique', async () => {
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

      try {
        await newUser.save();
      } catch (error) {
        expect(error.name).toEqual('ValidationError');
        expect(error.message).toContainEqual(new UnprocessableEntityErrorView(
          'email',
          'email is already associated with another account.',
        ));
      }
    });
  });
});
