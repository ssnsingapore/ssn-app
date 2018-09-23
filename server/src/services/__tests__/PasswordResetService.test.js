import mongoose from 'mongoose';
import { mailer } from 'config/mailer';
import { User } from 'models/User';
import { BadRequestErrorView } from 'util/errors';
import { PasswordResetService } from '../PasswordResetService';

jest.mock('config/mailer');

beforeAll(async () => {
  await mongoose.connect(global.mongoUri);
});

afterAll(async () => {
  mongoose.disconnect();
});

describe('Password reset service', () => {
  const email = 'test@test.com';
  const oldHashedPassword = 'oldhashedpassword';
  let mockUser;
  let passwordResetService;

  beforeEach(async (done) => {
    mailer.sendMail = jest.fn(() => ({ messageId: 'some id' }));
    mockUser = new User({
      name: 'test',
      email,
      hashedPassword: oldHashedPassword,
    });
    await mockUser.save();
    passwordResetService = new PasswordResetService(email);
    done();
  });

  afterEach((done) => {
    User.deleteMany({}).then(() => done());
  });

  describe('triggering password reset', () => {
    it('should find user with given email and return an errorsObject if it does not exist', async () => {
      passwordResetService = new PasswordResetService('non.existent@email.com');

      const errorsObj = await passwordResetService.trigger();

      expect(errorsObj.errors[0]).toMatchObject(
        new BadRequestErrorView(
          'The given email couldn\'t be found in our system'
        ),
      );
      expect(mailer.sendMail).not.toHaveBeenCalled();

      const user = await User.findOne({ email });
      expect(user.passwordResetToken).toBeUndefined();
      expect(user.passwordResetExpiresAt).toBeUndefined();
    });

    describe('when the user with the given email can be found', () => {
      it('should return null errorsObject', async () => {
        const errorsObj = await passwordResetService.trigger(email);

        expect(errorsObj).toBeNull();
      });

      it('should generate a password reset token, set the reset token expiry time, and reset the password to a random value', async () => {
        await passwordResetService.trigger(email);

        const user = await User.findOne({ email });
        expect(user.passwordResetToken).toEqual(expect.any(String));
        expect(user.passwordResetExpiresAt).toEqual(expect.any(Date));
        expect(user.hashedPassword).toEqual(expect.any(String));
        expect(user.hashedPassword).not.toEqual(oldHashedPassword);
      });

      it('should send a password reset email with a password reset token to the user', async () => {
        await passwordResetService.trigger(email);

        const user = await User.findOne({ email });
        expect(mailer.sendMail).toHaveBeenCalledWith({
          to: email,
          subject: 'SSN Project Portal Password Reset',
          html: passwordResetService.testExports.passwordResetEmailHtml(user),
        });
      });
    });
  });
});
