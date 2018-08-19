import request from 'supertest';

import app from '../app';

describe('Root Route', () => {
  test('get request returns status code 200', async () => {
    const response = await request(app).get('/');

    expect(response.status).toEqual(200);
  });
});
