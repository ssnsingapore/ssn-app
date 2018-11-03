import express from 'express';

import { asyncWrap } from 'util/async_wrapper';
import { Project, ProjectState } from 'models/Project';
// eslint-disable-next-line no-unused-vars
import { ProjectOwner } from 'models/ProjectOwner';
import { Role } from 'models/Role';
import { UnprocessableEntityErrorView } from 'util/errors';
import { ProjectOwnerAllowedTransitions, AdminAllowedTransitions } from 'config/stateChangePermissions';
import { authMiddleware } from 'util/auth';

export const projectRouter = express.Router();

projectRouter.get('/projects', asyncWrap(getProjects));
async function getProjects(req, res) {
  const pageSize = Number(req.query.pageSize) || 10;
  const { projectState = ProjectState.APPROVED_ACTIVE } = req.query;
  const sortParams = (projectState === ProjectState.PENDING_APPROVAL)
    ? { createdAt: 'ascending' } : { updatedAt: 'descending' };

  // Queries to mongodb
  const projects = await Project.find({ state: projectState })
    .limit(pageSize)
    .populate('projectOwner')
    .sort(sortParams)
    .exec();

  return res.status(200).json({ projects });
}

projectRouter.get('/project_counts', asyncWrap(getProjectCounts));
async function getProjectCounts(_req, res) {
  const counts = {};
  const projectStates = Object.keys(ProjectState);

  for (let i = 0; i < projectStates.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    counts[projectStates[i]] = await Project.count({ state: projectStates[i] });
  }

  return res.status(200).json({ counts });
}
projectRouter.get('/projects/:id', asyncWrap(getProject));
async function getProject(req, res) {
  const { id } = req.params;

  const project = await Project.findById(id)
    .populate('projectOwner')
    .exec();

  return res.status(200).json({ project });
}

// =============================================================================
// Project Owner Routes
// =============================================================================
projectRouter.get(
  '/project_owner/projects',
  ...authMiddleware({ authorize: Role.PROJECT_OWNER }),
  asyncWrap(getProjectsForProjectOwner)
);
async function getProjectsForProjectOwner(req, res) {
  const { user } = req;
  const pageSize = Number(req.query.pageSize) || 10;
  const { projectState = ProjectState.APPROVED_ACTIVE } = req.query;
  const projects = await Project.find({ state: projectState, projectOwner: user.id })
    .limit(pageSize)
    .populate('projectOwner')
    .exec();

  return res.status(200).json({ projects });
}


projectRouter.get('/project_owner/project_counts',
  ...authMiddleware({ authorize: Role.PROJECT_OWNER }),
  asyncWrap(getProjectCountsForProjectOwner));
async function getProjectCountsForProjectOwner(req, res) {
  const counts = {};
  const projectStates = Object.keys(ProjectState);
  const { user } = req;
  for (let i = 0; i < projectStates.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    counts[projectStates[i]] = await Project.count({ state: projectStates[i], projectOwner: user.id });
  }

  return res.status(200).json({ counts });
}

projectRouter.post('/project_owner/projects/new',
  ...authMiddleware({ authorize: Role.PROJECT_OWNER }),
  asyncWrap(postProject));
async function postProject(req, res) {
  const project = new Project({
    ...req.body.project,
    state: ProjectState.PENDING_APPROVAL,
  });
  await project.save();
  return res.status(201).json({ project: project.toJSON() });
}

projectRouter.put('/project_owner/projects/:id',
  ...authMiddleware({ authorize: Role.PROJECT_OWNER }),
  asyncWrap(projectOwnerChangeProjectState));
async function projectOwnerChangeProjectState(req, res) {
  const { id } = req.params;
  const updatedProject = req.body.project;
  const { user } = req;

  const existingProject = await Project.findById(id).exec();
  const allowedTransitions = ProjectOwnerAllowedTransitions[existingProject.state];

  const isUpdatedStateAllowed = updatedProject.state && allowedTransitions.includes(updatedProject.state);
  const { _id } = existingProject.projectOwner;
  const isCorrectProjectOwner = user.id.toString() === _id.toString();

  if ((isUpdatedStateAllowed || !updatedProject.state) && isCorrectProjectOwner) {
    existingProject.set(updatedProject);
    await existingProject.save();

    return res
      .status(200)
      .json({ project: existingProject });
  }
  return res
    .status(422)
    .json({
      errors: [new UnprocessableEntityErrorView('Invalid state change.',
        'This change is not allowed.')],
    });
}

// =============================================================================
// Admin Routes
// =============================================================================

projectRouter.put('/admin/projects/:id',
  ...authMiddleware({ authorize: Role.ADMIN }),
  asyncWrap(adminChangeProjectState));
async function adminChangeProjectState(req, res) {
  const { id } = req.params;
  const updatedProject = req.body.project;

  const existingProject = await Project.findById(id).exec();
  const allowedTransitions = AdminAllowedTransitions[existingProject.state];

  if (updatedProject.state && allowedTransitions.includes(updatedProject.state)) {
    if (existingProject.state === ProjectState.PENDING_APPROVAL && !updatedProject.rejectionReason) {
      return res
        .status(422)
        .json({
          errors: [new UnprocessableEntityErrorView('Invalid state change.',
            'This change is not allowed.')],
        });
    }
    existingProject.set(updatedProject);
    await existingProject.save();
    return res
      .status(200)
      .json({ project: existingProject });
  }
  return res
    .status(422)
    .json({
      errors: [new UnprocessableEntityErrorView('Invalid state change.',
        'This change is not allowed.')],
    });
}
