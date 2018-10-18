import mongoose from 'mongoose';
import { mailer } from 'config/mailer';
import { BadRequestErrorView } from 'util/errors';
import { config, isProduction } from 'config/environment';
import { ProjectOwner } from 'models/ProjectOwner';
import { PasswordResetService } from '../PasswordResetService';

jest.mock('config/mailer');
jest.mock('config/environment');

beforeAll(async () => {
  await mongoose.connect(global.mongoUri);
  config.MESSAGE_COOKIE_NAME = 'ssn_message';
  config.PASSWORD_RESET_TOKEN_COOKIE_NAME = 'ssn_password_reset_token';
  config.PASSWORD_RESET_EMAIL_COOKIE_NAME = 'ssn_password_reset_email';
  config.PASSWORD_RESET_CSRF_COOKIE_NAME = 'ssn_password_reset_csrf_token';
});

afterAll(async () => {
  mongoose.disconnect();
});

describe('Password reset service', () => {
  let passwordResetService;

  beforeEach(() => {
    passwordResetService = new PasswordResetService(ProjectOwner);
  });

  describe('triggering password reset', () => {
    const email = 'test@test.com';
    const oldHashedPassword = 'oldhashedpassword';
    let mockUser;

    beforeEach(async (done) => {
      mailer.sendMail = jest.fn(() => ({ messageId: 'some id' }));
      mockUser = new ProjectOwner({
        name: 'test',
        email,
        hashedPassword: oldHashedPassword,
      });
      await mockUser.save();
      done();
    });

    afterEach(async (done) => {
      await ProjectOwner.deleteMany({});
      done();
    });

    it('should find user with given email and return an errorsObject if it does not exist', async () => {
      const errorsObj = await passwordResetService.trigger('non.existent@email.com');

      expect(errorsObj.errors[0]).toMatchObject(
        new BadRequestErrorView(
          'The given email couldn\'t be found in our system'
        ),
      );
      expect(mailer.sendMail).not.toHaveBeenCalled();

      const user = await ProjectOwner.findOne({ email });
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

        const user = await ProjectOwner.findOne({ email });
        expect(user.passwordResetToken).toEqual(expect.any(String));
        expect(user.passwordResetExpiresAt).toEqual(expect.any(Date));
        expect(user.hashedPassword).toEqual(expect.any(String));
        expect(user.hashedPassword).not.toEqual(oldHashedPassword);
      });

      it('should send a password reset email with a password reset token to the user', async () => {
        await passwordResetService.trigger(email);

        const user = await ProjectOwner.findOne({ email });
        expect(mailer.sendMail).toHaveBeenCalledWith({
          to: email,
          subject: 'SSN Project Portal Password Reset',
          html: passwordResetService.testExports.passwordResetEmailHtml(user),
        });
      });
    });
  });

  describe('getting password reset redirect url and cookie args', () => {
    let userId;
    const passwordResetToken = 'passwordResetToken';

    beforeEach(async (done) => {
      const user = new ProjectOwner({
        name: 'test',
        email: 'test@test.com',
        passwordResetToken,
        passwordExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      await user.save();
      userId = user.id;
      done();
    });

    afterEach(async (done) => {
      await ProjectOwner.deleteMany({});
      done();
    });

    describe('when the user with the given id cannot be found', () => {
      it('should return url with a message with type error that something was wrong with the reset link', async () => {
        const result = await passwordResetService.getRedirectUrlAndCookieArgs('1'.repeat(24), passwordResetToken);

        expect(result.redirectUrl).toEqual(
          expect.stringContaining(encodeURIComponent('there was something wrong with your password reset link')),
        );
        expect(result.redirectUrl).toEqual(
          expect.stringContaining('login')
        );
      });

      it('should return message cookie args', async () => {
        const result = await passwordResetService.getRedirectUrlAndCookieArgs('1'.repeat(24), passwordResetToken);

        expect(result.cookieArgs).toMatchObject({
          message: [
            config.MESSAGE_COOKIE_NAME,
            config.MESSAGE_COOKIE_NAME,
            {
              secure: isProduction,
              sameSite: true,
              maxAge: 10 * 60 * 1000,
            },
          ],
        });
      });
    });

    describe('when the user with the given id can be found', () => {
      describe('when the user\'s password reset token does not match the one in params', () => {
        it('should return with a message with type error that something was wrong with the reset link', async () => {
          const result = await passwordResetService.getRedirectUrlAndCookieArgs(userId, 'nonsense token');

          expect(result.redirectUrl).toEqual(
            expect.stringContaining(encodeURIComponent('there was something wrong with your password reset link')),
          );
          expect(result.redirectUrl).toEqual(
            expect.stringContaining('login')
          );
        });

        it('should return message cookie args', async () => {
          const result = await passwordResetService.getRedirectUrlAndCookieArgs('1'.repeat(24), passwordResetToken);

          expect(result.cookieArgs).toMatchObject({
            message: [
              config.MESSAGE_COOKIE_NAME,
              config.MESSAGE_COOKIE_NAME,
              {
                secure: isProduction,
                sameSite: true,
                maxAge: 10 * 60 * 1000,
              },
            ],
          });
        });
      });

      describe('when the password reset link has expired', () => {
        beforeEach(async (done) => {
          await ProjectOwner.findByIdAndUpdate(userId, {
            passwordResetExpiresAt: new Date(Date.now() - 60 * 60 * 1000),
          });
          done();
        });

        it('should return with a message with type error that the reset link has expired', async () => {
          const result = await passwordResetService.getRedirectUrlAndCookieArgs(userId, passwordResetToken);

          expect(result.redirectUrl).toEqual(
            expect.stringContaining(encodeURIComponent('your password reset link has already expired')),
          );
          expect(result.redirectUrl).toEqual(
            expect.stringContaining('login')
          );
        });

        it('should return message cookie args', async () => {
          const result = await passwordResetService.getRedirectUrlAndCookieArgs('1'.repeat(24), passwordResetToken);

          expect(result.cookieArgs).toMatchObject({
            message: [
              config.MESSAGE_COOKIE_NAME,
              config.MESSAGE_COOKIE_NAME,
              {
                secure: isProduction,
                sameSite: true,
                maxAge: 10 * 60 * 1000,
              },
            ],
          });
        });
      });

      it('should return with a message with type success when user is found and reset token matches', async () => {
        const result = await passwordResetService.getRedirectUrlAndCookieArgs(userId, passwordResetToken);

        expect(result.redirectUrl).toEqual(
          expect.stringContaining(encodeURIComponent('reset your password')),
        );
        expect(result.redirectUrl).toEqual(
          expect.stringContaining('passwordReset')
        );
      });

      it('should return message, password reset token, email and csrf cookie args', async () => {
        const result = await passwordResetService.getRedirectUrlAndCookieArgs(userId, passwordResetToken);
        const user = await ProjectOwner.findById(userId);
        const baseCookieOptions = {
          secure: isProduction,
          sameSite: true,
          maxAge: 10 * 60 * 1000,
        };

        expect(result.cookieArgs).toMatchObject({
          message: [
            config.MESSAGE_COOKIE_NAME,
            config.MESSAGE_COOKIE_NAME,
            baseCookieOptions,
          ],
          passwordResetToken: [
            config.PASSWORD_RESET_TOKEN_COOKIE_NAME,
            user.passwordResetToken,
            {
              ...baseCookieOptions,
              httpOnly: true,
            },
          ],
          email: [
            config.PASSWORD_RESET_EMAIL_COOKIE_NAME,
            user.email,
            {
              ...baseCookieOptions,
              httpOnly: true,
            },
          ],
          csrf: [
            config.PASSWORD_RESET_CSRF_COOKIE_NAME,
            expect.any(String),
            baseCookieOptions,
          ],
        });
      });
    });
  });

  describe('attempting password reset', () => {
    let userId;
    const email = 'test@test.com';
    const passwordResetToken = 'passwordResetToken';
    const newPassword = 'new password';

    beforeEach(async (done) => {
      const user = new ProjectOwner({
        name: 'test',
        email,
        passwordResetToken,
        passwordExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      await user.save();
      userId = user.id;
      done();
    });

    afterEach(async (done) => {
      await ProjectOwner.deleteMany({});
      done();
    });


    describe('when email or passwordResetToken is undefined', () => {
      it('should return a bad request error when email is undefined', async () => {
        const result = await passwordResetService.attemptPasswordReset(undefined, passwordResetToken, newPassword);
        expect(result.errors[0]).toEqual(
          new BadRequestErrorView('Your password reset session has expired. Please try the password reset link again.')
        );
      });

      it('should return a bad request error when passwordResetToken is undefined', async () => {
        const result = await passwordResetService.attemptPasswordReset(email, undefined, newPassword);
        expect(result.errors[0]).toEqual(
          new BadRequestErrorView('Your password reset session has expired. Please try the password reset link again.')
        );
      });
    });

    describe('when password reset token does not match', () => {
      it('should return a bad request error', async () => {
        const result = await passwordResetService.attemptPasswordReset(email, 'incorrectToken', newPassword);
        expect(result.errors[0]).toEqual(
          new BadRequestErrorView('It seems like there was something wrong resetting your password. Please try again.'),
        );
      });
    });

    describe('when password reset token has expired', () => {
      it('should return a bad request error', async () => {
        await ProjectOwner.findByIdAndUpdate(userId, { passwordResetExpiresAt: new Date(Date.now() - 60) });

        const result = await passwordResetService.attemptPasswordReset(email, passwordResetToken, newPassword);
        expect(result.errors[0]).toEqual(
          new BadRequestErrorView('Your password reset link has expired. Please try to generate a new one.'),
        );
      });
    });

    describe('when password reset token is valid', () => {
      it('should return null for errors', async () => {
        const result = await passwordResetService.attemptPasswordReset(email, passwordResetToken, newPassword);
        expect(result).toBeNull();
      });

      it('should set the user\'s password and clear the passwordReset fields', async () => {
        await passwordResetService.attemptPasswordReset(email, passwordResetToken, newPassword);

        const user = await ProjectOwner.findById(userId);
        expect(user.passwordResetToken).toBeUndefined();
        expect(user.passwordResetExpiresAt).toBeUndefined();
      });
    });
  });

  describe('getting clear cookie args', () => {
    it('should return clear cookie args for email and passwordResetToken cookies', () => {
      const cookieArgs = passwordResetService.getClearCookieArgs();

      const baseCookieOptions = {
        secure: isProduction,
        sameSite: true,
        maxAge: 10 * 60 * 1000,
      };
      expect(cookieArgs.passwordResetToken).toEqual(
        [
          config.PASSWORD_RESET_TOKEN_COOKIE_NAME,
          {
            ...baseCookieOptions,
            httpOnly: true,
          },
        ],
      );
      expect(cookieArgs.email).toEqual(
        [
          config.PASSWORD_RESET_EMAIL_COOKIE_NAME,
          {
            ...baseCookieOptions,
            httpOnly: true,
          },
        ],
      );
    });
  });
});
