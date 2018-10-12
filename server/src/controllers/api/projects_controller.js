import express from 'express';
import { asyncWrap } from 'util/async_wrapper';
import { Project, ProjectState } from 'models/Project';

// eslint-disable-next-line no-unused-vars
import { ProjectOwner } from 'models/ProjectOwner';

export const projectRouter = express.Router();

projectRouter.get('/projects', asyncWrap(getProjects));
async function getProjects(req, res) {
  // Params
  const pageSize = Number(req.query.pageSize) || 10;
  const { projectState = ProjectState.APPROVED_ACTIVE } = req.query;

  // Queries to mongodb
  const projects = await Project.find({ state: { $eq: projectState } })
    .limit(pageSize)
    .populate('projectOwner')
    .exec();

  return res.status(200).json({ projects });
}

projectRouter.get('/project_counts', asyncWrap(getProjectCounts));
async function getProjectCounts(req, res) {
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
  // Params
  const { id } = req.params;

  // Queries to mongodb
  const project = await Project.findById(id)
    .populate('projectOwner')
    .exec();

  return res.status(200).json({ project });
}

projectRouter.post('/projects/new', asyncWrap(postProject));
async function postProject(req, res) {
  const project = new Project({
    ...req.body.project,
    state: ProjectState.PENDING_APPROVAL,
  });
  await project.save();
  return res.status(201).json({ project: project.toJSON() });
}
