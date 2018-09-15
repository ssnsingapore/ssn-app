import express from 'express';
import { asyncWrap } from 'util/async_wrapper';
import { Project } from 'models/Project';

export const projectsRouter = express.Router();

projectsRouter.get('/projects', asyncWrap(getProjects));
async function getProjects(_req, res) {
  const projects = await Project.find({});

  return res
    .status(200)
    .json({ projects });
}
