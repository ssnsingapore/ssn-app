import mongoose from 'mongoose';
import { mailer } from 'config/mailer';
import { User } from 'models/User';
import { UnprocessableEntityErrorView } from 'util/errors';
import { SignUpService } from '../SignUpService';

jest.mock('config/mailer');

beforeAll(async () => {
  await mongoose.connect(global.mongoUri);
});

afterAll(async () => {
  mongoose.disconnect();
});

describe('Sign up service', () => {
  let mockUser;
  let password;
  let signUpService;

  beforeEach(() => {
    mailer.sendMail = jest.fn(() => ({ messageId: 'some id' }));
    mockUser = new User({
      name: 'test',
      email: 'test@test.com',
    });
    password = 'password';
    signUpService = new SignUpService(mockUser, password);
  });

  afterEach((done) => {
    User.deleteMany({}).then(() => done());
  });

  describe('signing up new user', () => {
    it('should set the password, save new user to database and return null if email is unused', async () => {
      const errorsObj = await signUpService.execute();
      const user = await User.findOne({ name: mockUser.name });

      expect(errorsObj).toBeNull();
      expect(user).not.toBeNull();
      expect(user.hashedPassword).toEqual(expect.any(String));
    });

    it('should send a confirmation email with a confirmation token to the new user', async () => {
      await signUpService.execute();
      const user = await User.findOne({ name: mockUser.name });

      expect(user.confirmationToken).toEqual(expect.any(String));
      expect(mailer.sendMail).toHaveBeenCalledWith({
        to: mockUser.email,
        subject: 'SSN Project Portal Sign Up Confirmation',
        html: signUpService.testExports.confirmationEmailHtml(),
      });
    });

    it('should return errors if new user email already exists in database and not send confirmation email', async () => {
      const existingUser = new User({
        name: 'existing',
        email: mockUser.email,
      });
      await existingUser.save();

      const errorsObj = await signUpService.execute();
      const user = await User.findOne({ name: mockUser.name });

      expect(errorsObj.errors[0]).toMatchObject(new UnprocessableEntityErrorView(
        'Email is taken',
        'The email address you have entered is already associated with another account',
      ));
      expect(user).toBeNull();
      expect(mailer.sendMail).not.toHaveBeenCalled();
    });
  });
});
