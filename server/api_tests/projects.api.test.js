import request from 'supertest';
import mongoose from 'mongoose';
import app from 'app';
import moment from 'moment';

import { config } from 'config/environment';
import {
  Project, ProjectState, ProjectFrequency, ProjectType, IssueAddressed, VolunteerRequirementType, ProjectRegion,
} from 'models/Project';
import { ProjectOwner } from 'models/ProjectOwner';
import {
  createProjectOwner, createProject, saveProjectOwner, saveProject, constructQueryString,
} from 'util/testHelper';

beforeAll(async () => {
  await mongoose.connect(global.mongoUri);
});

afterAll(async () => {
  mongoose.disconnect();
});

describe('Public routes', () => {
  describe('GET /projects', () => {
    describe('filtering', () => {
      describe('filtering by projectState', () => {
        beforeAll(async (done) => {
          const projectOwner = await saveProjectOwner();
          const olderProjectAttributes = {
            title: 'Created earlier',
          };
          const newerProjectAttributes = {
            title: 'Created later',
          };
          const earlierUpdatedProjectAttributes = {
            title: 'Updated earlier',
          };
          const laterUpdatedProjectAttributes = {
            title: 'Updated later',
          };
          await saveProject(projectOwner, { state: ProjectState.PENDING_APPROVAL, ...olderProjectAttributes });
          await saveProject(projectOwner, { state: ProjectState.PENDING_APPROVAL, ...newerProjectAttributes });
          await saveProject(projectOwner, { state: ProjectState.APPROVED_ACTIVE, ...earlierUpdatedProjectAttributes });
          await saveProject(projectOwner, { state: ProjectState.APPROVED_ACTIVE, ...laterUpdatedProjectAttributes });
          await saveProject(projectOwner, { state: ProjectState.APPROVED_INACTIVE, ...earlierUpdatedProjectAttributes });
          await saveProject(projectOwner, { state: ProjectState.APPROVED_INACTIVE, ...laterUpdatedProjectAttributes });
          await saveProject(projectOwner, { state: ProjectState.REJECTED, ...earlierUpdatedProjectAttributes });
          await saveProject(projectOwner, { state: ProjectState.REJECTED, ...laterUpdatedProjectAttributes });
          done();
        });

        afterAll(async () => {
          await ProjectOwner.deleteMany();
          await Project.deleteMany();
        });

        describe('when projectState is not specified', () => {
          it('returns 200 status code and APPROVED_ACTIVE projects sorted by updatedAt descending', async () => {
            const response = await request(app).get('/api/v1/projects');

            expect(response.status).toEqual(200);
            expect(response.body.projects.length).toEqual(2);
            expect(response.body.projects[0].state).toEqual(ProjectState.APPROVED_ACTIVE);
            expect(response.body.projects[0].title).toEqual('Updated later');
            expect(response.body.projects[1].state).toEqual(ProjectState.APPROVED_ACTIVE);
            expect(response.body.projects[1].title).toEqual('Updated earlier');
          });

          it('returns as many projects as the pageSize', async () => {
            const response = await request(app).get('/api/v1/projects?pageSize=1');

            expect(response.body.projects.length).toEqual(1);
          });
        });

        describe('when project state is PENDING_APPROVAL', () => {
          it('returns 200 status code and PENDING_APPROVAL projects sorted by createdAt ascending', async () => {
            const response = await request(app).get('/api/v1/projects?projectState=PENDING_APPROVAL');

            expect(response.status).toEqual(200);
            expect(response.body.projects.length).toEqual(2);
            expect(response.body.projects[0].state).toEqual(ProjectState.PENDING_APPROVAL);
            expect(response.body.projects[0].title).toEqual('Created earlier');
            expect(response.body.projects[1].state).toEqual(ProjectState.PENDING_APPROVAL);
            expect(response.body.projects[1].title).toEqual('Created later');
          });
        });

        describe('when project state is APPROVED_INACTIVE', () => {
          it('returns 200 status code and APPROVED_INACTIVE projects sorted by updatedAt descending', async () => {
            const response = await request(app).get('/api/v1/projects?projectState=APPROVED_INACTIVE');

            expect(response.status).toEqual(200);
            expect(response.body.projects.length).toEqual(2);
            expect(response.body.projects[0].state).toEqual(ProjectState.APPROVED_INACTIVE);
            expect(response.body.projects[0].title).toEqual('Updated later');
            expect(response.body.projects[1].state).toEqual(ProjectState.APPROVED_INACTIVE);
            expect(response.body.projects[1].title).toEqual('Updated earlier');
          });
        });

        describe('when project state is REJECTED', () => {
          it('returns 200 status code and REJECTED projects sorted by updatedAt descending', async () => {
            const response = await request(app).get('/api/v1/projects?projectState=REJECTED');

            expect(response.status).toEqual(200);
            expect(response.body.projects.length).toEqual(2);
            expect(response.body.projects[0].state).toEqual(ProjectState.REJECTED);
            expect(response.body.projects[0].title).toEqual('Updated later');
            expect(response.body.projects[1].state).toEqual(ProjectState.REJECTED);
            expect(response.body.projects[1].title).toEqual('Updated earlier');
          });
        });
      });

      describe('filtering by issue addressed', () => {
        beforeAll(async () => {
          const projectOwner = await saveProjectOwner();
          await saveProject(
            projectOwner,
            {
              state: ProjectState.APPROVED_ACTIVE,
              issuesAddressed: [
                IssueAddressed.AIR_QUALITY, IssueAddressed.CONSERVATION,
              ],
              title: 'Air Quality, Conservation 1',
            }
          );
          await saveProject(
            projectOwner,
            {
              state: ProjectState.APPROVED_ACTIVE,
              issuesAddressed: [
                IssueAddressed.CLIMATE, IssueAddressed.CONSERVATION,
              ],
              title: 'Climate, Conservation 2',
            }
          );
          await saveProject(
            projectOwner,
            {
              state: ProjectState.APPROVED_ACTIVE,
              issuesAddressed: [
                IssueAddressed.CLIMATE, IssueAddressed.ENERGY,
              ],
              title: 'Climate, Energy 3',
            }
          );
        });

        afterAll(async () => {
          await ProjectOwner.deleteMany();
          await Project.deleteMany();
        });

        it('returns 200 status code and projects which have that issue in issuesAddressed', async () => {
          let response = await request(app).get('/api/v1/projects?issueAddressed=CONSERVATION');

          expect(response.status).toEqual(200);
          expect(response.body.projects.length).toEqual(2);
          expect(response.body.projects[0].title).toEqual('Climate, Conservation 2');
          expect(response.body.projects[1].title).toEqual('Air Quality, Conservation 1');

          response = await request(app).get('/api/v1/projects?issueAddressed=CLIMATE');

          expect(response.status).toEqual(200);
          expect(response.body.projects.length).toEqual(2);
          expect(response.body.projects[0].title).toEqual('Climate, Energy 3');
          expect(response.body.projects[1].title).toEqual('Climate, Conservation 2');
        });
      });

      describe('filtering by month', () => {
        beforeAll(async () => {
          const projectOwner = await saveProjectOwner();
          await saveProject(
            projectOwner,
            {
              state: ProjectState.APPROVED_ACTIVE,
              projectType: ProjectType.EVENT,
              startDate: moment('2018-12-12').toDate(),
              endDate: moment('2018-12-12').toDate(),
              title: 'December Event',
            }
          );
          await saveProject(
            projectOwner,
            {
              state: ProjectState.APPROVED_ACTIVE,
              projectType: ProjectType.EVENT,
              startDate: moment('2018-11-12').toDate(),
              endDate: moment('2018-11-12').toDate(),
              title: 'November Event',
            }
          );
          await saveProject(
            projectOwner,
            {
              state: ProjectState.APPROVED_ACTIVE,
              projectType: ProjectType.RECURRING,
              frequency: ProjectFrequency.EVERY_DAY,
              title: 'Recurring under a month',
            }
          );
          await saveProject(
            projectOwner,
            {
              state: ProjectState.APPROVED_ACTIVE,
              projectType: ProjectType.RECURRING,
              frequency: ProjectFrequency.ONCE_A_YEAR,
              title: 'Recurring above a month',
            }
          );
        });

        afterAll(async () => {
          await ProjectOwner.deleteMany();
          await Project.deleteMany();
        });

        it('returns 200 status code and projects of type event which occur in that month or of type recurring that recur with a frequency less than a month', async () => {
          let response = await request(app).get('/api/v1/projects?month=DECEMBER');

          expect(response.status).toEqual(200);
          expect(response.body.projects.length).toEqual(2);
          expect(response.body.projects[0].title).toEqual('Recurring under a month');
          expect(response.body.projects[1].title).toEqual('December Event');

          response = await request(app).get('/api/v1/projects?month=NOVEMBER');

          expect(response.status).toEqual(200);
          expect(response.body.projects.length).toEqual(2);
          expect(response.body.projects[0].title).toEqual('Recurring under a month');
          expect(response.body.projects[1].title).toEqual('November Event');
        });
      });

      describe('filtering by volunteer requirement type', () => {
        beforeAll(async () => {
          const projectOwner = await saveProjectOwner();
          const interactionRequirement = {
            type: VolunteerRequirementType.INTERACTION,
            commitmentLevel: 'Once a week',
            number: 5,
          };
          const contentCreationRequirement = {
            type: VolunteerRequirementType.CONTENT_CREATION,
            commitmentLevel: 'Once a week',
            number: 5,
          };
          const eventPlanningRequirement = {
            type: VolunteerRequirementType.EVENT_PLANNING,
            commitmentLevel: 'Once a week',
            number: 5,
          };
          await saveProject(
            projectOwner,
            {
              state: ProjectState.APPROVED_ACTIVE,
              volunteerRequirements: [
                interactionRequirement,
                contentCreationRequirement,
              ],
              title: 'Interaction, Content Creation',
            }
          );
          await saveProject(
            projectOwner,
            {
              state: ProjectState.APPROVED_ACTIVE,
              volunteerRequirements: [
                contentCreationRequirement,
                eventPlanningRequirement,
              ],
              title: 'Content Creation, Event Planning',
            }
          );
          await saveProject(
            projectOwner,
            {
              state: ProjectState.APPROVED_ACTIVE,
              volunteerRequirements: [
                eventPlanningRequirement,
                interactionRequirement,
              ],
              title: 'Event Planning, Interaction',
            }
          );
        });

        afterAll(async () => {
          await ProjectOwner.deleteMany();
          await Project.deleteMany();
        });

        it('returns 200 status code and projects which have that volunteer requirement type', async () => {
          let response = await request(app).get('/api/v1/projects?volunteerRequirementType=INTERACTION');

          expect(response.status).toEqual(200);
          expect(response.body.projects.length).toEqual(2);
          expect(response.body.projects[0].title).toEqual('Event Planning, Interaction');
          expect(response.body.projects[1].title).toEqual('Interaction, Content Creation');

          response = await request(app).get('/api/v1/projects?volunteerRequirementType=CONTENT_CREATION');

          expect(response.status).toEqual(200);
          expect(response.body.projects.length).toEqual(2);
          expect(response.body.projects[0].title).toEqual('Content Creation, Event Planning');
          expect(response.body.projects[1].title).toEqual('Interaction, Content Creation');
        });
      });

      describe('filtering by region', () => {
        beforeAll(async () => {
          const projectOwner = await saveProjectOwner();
          await saveProject(
            projectOwner,
            {
              state: ProjectState.APPROVED_ACTIVE,
              region: ProjectRegion.NORTH,
              title: 'North',
            }
          );
          await saveProject(
            projectOwner,
            {
              state: ProjectState.APPROVED_ACTIVE,
              region: ProjectRegion.SOUTH,
              title: 'South',
            }
          );
        });

        afterAll(async () => {
          await ProjectOwner.deleteMany();
          await Project.deleteMany();
        });


        it('returns 200 status code and projects occuring in that region', async () => {
          let response = await request(app).get('/api/v1/projects?projectRegion=NORTH');

          expect(response.status).toEqual(200);
          expect(response.body.projects.length).toEqual(1);
          expect(response.body.projects[0].title).toEqual('North');

          response = await request(app).get('/api/v1/projects?projectRegion=SOUTH');

          expect(response.status).toEqual(200);
          expect(response.body.projects.length).toEqual(1);
          expect(response.body.projects[0].title).toEqual('South');
        });
      });

      describe('filtering by multiple criteria', () => {
        beforeAll(async () => {
          const projectOwner = await saveProjectOwner();
          await saveProject(
            projectOwner,
            {
              state: ProjectState.APPROVED_ACTIVE,
              issuesAddressed: [IssueAddressed.AIR_QUALITY],
              projectType: ProjectType.RECURRING,
              frequency: ProjectFrequency.EVERY_DAY,
              volunteerRequirements: [
                {
                  type: VolunteerRequirementType.INTERACTION,
                  commitmentLevel: 'some level',
                  number: 1,
                },
              ],
              region: ProjectRegion.NORTH,
              title: 'Returned',
            }
          );
          await saveProject(
            projectOwner,
            {
              state: ProjectState.APPROVED_ACTIVE,
              region: ProjectRegion.NORTH,
              title: 'Not returned',
            }
          );
        });

        afterAll(async () => {
          await ProjectOwner.deleteMany();
          await Project.deleteMany();
        });

        it('returns 200 status code and projects which satisfy criteria', async () => {
          const response = await request(app).get('/api/v1/projects?issueAddressed=AIR_QUALITY&month=JANUARY&volunteerRequirementType=INTERACTION&projectRegion=NORTH');

          expect(response.status).toEqual(200);
          expect(response.body.projects.length).toEqual(1);
          expect(response.body.projects[0].title).toEqual('Returned');
        });
      });
    });

    describe('pagination', () => {

    });
  });

  describe('GET /project_counts', () => {
    describe('no filter', () => {
      beforeAll(async () => {
        const projectOwner = await saveProjectOwner();
        await saveProject(projectOwner, { state: ProjectState.PENDING_APPROVAL });
        await saveProject(projectOwner, { state: ProjectState.APPROVED_ACTIVE });
        await saveProject(projectOwner, { state: ProjectState.APPROVED_ACTIVE });
        await saveProject(projectOwner, { state: ProjectState.APPROVED_INACTIVE });
        await saveProject(projectOwner, { state: ProjectState.APPROVED_INACTIVE });
        await saveProject(projectOwner, { state: ProjectState.APPROVED_INACTIVE });
        await saveProject(projectOwner, { state: ProjectState.REJECTED });
        await saveProject(projectOwner, { state: ProjectState.REJECTED });
        await saveProject(projectOwner, { state: ProjectState.REJECTED });
        await saveProject(projectOwner, { state: ProjectState.REJECTED });
      });

      afterAll(async () => {
        await ProjectOwner.deleteMany();
        await Project.deleteMany();
      });

      it('returns 200 status code and an object of counts of projects in each state', async () => {
        const response = await request(app).get('/api/v1/project_counts');

        expect(response.status).toEqual(200);
        expect(response.body.counts).toEqual({
          [ProjectState.PENDING_APPROVAL]: 1,
          [ProjectState.APPROVED_ACTIVE]: 2,
          [ProjectState.APPROVED_INACTIVE]: 3,
          [ProjectState.REJECTED]: 4,
        });
      });
    });

    describe('filtering by issueAddressed', () => {
      beforeAll(async () => {
        const projectOwner = await saveProjectOwner();
        await saveProject(projectOwner, {
          state: ProjectState.PENDING_APPROVAL,
          issuesAddressed: [IssueAddressed.AIR_QUALITY, IssueAddressed.CONSERVATION],
        });
        await saveProject(projectOwner, {
          state: ProjectState.APPROVED_ACTIVE,
          issuesAddressed: [IssueAddressed.AIR_QUALITY],
        });
        await saveProject(projectOwner, {
          state: ProjectState.APPROVED_ACTIVE,
          issuesAddressed: [IssueAddressed.CONSERVATION],
        });
        await saveProject(projectOwner, {
          state: ProjectState.APPROVED_INACTIVE,
          issuesAddressed: [IssueAddressed.CONSERVATION],
        });
        await saveProject(projectOwner, {
          state: ProjectState.REJECTED,
          issuesAddressed: [IssueAddressed.AIR_QUALITY, IssueAddressed.CONSERVATION],
        });
        await saveProject(projectOwner, {
          state: ProjectState.REJECTED,
          issuesAddressed: [IssueAddressed.AIR_QUALITY],
        });
      });

      afterAll(async () => {
        await ProjectOwner.deleteMany();
        await Project.deleteMany();
      });

      it('returns 200 status code and count of projects which have that issue in issuesAddressed', async () => {
        const response = await request(app).get('/api/v1/project_counts?issueAddressed=AIR_QUALITY');

        expect(response.status).toEqual(200);
        expect(response.body.counts).toEqual({
          PENDING_APPROVAL: 1,
          APPROVED_ACTIVE: 1,
          APPROVED_INACTIVE: 0,
          REJECTED: 2,
        });
      });
    });

    describe('filtering by month', () => {
      beforeAll(async () => {
        const projectOwner = await saveProjectOwner();
        await saveProject(projectOwner, {
          state: ProjectState.PENDING_APPROVAL,
          projectType: ProjectType.EVENT,
          startDate: moment('2018-12-12').toDate(),
          endDate: moment('2018-12-12').toDate(),
        });
        await saveProject(projectOwner, {
          state: ProjectState.APPROVED_ACTIVE,
          projectType: ProjectType.EVENT,
          startDate: moment('2018-12-12').toDate(),
          endDate: moment('2018-12-12').toDate(),
        });
        await saveProject(projectOwner, {
          state: ProjectState.APPROVED_ACTIVE,
          projectType: ProjectType.RECURRING,
          frequency: ProjectFrequency.ONCE_A_YEAR,
        });
        await saveProject(projectOwner, {
          state: ProjectState.APPROVED_INACTIVE,
          projectType: ProjectType.EVENT,
          startDate: moment('2018-10-12').toDate(),
          endDate: moment('2018-10-12').toDate(),
        });
        await saveProject(projectOwner, {
          state: ProjectState.REJECTED,
          projectType: ProjectType.RECURRING,
          frequency: ProjectFrequency.EVERY_DAY,
        });
        await saveProject(projectOwner, {
          state: ProjectState.REJECTED,
          projectType: ProjectType.EVENT,
          startDate: moment('2018-12-12').toDate(),
          endDate: moment('2018-12-12').toDate(),
        });
      });

      afterAll(async () => {
        await ProjectOwner.deleteMany();
        await Project.deleteMany();
      });

      it('returns 200 status code and count of projects of type event which occur in that month or of type recurring that recur with a frequency less than a month', async () => {
        const response = await request(app).get('/api/v1/project_counts?month=DECEMBER');

        expect(response.status).toEqual(200);
        expect(response.body.counts).toEqual({
          PENDING_APPROVAL: 1,
          APPROVED_ACTIVE: 1,
          APPROVED_INACTIVE: 0,
          REJECTED: 2,
        });
      });
    });

    describe('filtering by volunteer requirement type', () => {
      beforeAll(async () => {
        const projectOwner = await saveProjectOwner();
        await saveProject(projectOwner, {
          state: ProjectState.PENDING_APPROVAL,
          volunteerRequirements: [
            {
              type: VolunteerRequirementType.INTERACTION,
              commitmentLevel: 'any',
              number: 5,
            },
          ],
        });
        await saveProject(projectOwner, {
          state: ProjectState.APPROVED_ACTIVE,
          volunteerRequirements: [
            {
              type: VolunteerRequirementType.INTERACTION,
              commitmentLevel: 'any',
              number: 5,
            },
          ],
        });
        await saveProject(projectOwner, {
          state: ProjectState.APPROVED_ACTIVE,
          volunteerRequirements: [],
        });
        await saveProject(projectOwner, {
          state: ProjectState.APPROVED_INACTIVE,
          volunteerRequirements: [
            {
              type: VolunteerRequirementType.CONTENT_CREATION,
              commitmentLevel: 'any',
              number: 5,
            },
          ],
        });
        await saveProject(projectOwner, {
          state: ProjectState.REJECTED,
          volunteerRequirements: [
            {
              type: VolunteerRequirementType.INTERACTION,
              commitmentLevel: 'any',
              number: 5,
            },
          ],
        });
        await saveProject(projectOwner, {
          state: ProjectState.REJECTED,
          projectType: ProjectType.EVENT,
          volunteerRequirements: [{
            type: VolunteerRequirementType.INTERACTION,
            commitmentLevel: 'any',
            number: 5,
          }],
        });
      });

      afterAll(async () => {
        await ProjectOwner.deleteMany();
        await Project.deleteMany();
      });


      it('returns 200 status code and count of projects which have that volunteer requirement type', async () => {
        const response = await request(app).get('/api/v1/project_counts?volunteerRequirementType=INTERACTION');

        expect(response.status).toEqual(200);
        expect(response.body.counts).toEqual({
          PENDING_APPROVAL: 1,
          APPROVED_ACTIVE: 1,
          APPROVED_INACTIVE: 0,
          REJECTED: 2,
        });
      });
    });

    describe('filtering by region', () => {
      beforeAll(async () => {
        const projectOwner = await saveProjectOwner();
        await saveProject(projectOwner, {
          state: ProjectState.PENDING_APPROVAL,
          region: ProjectRegion.NORTH,
        });
        await saveProject(projectOwner, {
          state: ProjectState.APPROVED_ACTIVE,
          region: ProjectRegion.NORTH,
        });
        await saveProject(projectOwner, {
          state: ProjectState.APPROVED_ACTIVE,
          region: ProjectRegion.SOUTH,
        });
        await saveProject(projectOwner, {
          state: ProjectState.APPROVED_INACTIVE,
          region: ProjectRegion.SOUTH,
        });
        await saveProject(projectOwner, {
          state: ProjectState.REJECTED,
          region: ProjectRegion.NORTH,
        });
        await saveProject(projectOwner, {
          state: ProjectState.REJECTED,
          region: ProjectRegion.NORTH,
        });
      });

      afterAll(async () => {
        await ProjectOwner.deleteMany();
        await Project.deleteMany();
      });

      it('returns 200 status code and count of projects occuring in that region', async () => {
        const response = await request(app).get('/api/v1/project_counts?projectRegion=NORTH');

        expect(response.status).toEqual(200);
        expect(response.body.counts).toEqual({
          PENDING_APPROVAL: 1,
          APPROVED_ACTIVE: 1,
          APPROVED_INACTIVE: 0,
          REJECTED: 2,
        });
      });
    });

    describe('filtering by multiple criteria', () => {
      beforeAll(async () => {
        const projectOwner = await saveProjectOwner();
        await saveProject(projectOwner, {
          state: ProjectState.PENDING_APPROVAL,
          region: ProjectRegion.NORTH,
          issuesAddressed: [IssueAddressed.AIR_QUALITY],
        });
        await saveProject(projectOwner, {
          state: ProjectState.APPROVED_ACTIVE,
          region: ProjectRegion.NORTH,
          issuesAddressed: [IssueAddressed.AIR_QUALITY],
        });
        await saveProject(projectOwner, {
          state: ProjectState.APPROVED_ACTIVE,
          region: ProjectRegion.SOUTH,
          issuesAddressed: [IssueAddressed.CONSERVATION],
        });
        await saveProject(projectOwner, {
          state: ProjectState.APPROVED_INACTIVE,
          region: ProjectRegion.SOUTH,
          issuesAddressed: [IssueAddressed.OTHER],
        });
        await saveProject(projectOwner, {
          state: ProjectState.REJECTED,
          region: ProjectRegion.NORTH,
          issuesAddressed: [IssueAddressed.AIR_QUALITY],
        });
        await saveProject(projectOwner, {
          state: ProjectState.REJECTED,
          region: ProjectRegion.NORTH,
          issuesAddressed: [IssueAddressed.AIR_QUALITY],
        });
      });

      afterAll(async () => {
        await ProjectOwner.deleteMany();
        await Project.deleteMany();
      });

      it('returns 200 status code and count of projects occuring in that region', async () => {
        const response = await request(app).get('/api/v1/project_counts?projectRegion=NORTH&issueAddressed=AIR_QUALITY');

        expect(response.status).toEqual(200);
        expect(response.body.counts).toEqual({
          PENDING_APPROVAL: 1,
          APPROVED_ACTIVE: 1,
          APPROVED_INACTIVE: 0,
          REJECTED: 2,
        });
      });
    });
  });

  describe('GET /projects/:id', () => {
    let project;
    beforeAll(async (done) => {
      const projectOwner = await saveProjectOwner();
      project = await saveProject(projectOwner, { state: ProjectState.PENDING_APPROVAL });
      done();
    });

    afterAll(async (done) => {
      await ProjectOwner.deleteMany();
      await Project.deleteMany();
      done();
    });

    it('returns 200 and the project with the given id, populated with the projectOwner', async () => {
      const response = await request(app).get(`/api/v1/projects/${project.id}`);

      expect(response.status).toEqual(200);
      // eslint-disable-next-line no-underscore-dangle
      expect(response.body.project._id).toEqual(project.id);
      expect(response.body.project.title).toEqual(project.title);
      expect(response.body.project.state).toEqual(project.state);
    });
  });

  describe('Project owner routes', () => {
    describe('GET /project_owner/projects', () => {
      let jwt;
      const csrfToken = 'csrfToken';

      const sendRequest = (params = {}) => request(app)
        .get(`/api/v1/project_owner/projects?${constructQueryString(params)}`)
        .set('Cookie', [`${config.TOKEN_COOKIE_NAME}=${jwt}`])
        .set('csrf-token', csrfToken);

      beforeAll(async (done) => {
        const projectOwner = await saveProjectOwner();
        jwt = projectOwner.generateJwt(csrfToken);
        const earlierUpdatedProjectAttributes = {
          title: 'Updated earlier',
        };
        const laterUpdatedProjectAttributes = {
          title: 'Updated later',
        };
        const earlierCreatedProjectAttributes = {
          title: 'Created earlier',
        };
        const laterCreatedProjectAttributes = {
          title: 'Created later',
        };
        await saveProject(projectOwner, { state: ProjectState.PENDING_APPROVAL, ...laterCreatedProjectAttributes });
        await saveProject(projectOwner, { state: ProjectState.PENDING_APPROVAL, ...earlierCreatedProjectAttributes });
        await saveProject(projectOwner, { state: ProjectState.APPROVED_ACTIVE, ...earlierUpdatedProjectAttributes });
        await saveProject(projectOwner, { state: ProjectState.APPROVED_ACTIVE, ...laterUpdatedProjectAttributes });
        await saveProject(projectOwner, { state: ProjectState.APPROVED_INACTIVE, ...earlierUpdatedProjectAttributes });
        await saveProject(projectOwner, { state: ProjectState.APPROVED_INACTIVE, ...laterUpdatedProjectAttributes });
        await saveProject(projectOwner, { state: ProjectState.REJECTED, ...earlierUpdatedProjectAttributes });
        await saveProject(projectOwner, { state: ProjectState.REJECTED, ...laterUpdatedProjectAttributes });
        done();
      });

      afterAll(async (done) => {
        await ProjectOwner.deleteMany();
        await Project.deleteMany();
        done();
      });

      it('should be an authenticated route', async () => {
        const response = await request(app).get('/api/v1/project_owner/projects');

        expect(response.status).toEqual(401);
        expect(response.body.errors[0].title).toEqual('Unauthorized');
      });

      it('returns forbidden error when request does not contain CSRF token in header', async () => {
        const response = await request(app).get('/api/v1/project_owner/projects')
          .set('Cookie', [`${config.TOKEN_COOKIE_NAME}=${jwt}`]);

        expect(response.status).toEqual(403);
        expect(response.body.errors[0].title).toEqual('Forbidden');
      });

      describe('when projectState is not specified', () => {
        it('returns 200 status code and APPROVED_ACTIVE projects sorted by updatedAt descending', async () => {
          const response = await sendRequest();

          expect(response.status).toEqual(200);
          expect(response.body.projects.length).toEqual(2);
          expect(response.body.projects[0].state).toEqual(ProjectState.APPROVED_ACTIVE);
          expect(response.body.projects[0].title).toEqual('Updated later');
          expect(response.body.projects[1].state).toEqual(ProjectState.APPROVED_ACTIVE);
          expect(response.body.projects[1].title).toEqual('Updated earlier');
        });

        it('returns as many projects as the pageSize', async () => {
          const response = await sendRequest({ pageSize: 1, page: 1 });

          expect(response.body.projects.length).toEqual(1);
        });
      });

      describe('when project state is PENDING_APPROVAL', () => {
        it('returns 200 status code and PENDING_APPROVAL projects sorted by createdAt ascending', async () => {
          const response = await sendRequest({ projectState: ProjectState.PENDING_APPROVAL });

          expect(response.status).toEqual(200);
          expect(response.body.projects.length).toEqual(2);
          expect(response.body.projects[0].state).toEqual(ProjectState.PENDING_APPROVAL);
          expect(response.body.projects[0].title).toEqual('Created later');
          expect(response.body.projects[1].state).toEqual(ProjectState.PENDING_APPROVAL);
          expect(response.body.projects[1].title).toEqual('Created earlier');
        });
      });

      describe('when project state is APPROVED_INACTIVE', () => {
        it('returns 200 status code and APPROVED_INACTIVE projects sorted by updatedAt descending', async () => {
          const response = await sendRequest({ projectState: ProjectState.APPROVED_INACTIVE });

          expect(response.status).toEqual(200);
          expect(response.body.projects.length).toEqual(2);
          expect(response.body.projects[0].state).toEqual(ProjectState.APPROVED_INACTIVE);
          expect(response.body.projects[0].title).toEqual('Updated later');
          expect(response.body.projects[1].state).toEqual(ProjectState.APPROVED_INACTIVE);
          expect(response.body.projects[1].title).toEqual('Updated earlier');
        });
      });

      describe('when project state is REJECTED', () => {
        it('returns 200 status code and REJECTED projects sorted by updatedAt descending', async () => {
          const response = await sendRequest({ projectState: ProjectState.REJECTED });

          expect(response.status).toEqual(200);
          expect(response.body.projects.length).toEqual(2);
          expect(response.body.projects[0].state).toEqual(ProjectState.REJECTED);
          expect(response.body.projects[0].title).toEqual('Updated later');
          expect(response.body.projects[1].state).toEqual(ProjectState.REJECTED);
          expect(response.body.projects[1].title).toEqual('Updated earlier');
        });
      });
    });

    describe('GET /project_owner/project_counts', () => {
      let jwt;
      const csrfToken = 'csrfToken';

      const sendRequest = () => request(app)
        .get('/api/v1/project_owner/project_counts')
        .set('Cookie', [`${config.TOKEN_COOKIE_NAME}=${jwt}`])
        .set('csrf-token', csrfToken);

      beforeAll(async (done) => {
        const projectOwner = await saveProjectOwner();
        jwt = projectOwner.generateJwt(csrfToken);
        await saveProject(projectOwner, { state: ProjectState.PENDING_APPROVAL });
        await saveProject(projectOwner, { state: ProjectState.APPROVED_ACTIVE });
        await saveProject(projectOwner, { state: ProjectState.APPROVED_ACTIVE });
        await saveProject(projectOwner, { state: ProjectState.APPROVED_INACTIVE });
        await saveProject(projectOwner, { state: ProjectState.APPROVED_INACTIVE });
        await saveProject(projectOwner, { state: ProjectState.APPROVED_INACTIVE });
        await saveProject(projectOwner, { state: ProjectState.REJECTED });
        await saveProject(projectOwner, { state: ProjectState.REJECTED });
        await saveProject(projectOwner, { state: ProjectState.REJECTED });
        await saveProject(projectOwner, { state: ProjectState.REJECTED });
        done();
      });

      afterAll(async (done) => {
        await ProjectOwner.deleteMany();
        await Project.deleteMany();
        done();
      });

      it('should be an authenticated route', async () => {
        const response = await request(app).get('/api/v1/project_owner/project_counts');

        expect(response.status).toEqual(401);
        expect(response.body.errors[0].title).toEqual('Unauthorized');
      });

      it('returns forbidden error when request does not contain CSRF token in header', async () => {
        const response = await request(app).get('/api/v1/project_owner/project_counts')
          .set('Cookie', [`${config.TOKEN_COOKIE_NAME}=${jwt}`]);

        expect(response.status).toEqual(403);
        expect(response.body.errors[0].title).toEqual('Forbidden');
      });

      it('returns 200 status code and an object of counts of projects in each state', async () => {
        const response = await sendRequest();

        expect(response.status).toEqual(200);
        expect(response.body.counts).toEqual({
          [ProjectState.PENDING_APPROVAL]: 1,
          [ProjectState.APPROVED_ACTIVE]: 2,
          [ProjectState.APPROVED_INACTIVE]: 3,
          [ProjectState.REJECTED]: 4,
        });
      });
    });

    describe('PUT /project_owner/projects/:id', () => {
      let jwt;
      let csrfToken;
      let project;
      let projectOwner;
      const ERROR_TITLE = 'Invalid state change.';
      const ERROR_MESSAGE = 'This change is not allowed.';

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
        projectOwner = await createProjectOwner();
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
            project: JSON.stringify({
              title: 'updated name',
            }),
          });

        expect(response.status).toEqual(401);
        expect(response.body.errors[0].title).toEqual('Unauthorized');
      });

      test('returns forbidden error when request does not contain CSRF token in header', async () => {
        const response = await request(app).put(`/api/v1/project_owner/projects/${project.id}`)
          .set('Cookie', [`${config.TOKEN_COOKIE_NAME}=${jwt}`])
          .send({
            project: JSON.stringify({
              title: 'updated name',
            }),
          });

        expect(response.status).toEqual(403);
        expect(response.body.errors[0].title).toEqual('Forbidden');
      });

      test('returns 200 status code and updates project details', async () => {
        const newTitle = 'updated name';

        const response = await sendRequestWithBody({
          project: JSON.stringify({
            title: newTitle,
          }),
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
            project: JSON.stringify({
              state: ProjectState.APPROVED_ACTIVE,
            }),
          });

          expect(response.status).toEqual(422);
          expect(response.body.errors[0].title).toEqual(ERROR_TITLE);
          expect(response.body.errors[0].detail).toEqual(ERROR_MESSAGE);
        });

        test('returns 422 status code for change to inactive', async () => {
          const response = await sendRequestWithBody({
            project: JSON.stringify({
              state: ProjectState.APPROVED_INACTIVE,
            }),
          });

          expect(response.status).toEqual(422);
          expect(response.body.errors[0].title).toEqual(ERROR_TITLE);
          expect(response.body.errors[0].detail).toEqual(ERROR_MESSAGE);
        });

        test('returns 422 status code for change to rejected', async () => {
          const response = await sendRequestWithBody({
            project: JSON.stringify({
              state: ProjectState.REJECTED,
            }),
          });

          expect(response.status).toEqual(422);
          expect(response.body.errors[0].title).toEqual(ERROR_TITLE);
          expect(response.body.errors[0].detail).toEqual(ERROR_MESSAGE);
        });
      });

      describe('state change for active project', () => {
        beforeEach(async () => {
          await setProjectState(ProjectState.APPROVED_ACTIVE);
        });

        test('returns 200 status code and updates project state to inactive', async () => {
          const response = await sendRequestWithBody({
            project: JSON.stringify({
              state: ProjectState.APPROVED_INACTIVE,
            }),
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
            project: JSON.stringify({
              state: ProjectState.PENDING_APPROVAL,
            }),
          });

          expect(response.status).toEqual(422);
          expect(response.body.errors[0].title).toEqual(ERROR_TITLE);
          expect(response.body.errors[0].detail).toEqual(ERROR_MESSAGE);
        });

        test('returns 422 status code for change to rejected', async () => {
          const response = await sendRequestWithBody({
            project: JSON.stringify({
              state: ProjectState.REJECTED,
            }),
          });

          expect(response.status).toEqual(422);
          expect(response.body.errors[0].title).toEqual(ERROR_TITLE);
          expect(response.body.errors[0].detail).toEqual(ERROR_MESSAGE);
        });
      });

      describe('state change for inactive project', () => {
        beforeEach(async () => {
          await setProjectState(ProjectState.APPROVED_INACTIVE);
        });

        test('updates project state from inactive to active', async () => {
          const response = await sendRequestWithBody({
            project: JSON.stringify({
              state: ProjectState.APPROVED_ACTIVE,
            }),
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
            project: JSON.stringify({
              state: ProjectState.PENDING_APPROVAL,
            }),
          });

          expect(response.status).toEqual(422);
          expect(response.body.errors[0].title).toEqual(ERROR_TITLE);
          expect(response.body.errors[0].detail).toEqual(ERROR_MESSAGE);
        });

        test('returns 422 status code for change to rejected', async () => {
          const response = await sendRequestWithBody({
            project: JSON.stringify({
              state: ProjectState.REJECTED,
            }),
          });

          expect(response.status).toEqual(422);
          expect(response.body.errors[0].title).toEqual(ERROR_TITLE);
          expect(response.body.errors[0].detail).toEqual(ERROR_MESSAGE);
        });
      });

      describe('state change for rejected project', () => {
        beforeEach(async () => {
          await setProjectState(ProjectState.REJECTED);
        });

        test('returns 200 status code for change to pending approval', async () => {
          const response = await sendRequestWithBody({
            project: JSON.stringify({
              state: ProjectState.PENDING_APPROVAL,
            }),
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
            project: JSON.stringify({
              state: ProjectState.APPROVED_ACTIVE,
            }),
          });

          expect(response.status).toEqual(422);
          expect(response.body.errors[0].title).toEqual(ERROR_TITLE);
          expect(response.body.errors[0].detail).toEqual(ERROR_MESSAGE);
        });

        test('returns 422 status code for change to inactive', async () => {
          const response = await sendRequestWithBody({
            project: JSON.stringify({
              state: ProjectState.APPROVED_INACTIVE,
            }),
          });

          expect(response.status).toEqual(422);
          expect(response.body.errors[0].title).toEqual(ERROR_TITLE);
          expect(response.body.errors[0].detail).toEqual(ERROR_MESSAGE);
        });

        test('returns 422 status code for change to rejected', async () => {
          const response = await sendRequestWithBody({
            project: JSON.stringify({
              state: ProjectState.REJECTED,
            }),
          });

          expect(response.status).toEqual(422);
          expect(response.body.errors[0].title).toEqual(ERROR_TITLE);
          expect(response.body.errors[0].detail).toEqual(ERROR_MESSAGE);
        });
      });
    });
  });
});
