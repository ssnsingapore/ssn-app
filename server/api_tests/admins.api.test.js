import app from 'app';
import mongoose from 'mongoose';
import request from 'supertest';
import { saveAdmin } from 'util/testHelper';
import { config } from 'config/environment';
import { Admin } from 'models/Admin';


beforeAll(async () => {
  await mongoose.connect(global.mongoUri);
});

afterAll(async () => {
  mongoose.disconnect();
});

describe('Login/Logout', () => {
  describe('POST /admins/login', () => {
    let admin;
    const email = 'admin@email.com';
    const password = 'test123';

    beforeAll(async () => {
      admin = await saveAdmin({ email }, password);
    });

    afterAll(async () => {
      await Admin.deleteMany();
    });


    it('should return an unauthenticated error if the credentials are incorrect', async () => {
      const response = await request(app).post('/api/v1/admins/login')
        .send({ user: { email, password: 'wrong password' } });

      expect(response.status).toEqual(401);
    });

    it('should return a 200 response with csrf token header and jwt cookies', async () => {
      const response = await request(app).post('/api/v1/admins/login')
        .send({ user: { email, password } });

      expect(response.status).toEqual(200);
      expect(response.body.user.id).toEqual(admin.id);
      expect(response.headers['csrf-token']).toBeTruthy();
      expect(response.headers['set-cookie'][0]).toEqual(
        expect.stringContaining('ssn_token')
      );
    });
  });
});

describe('DELETE /admins/logout', () => {
  let jwt;
  const csrfToken = 'csrfToken';

  beforeAll(async () => {
    const admin = await saveAdmin();
    jwt = admin.generateJwt(csrfToken);
  });

  afterAll(async () => {
    await Admin.deleteMany();
  });

  it('should be an authenticated route', async () => {
    const response = await request(app).delete('/api/v1/admins/logout');

    expect(response.status).toEqual(401);
    expect(response.body.errors[0].title).toEqual('Unauthorized');
  });

  it('returns forbidden error when request does not contain CSRF token in header', async () => {
    const response = await request(app).delete('/api/v1/admins/logout')
      .set('Cookie', [`${config.TOKEN_COOKIE_NAME}=${jwt}`]);

    expect(response.status).toEqual(403);
    expect(response.body.errors[0].title).toEqual('Forbidden');
  });

  it('returns a 204 status with a clear cookie header if the user is already logged in', async () => {
    const response = await request(app).delete('/api/v1/admins/logout')
      .set('Cookie', [`${config.TOKEN_COOKIE_NAME}=${jwt}`])
      .set('csrf-token', csrfToken);

    expect(response.status).toEqual(204);
    expect(response.headers['set-cookie'][0]).toEqual(
      expect.stringContaining('ssn_token=;')
    );
  });
});
