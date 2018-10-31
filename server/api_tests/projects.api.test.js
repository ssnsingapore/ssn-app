import request from 'supertest';
import mongoose from 'mongoose';
import app from 'app';

import { config } from 'config/environment';
import { Project, ProjectState } from 'models/Project';
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

  const setProjectState = (state) => {
    project.set({
      state,
    });

    return project.save();
  };

  const sendRequestWithBody = body => request(app)
    .put(`/api/v1/project_owner/projects/${project.id}`)
    .set('Cookie', [`${config.TOKEN_COOKIE_NAME}=${jwt}`])
    .set('csrf-token', csrfToken)
    .send(body);

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
    await projectOwner.remove();
    await project.remove();
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

  test('returns 200 status code and updates project details', async () => {
    const newTitle = 'updated name';

    const response = await sendRequestWithBody({
      project: {
        title: newTitle,
      },
    });

    expect(response.status).toEqual(200);
    expect(response.body.project).toEqual(
      expect.objectContaining({
        title: newTitle,
      })
    );

    const projectFromDB = await Project.findById(project.id);
    expect(projectFromDB.title).toEqual(newTitle);
  });

  describe('state change for pending approval project', () => {
    beforeEach(async () => {
      await setProjectState(ProjectState.PENDING_APPROVAL);
    });

    test('returns 422 status code for change to active', async () => {
      const response = await sendRequestWithBody({
        project: {
          state: ProjectState.APPROVED_ACTIVE,
        },
      });

      expect(response.status).toEqual(422);
      expect(response.body.errors[0].title).toEqual('Invalid state change.');
      expect(response.body.errors[0].detail).toEqual('This change is not allowed.');
    });

    test('returns 422 status code for change to inactive', async () => {
      const response = await sendRequestWithBody({
        project: {
          state: ProjectState.APPROVED_INACTIVE,
        },
      });

      expect(response.status).toEqual(422);
      expect(response.body.errors[0].title).toEqual('Invalid state change.');
      expect(response.body.errors[0].detail).toEqual('This change is not allowed.');
    });

    test('returns 422 status code for change to rejected', async () => {
      const response = await sendRequestWithBody({
        project: {
          state: ProjectState.REJECTED,
        },
      });

      expect(response.status).toEqual(422);
      expect(response.body.errors[0].title).toEqual('Invalid state change.');
      expect(response.body.errors[0].detail).toEqual('This change is not allowed.');
    });
  });

  describe('state change for active project', () => {
    beforeEach(async () => {
      await setProjectState(ProjectState.APPROVED_ACTIVE);
    });

    test('returns 200 status code and updates project state to inactive', async () => {
      const response = await sendRequestWithBody({
        project: {
          state: ProjectState.APPROVED_INACTIVE,
        },
      });

      expect(response.status).toEqual(200);
      expect(response.body.project).toEqual(
        expect.objectContaining({
          state: ProjectState.APPROVED_INACTIVE,
        })
      );

      const projectFromDB = await Project.findById(project.id);
      expect(projectFromDB.state).toEqual(ProjectState.APPROVED_INACTIVE);
    });

    test('returns 422 status code for change to pending approval', async () => {
      const response = await sendRequestWithBody({
        project: {
          state: ProjectState.PENDING_APPROVAL,
        },
      });

      expect(response.status).toEqual(422);
      expect(response.body.errors[0].title).toEqual('Invalid state change.');
      expect(response.body.errors[0].detail).toEqual('This change is not allowed.');
    });

    test('returns 422 status code for change to rejected', async () => {
      const response = await sendRequestWithBody({
        project: {
          state: ProjectState.REJECTED,
        },
      });

      expect(response.status).toEqual(422);
      expect(response.body.errors[0].title).toEqual('Invalid state change.');
      expect(response.body.errors[0].detail).toEqual('This change is not allowed.');
    });
  });

  describe('state change for inactive project', () => {
    beforeEach(async () => {
      await setProjectState(ProjectState.APPROVED_INACTIVE);
    });

    test('updates project state from inactive to active', async () => {
      const response = await sendRequestWithBody({
        project: {
          state: ProjectState.APPROVED_ACTIVE,
        },
      });

      expect(response.status).toEqual(200);
      expect(response.body.project).toEqual(
        expect.objectContaining({
          state: ProjectState.APPROVED_ACTIVE,
        })
      );

      const projectFromDB = await Project.findById(project.id);
      expect(projectFromDB.state).toEqual(ProjectState.APPROVED_ACTIVE);
    });

    test('returns 422 status code for change to pending approval', async () => {
      const response = await sendRequestWithBody({
        project: {
          state: ProjectState.PENDING_APPROVAL,
        },
      });

      expect(response.status).toEqual(422);
      expect(response.body.errors[0].title).toEqual('Invalid state change.');
      expect(response.body.errors[0].detail).toEqual('This change is not allowed.');
    });

    test('returns 422 status code for change to rejected', async () => {
      const response = await sendRequestWithBody({
        project: {
          state: ProjectState.REJECTED,
        },
      });

      expect(response.status).toEqual(422);
      expect(response.body.errors[0].title).toEqual('Invalid state change.');
      expect(response.body.errors[0].detail).toEqual('This change is not allowed.');
    });
  });

  describe('state change for rejected project', () => {
    beforeEach(async () => {
      await setProjectState(ProjectState.REJECTED);
    });

    test('returns 200 status code for change to pending approval', async () => {
      const response = await sendRequestWithBody({
        project: {
          state: ProjectState.PENDING_APPROVAL,
        },
      });

      expect(response.status).toEqual(200);
      expect(response.body.project).toEqual(
        expect.objectContaining({
          state: ProjectState.PENDING_APPROVAL,
        })
      );

      const projectFromDB = await Project.findById(project.id);
      expect(projectFromDB.state).toEqual(ProjectState.PENDING_APPROVAL);
    });

    test('returns 422 status code for change to active', async () => {
      const response = await sendRequestWithBody({
        project: {
          state: ProjectState.APPROVED_ACTIVE,
        },
      });

      expect(response.status).toEqual(422);
      expect(response.body.errors[0].title).toEqual('Invalid state change.');
      expect(response.body.errors[0].detail).toEqual('This change is not allowed.');
    });

    test('returns 422 status code for change to inactive', async () => {
      const response = await sendRequestWithBody({
        project: {
          state: ProjectState.APPROVED_INACTIVE,
        },
      });

      expect(response.status).toEqual(422);
      expect(response.body.errors[0].title).toEqual('Invalid state change.');
      expect(response.body.errors[0].detail).toEqual('This change is not allowed.');
    });

    test('returns 422 status code for change to rejected', async () => {
      const response = await sendRequestWithBody({
        project: {
          state: ProjectState.REJECTED,
        },
      });

      expect(response.status).toEqual(422);
      expect(response.body.errors[0].title).toEqual('Invalid state change.');
      expect(response.body.errors[0].detail).toEqual('This change is not allowed.');
    });
  });
});
