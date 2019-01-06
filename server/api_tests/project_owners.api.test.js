import app from 'app';
import { ProjectOwner } from 'models/ProjectOwner';
import mongoose from 'mongoose';
import request from 'supertest';
import { saveProjectOwner } from 'util/testHelper';
import { config } from 'config/environment';


beforeAll(async () => {
  await mongoose.connect(global.mongoUri);
});

afterAll(async () => {
  mongoose.disconnect();
});

describe('Public routes', () => {
  const emails = [
    'test1@test.com',
    'test2@test.com',
    'test3@test.com',
    'test4@test.com',
    'test5@test.com',
    'test6@test.com',
    'test7@test.com',
    'test8@test.com',
    'test9@test.com',
    'test10@test.com',
    'test11@test.com',
    'test12@test.com',
    'test13@test.com',
    'test14@test.com',
    'test15@test.com',
    'test16@test.com',
    'test17@test.com',
    'test18@test.com',
    'test19@test.com',
    'test20@test.com',
  ];

  describe('GET /project_owners', () => {
    beforeAll(async () => {
      await Promise.all(emails.map(async (email, index) => saveProjectOwner({ email, name: `${String.fromCharCode(index)} project owner` })));
    });

    afterAll(async () => {
      await ProjectOwner.deleteMany();
    });

    it('should fetch the first 20 project owners by default, sorted by name', async () => {
      const response = await request(app).get('/api/v1/project_owners');

      expect(response.status).toEqual(200);
      expect(response.body.projectOwners.length).toEqual(20);
      expect(response.body.projectOwners[0].email).toEqual('test1@test.com');
      expect(response.body.projectOwners[19].email).toEqual('test20@test.com');
    });

    it('should fetch the number of project owners specified by pageSize by the given page', async () => {
      const response = await request(app).get('/api/v1/project_owners?pageSize=5&page=2');

      expect(response.status).toEqual(200);
      expect(response.body.projectOwners.length).toEqual(5);
      expect(response.body.projectOwners[0].email).toEqual('test6@test.com');
      expect(response.body.projectOwners[4].email).toEqual('test10@test.com');
    });
  });

  describe('GET /project_owners/:id', () => {

  });
});

describe('Login/Logout', () => {
  describe('POST /project_owners/login', () => {
    const email = 'projectowner@email.com';
    const password = 'test123';

    describe('when the account is not yet confirmed', () => {
      beforeAll(async () => {
        await saveProjectOwner({ email, confirmedAt: undefined }, password);
      });

      afterAll(async () => {
        await ProjectOwner.deleteMany();
      });

      it('should return a bad request error when the credentials are correct but account is not yet activated', async () => {
        const response = await request(app).post('/api/v1/project_owners/login')
          .send({ user: { email, password } });

        expect(response.status).toEqual(400);
        expect(response.body.errors[0].detail).toEqual('Please activate your account before logging in.');
      });
    });

    describe('when the account is already confirmed', () => {
      let projectOwner;

      beforeAll(async () => {
        projectOwner = await saveProjectOwner({ email }, password);
      });

      afterAll(async () => {
        await ProjectOwner.deleteMany();
      });


      it('should return an unauthenticated error if the credentials are incorrect', async () => {
        const response = await request(app).post('/api/v1/project_owners/login')
          .send({ user: { email, password: 'wrong password' } });

        expect(response.status).toEqual(401);
      });

      it('should return a 200 response with csrf token header and jwt cookies', async () => {
        const response = await request(app).post('/api/v1/project_owners/login')
          .send({ user: { email, password } });

        expect(response.status).toEqual(200);
        expect(response.body.user.id).toEqual(projectOwner.id);
        expect(response.headers['csrf-token']).toBeTruthy();
        expect(response.headers['set-cookie'][0]).toEqual(
          expect.stringContaining('ssn_token')
        );
      });
    });
  });

  describe('DELETE /project_owners/logout', () => {
    let jwt;
    const csrfToken = 'csrfToken';

    beforeAll(async () => {
      const projectOwner = await saveProjectOwner();
      jwt = projectOwner.generateJwt(csrfToken);
    });

    afterAll(async () => {
      await ProjectOwner.deleteMany();
    });

    it('should be an authenticated route', async () => {
      const response = await request(app).delete('/api/v1/project_owners/logout');

      expect(response.status).toEqual(401);
      expect(response.body.errors[0].title).toEqual('Unauthorized');
    });

    it('returns forbidden error when request does not contain CSRF token in header', async () => {
      const response = await request(app).delete('/api/v1/project_owners/logout')
        .set('Cookie', [`${config.TOKEN_COOKIE_NAME}=${jwt}`]);

      expect(response.status).toEqual(403);
      expect(response.body.errors[0].title).toEqual('Forbidden');
    });

    it('returns a 204 status with a clear cookie header if the user is already logged in', async () => {
      const response = await request(app).delete('/api/v1/project_owners/logout')
        .set('Cookie', [`${config.TOKEN_COOKIE_NAME}=${jwt}`])
        .set('csrf-token', csrfToken);

      expect(response.status).toEqual(204);
      expect(response.headers['set-cookie'][0]).toEqual(
        expect.stringContaining('ssn_token=;')
      );
    });
  });
});

describe('Project Owner routes', () => {
  describe('PUT /project_owner/profile', () => {

  });
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
