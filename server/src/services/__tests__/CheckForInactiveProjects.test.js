import mongoose from 'mongoose';

import { createProjectOwner, createProject } from 'util/testHelper';
import { ProjectOwner } from 'models/ProjectOwner';
import { Project, ProjectState, ProjectType, ProjectFrequency } from 'models/Project';
import { CheckForInactiveProjectsService } from '../CheckForInactiveProjectsService';

beforeAll(async () => {
  await mongoose.connect(global.mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('CheckForInactiveProjectsService', () => {
  let project;

  beforeEach(async () => {
    const projectOwner = createProjectOwner();
    project = createProject(projectOwner);

    await projectOwner.save();
    await project.save();
  });

  afterEach(async () => {
    await ProjectOwner.remove({});
    await Project.remove({});
  });

  describe('run', () => {
    it('sets an active project which has passed its event end date to inactive', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      project.set({
        state: ProjectState.APPROVED_ACTIVE,
        startDate: new Date(2000, 1, 1),
        endDate: yesterday,
      });

      await project.save();

      await new CheckForInactiveProjectsService().run();

      const updatedProject = await Project.findById(project.id);

      expect(updatedProject.state).toEqual(ProjectState.APPROVED_INACTIVE);
    });

    it('does not set an active project which has an end date in the future to inactive', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      project.set({
        state: ProjectState.APPROVED_ACTIVE,
        startDate: new Date(2000, 1, 1),
        endDate: tomorrow,
      });

      await project.save();

      await new CheckForInactiveProjectsService().run();

      const updatedProject = await Project.findById(project.id);

      expect(updatedProject.state).toEqual(ProjectState.APPROVED_ACTIVE);
    });

    it('does not set a pending approval project to inactive', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      project.set({
        state: ProjectState.PENDING_APPROVAL,
        startDate: new Date(2000, 1, 1),
        endDate: yesterday,
      });

      await project.save();

      await new CheckForInactiveProjectsService().run();

      const updatedProject = await Project.findById(project.id);

      expect(updatedProject.state).toEqual(ProjectState.PENDING_APPROVAL);
    });

    it('does not set a rejected project to inactive', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      project.set({
        state: ProjectState.REJECTED,
        startDate: new Date(2000, 1, 1),
        endDate: yesterday,
      });

      await project.save();

      await new CheckForInactiveProjectsService().run();

      const updatedProject = await Project.findById(project.id);

      expect(updatedProject.state).toEqual(ProjectState.REJECTED);
    });

    it('does not set a recurring project to inactive', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      project.set({
        projectType: ProjectType.RECURRING,
        frequency: ProjectFrequency.EVERY_DAY,
        state: ProjectState.APPROVED_ACTIVE,
        endDate: undefined,
      });

      await project.save();

      await new CheckForInactiveProjectsService().run();

      const updatedProject = await Project.findById(project.id);

      expect(updatedProject.state).toEqual(ProjectState.APPROVED_ACTIVE);
    });
  });
});
