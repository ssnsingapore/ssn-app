import { s3 } from 'config/aws';
import { config } from 'config/environment';
import { mailer } from 'config/mailer';
import { ProjectOwner } from 'models/ProjectOwner';
import { Role } from 'models/Role';
import mongoose from 'mongoose';
import { UnprocessableEntityErrorView } from 'util/errors';
import { SignUpService } from '../SignUpService';

jest.mock('config/mailer');
jest.mock('config/aws');

beforeAll(async () => {
  await mongoose.connect(global.mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Sign up service', () => {
  let password;
  let signUpService;

  describe('signing up new projectOwner', () => {
    let mockProjectOwner;

    beforeEach(() => {
      mailer.sendMail = jest.fn(() => ({ messageId: 'some id' }));
      s3.upload = jest.fn(() => ({ promise: () => Promise.resolve({ Location: 'some image url' }) }));
      mockProjectOwner = new ProjectOwner({
        name: 'test',
        email: 'test@example.com',
      });
      password = 'password';
      signUpService = new SignUpService(mockProjectOwner, password, Role.PROJECT_OWNER);
    });

    afterEach(async (done) => {
      await ProjectOwner.deleteMany();
      done();
    });

    describe('when there are no errors saving the new projectOwner', () => {
      it('should set the password, save new projectOwner to database and return null if email is unused', async () => {
        const errorsObj = await signUpService.execute();
        const projectOwner = await ProjectOwner.findOne({ name: mockProjectOwner.name });

        expect(errorsObj).toBeNull();
        expect(projectOwner).not.toBeNull();
        expect(projectOwner.hashedPassword).toEqual(expect.any(String));
      });

      it('should send a confirmation email with a confirmation token to the new projectOwner', async () => {
        await signUpService.execute();
        const projectOwner = await ProjectOwner.findOne({ name: mockProjectOwner.name });

        expect(projectOwner.confirmationToken).toEqual(expect.any(String));
        expect(mailer.sendMail).toHaveBeenCalledWith({
          to: mockProjectOwner.email,
          subject: 'SSN Project Portal Sign Up Confirmation',
          html: signUpService.testExports.confirmationEmailHtml(),
        });
      });

      describe('when a profile photo image is not given', () => {
        it('should not make a call to s3', async () => {
          await signUpService.execute();

          expect(s3.upload).not.toHaveBeenCalled();
        });
      });

      describe('when the profile photo image is given', () => {
        let multerFile;

        beforeEach(() => {
          multerFile = { buffer: Buffer.from('some buffer') };
          signUpService = new SignUpService(mockProjectOwner, password, Role.PROJECT_OWNER, multerFile);
        });

        it('should upload the image to s3', async () => {
          await signUpService.execute();
          const projectOwner = await ProjectOwner.findOne({ name: mockProjectOwner.name });

          expect(s3.upload).toHaveBeenCalledWith({
            Body: multerFile.buffer,
            Key: expect.stringContaining(`${projectOwner.id}-${projectOwner.name}`),
            ACL: 'public-read',
            Bucket: `${config.AWS_BUCKET_NAME}/project_owner_profile_photos`,
          });
          expect(projectOwner.profilePhotoUrl).toEqual('some image url');
        });

        it('should not save user if image failed to upload', async () => {
          s3.upload = jest.fn(() => ({
            promise: () => Promise.reject(new Error('some error')),
          }));

          await expect(signUpService.execute()).rejects.toThrow();

          const projectOwner = await ProjectOwner.findOne({ name: mockProjectOwner.name });
          expect(projectOwner).toBeNull();
        });
      });
    });

    describe('when there are errors saving the new projectOwner', () => {
      it('should return errors if new projectOwner email already exists in database and not send confirmation email', async () => {
        const existingUser = new ProjectOwner({
          name: 'existing',
          email: mockProjectOwner.email,
        });
        await existingUser.save();

        const errorsObj = await signUpService.execute();
        const projectOwner = await ProjectOwner.findOne({ name: mockProjectOwner.name });

        expect(errorsObj.errors[0]).toMatchObject(new UnprocessableEntityErrorView(
          'email',
          'email is already associated with another account.',
        ));
        expect(projectOwner).toBeNull();
        expect(mailer.sendMail).not.toHaveBeenCalled();
      });

      it('should throw if there is some other validation error on the projectOwner to be created', async () => {
        mockProjectOwner = new ProjectOwner({
          name: '',
          email: 'test@example.com',
        });
        password = 'password';
        signUpService = new SignUpService(mockProjectOwner, password, Role.PROJECT_OWNER);

        await expect(signUpService.execute()).resolves.toEqual({
          errors: 'ProjectOwner validation failed: name: cannot be blank',
        });
      });
    });

    describe('when there are errors sending confirmation email', () => {
      beforeEach(() => {
        mailer.sendMail = jest.fn(() => Promise.reject(new Error('some error')));
      });

      it('should not save user', async () => {
        await expect(signUpService.execute()).rejects.toThrow();

        const projectOwner = await ProjectOwner.findOne({ name: mockProjectOwner.name });
        expect(projectOwner).toBeNull();
      });
    });
  });
});
