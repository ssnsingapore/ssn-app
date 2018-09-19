import request from 'supertest';
import mongoose from 'mongoose';

import app from 'app';
import { SignUpService } from 'services/SignUpService';

jest.mock('services/SignUpService');

beforeAll(async () => {
  await mongoose.connect(global.mongoUri);
  SignUpService.mockClear();
});

afterAll(async () => {
  mongoose.disconnect();
});

const mockSignUpServiceReturnsNoErrors = () => {
  SignUpService.mockImplementation(() => ({
    execute: () => {},
  }));
};

describe('User sign up route', () => {
  test('post request returns status code 201', async () => {
    mockSignUpServiceReturnsNoErrors();

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
