import express from 'express';
import { asyncWrap } from 'util/async_wrapper';
import { Project, ProjectState } from 'models/Project';

// eslint-disable-next-line no-unused-vars
import { ProjectOwner } from 'models/ProjectOwner';

// export const projectsRouterHome = express.Router();

// projectsRouterHome.get('/projects/home', asyncWrap(getProjectsHome));
// async function getProjectsHome(_req, res) {
//   const projects = await Project.find({}).limit(3).populate('projectOwner')
//     .exec();

//   return res
//     .status(200)
//     .json({ projects });
// }

// export const projectsRouterSearch = express.Router();

// projectsRouterSearch.get('/projects/search', asyncWrap(getProjectsSearch));
// async function getProjectsSearch(_req, res) {
//   const projects = await Project.find({}).populate('projectOwner')
//     .exec();

//   return res
//     .status(200)
//     .json({ projects });
// }

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
