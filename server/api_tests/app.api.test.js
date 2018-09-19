import request from 'supertest';
import mongoose from 'mongoose';

import app from 'app';

beforeAll(async () => {
  await mongoose.connect(global.mongoUri);
});

afterAll(async () => {
  mongoose.disconnect();
});

describe('User sign up route', () => {
  test('post request returns status code 201', async () => {
    const user = {
      name: 'username',
      email: 'email@email.com',
      password: 'xxx',
    };

    const response = await request(app).post('/api/v1/users').send({ user });

    expect(response.status).toEqual(201);
    expect(response.body).toEqual({
      user: {
        name: 'username',
        email: 'email@email.com',
        role: 'user',
      },
    });
  });
});
