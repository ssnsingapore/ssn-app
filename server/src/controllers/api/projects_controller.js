import express from 'express';
import { asyncWrap } from 'util/async_wrapper';
import { Project } from 'models/Project';

// eslint-disable-next-line no-unused-vars
import { ProjectOwner } from 'models/ProjectOwner';

export const projectsRouter = express.Router();

projectsRouter.get('/projects', asyncWrap(getProjects));
async function getProjects(_req, res) {
  const projects = await Project.find({}).populate('projectOwner')
    .exec();

  return res
    .status(200)
    .json({ projects });
}
