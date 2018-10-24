import express from 'express';
import passport from 'passport';

import { asyncWrap } from 'util/async_wrapper';
import { Project, ProjectState } from 'models/Project';
// eslint-disable-next-line no-unused-vars
import { ProjectOwner } from 'models/ProjectOwner';
import { Role } from 'models/Role';
import { UnprocessableEntityErrorView } from 'util/errors';
import { ProjectOwnerAllowedTransitions, AdminAllowedTransitions } from 'config/stateChangePermissions';

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
  passport.authenticate(`${Role.PROJECT_OWNER}Jwt`, { session: false, failWithError: true }),
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
  passport.authenticate(`${Role.PROJECT_OWNER}Jwt`, { session: false, failWithError: true }),
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
  passport.authenticate(`${Role.PROJECT_OWNER}Jwt`, { session: false, failWithError: true }),
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
  passport.authenticate(`${Role.PROJECT_OWNER}Jwt`, { session: false, failWithError: true }),
  asyncWrap(projectOwnerChangeProjectState));
async function projectOwnerChangeProjectState(req, res) {
  const { id } = req.params;
  const { state } = req.body.project;

  const project = await Project.findById(id).exec();

  const allowedTransitions = ProjectOwnerAllowedTransitions[project.state];

  if (allowedTransitions.includes(state)) {
    project.set({ state });
    project.save();
    return res
      .status(200)
      .json({ project });
  }
  return res
    .status(422)
    .json({
      errors: [new UnprocessableEntityErrorView('Invalid state change.',
        `Project state ${project.state} cannot be changed to ${state}.`)],
    });
}

// =============================================================================
// Admin Routes
// =============================================================================

projectRouter.put('/admin/projects/:id',
  passport.authenticate(`${Role.ADMIN}Jwt`, { session: false, failWithError: true }),
  asyncWrap(adminChangeProjectState));
async function adminChangeProjectState(req, res) {
  const { id } = req.params;
  const { state } = req.body.project;

  const project = await Project.findById(id).exec();

  const allowedTransitions = AdminAllowedTransitions[project.state];

  if (allowedTransitions.includes(state)) {
    project.set({ state });
    project.save();
    return res
      .status(200)
      .json({ project });
  }
  return res
    .status(422)
    .json({
      errors: [new UnprocessableEntityErrorView('Invalid state change.',
        `Project state ${project.state} cannot be changed to ${state}.`)],
    });
}
