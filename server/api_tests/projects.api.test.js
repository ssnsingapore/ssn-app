import request from 'supertest';
import mongoose from 'mongoose';
import app from 'app';

import { config } from 'config/environment';
import { createProjectOwner, createProject } from '../test/testHelper';

beforeAll(async () => {
  await mongoose.connect(global.mongoUri);
});

afterAll(async () => {
  mongoose.disconnect();
});

describe('/project_owner/projects/:id', () => {
  let jwt;
  let csrfToken;
  let project;
  let projectOwner;

  beforeEach(async (done) => {
    projectOwner = createProjectOwner();
    project = createProject(projectOwner);

    csrfToken = 'token';

    await projectOwner.save();
    await project.save();
    jwt = projectOwner.generateJwt(csrfToken);
    done();
  });

  afterEach(async (done) => {
    projectOwner.remove();
    project.remove();
    done();
  });

  test('is an authenticated route', async () => {
    const response = await request(app).put(`/api/v1/project_owner/projects/${project.id}`)
      .send({
        project: {
          title: 'updated name',
        },
      });

    expect(response.status).toEqual(401);
    expect(response.body.errors[0].title).toEqual('Unauthorized');
  });

  test('updates project details', async () => {
    const response = await request(app).put(`/api/v1/project_owner/projects/${project.id}`)
      .set('Cookie', [`${config.TOKEN_COOKIE_NAME}=${jwt}`])
      .set('csrf-token', csrfToken)
      .send({
        project: {
          title: 'updated name',
        },
      });

    expect(response.status).toEqual(200);
    expect(response.body.project).toEqual(
      expect.objectContaining({
        title: 'updated name',
      })
    );
  });
});
