import app from 'app';
import { ProjectOwner } from 'models/ProjectOwner';
import mongoose from 'mongoose';
import request from 'supertest';
import { saveProjectOwner } from 'util/testHelper';


beforeAll(async () => {
  await mongoose.connect(global.mongoUri);
});

afterAll(async () => {
  mongoose.disconnect();
});

describe('Password reset', () => {
  describe('POST /project_owners/password/reset', () => {
    const email = 'test@test.com';

    beforeAll(async (done) => {
      await saveProjectOwner({
        email,
      });
      done();
    });

    afterAll(async (done) => {
      await ProjectOwner.deleteMany();
      done();
    });

    describe('when project owner with the given email does not exist', () => {
      it('it returns a bad request error with a message that the user could not be found', async () => {
        const response = await request(app).post('/api/v1/project_owners/password/reset')
          .send({ email: 'non@existent.com' });

        expect(response.status).toEqual(400);
        expect(response.body.errors[0].detail).toEqual('The given email couldn\'t be found in our system');
      });
    });

    describe('when the project owner with the given email exists', () => {
      it('returns 204 status code', async () => {
        const response = await request(app).post('/api/v1/project_owners/password/reset')
          .send({ email });

        expect(response.status).toEqual(204);
      });
    });
  });

  describe('GET /project_owners/:id/password/reset/:passwordResetToken', () => {
    const email = 'test@test.com';
    let projectOwner;

    beforeAll(async (done) => {
      projectOwner = await saveProjectOwner(email);
      await request(app).post('/api/v1/project_owners/password/reset').send({ email });
      projectOwner = await ProjectOwner.findById(projectOwner.id);
      done();
    });

    afterAll(async (done) => {
      await ProjectOwner.deleteMany();
      done();
    });

    describe('when the reset token is invalid', () => {
      it('should redirect to the login page with an error message', async () => {
        const response = await request(app).get(`/api/v1/project_owners/${projectOwner.id}/password/reset/invalidToken`);

        expect(response.status).toEqual(302);
        expect(response.header['cache-control']).toEqual('private, no-cache, no-store, must-revalidate');
        expect(response.header.location).toEqual(
          expect.stringContaining('/login')
        );
        expect(response.header.location).toEqual(
          expect.stringContaining('type=ERROR')
        );
      });
    });

    describe('when the reset token is valid', () => {
      it('should redirect to the password reset page with a success message and set cookies', async () => {
        const response = await request(app).get(`/api/v1/project_owners/${projectOwner.id}/password/reset/${projectOwner.passwordResetToken}`);

        expect(response.status).toEqual(302);
        expect(response.header['cache-control']).toEqual('private, no-cache, no-store, must-revalidate');
        expect(response.header.location).toEqual(
          expect.stringContaining('/passwordReset')
        );
        expect(response.header.location).toEqual(
          expect.stringContaining('type=SUCCESS')
        );
        expect(response.header['set-cookie'][0]).toEqual(
          expect.stringContaining(`ssn_password_reset_email=${encodeURIComponent(email)}`),
        );
        expect(response.header['set-cookie'][0]).toEqual(
          expect.stringContaining(`ssn_password_reset_token=${encodeURIComponent(projectOwner.passwordResetToken)}`),
        );
        expect(response.header['set-cookie'][0]).toEqual(
          expect.stringContaining('ssn_password_reset_csrf_token='),
        );
        expect(response.header['set-cookie'][0]).toEqual(
          expect.stringContaining('ssn_message=ssn_message'),
        );
      });
    });
  });

  describe('PUT /project_owners/password/reset', () => {
    const email = 'test@test.com';
    let projectOwner;

    beforeAll(async (done) => {
      projectOwner = await saveProjectOwner({ email });
      await request(app).post('/api/v1/project_owners/password/reset').send({ email });
      projectOwner = await ProjectOwner.findById(projectOwner.id);
      done();
    });

    afterAll(async (done) => {
      await ProjectOwner.deleteMany();
      done();
    });

    describe('when there is no csrf token', () => {
      it('returns a 403 response', async () => {
        const response = await request(app)
          .put('/api/v1/project_owners/password/reset');

        expect(response.status).toEqual(403);
      });
    });

    describe('when there is no email or reset token in request cookies', () => {
      it('returns 400 with message that password reset session has expired', async () => {
        const response = await request(app)
          .put('/api/v1/project_owners/password/reset')
          .set('csrf-token', 'sometoken')
          .send({ password: 'newpassword' });

        expect(response.status).toEqual(400);
        expect(response.body.errors[0].detail).toEqual(
          expect.stringContaining('session has expired.')
        );
      });
    });

    describe('when the reset token is invalid', () => {
      it('returns 400 with message that something went wrong with the reset', async () => {
        const response = await request(app)
          .put('/api/v1/project_owners/password/reset')
          .set('csrf-token', 'sometoken')
          .set('Cookie', `ssn_password_reset_email=${email};ssn_password_reset_token=badToken`)
          .send({ password: 'newpassword' });

        expect(response.status).toEqual(400);
        expect(response.body.errors[0].detail).toEqual(
          expect.stringContaining('something wrong')
        );
      });
    });

    describe('when the reset token is valid', () => {
      it('returns 204 with headers to clear cookies', async () => {
        const response = await request(app)
          .put('/api/v1/project_owners/password/reset')
          .set('csrf-token', 'sometoken')
          .set('Cookie', `ssn_password_reset_email=${email};ssn_password_reset_token=${projectOwner.passwordResetToken}`)
          .send({ password: 'newpassword' });

        expect(response.status).toEqual(204);
        expect(response.headers['set-cookie'][0]).toEqual(
          expect.stringContaining('ssn_password_reset_email=;')
        );
        expect(response.headers['set-cookie'][0]).toEqual(
          expect.stringContaining('ssn_password_reset_token=;')
        );
      });
    });
  });
});