import express from 'express';
import { asyncWrap } from 'util/async_wrapper';
import { ProjectOwner } from 'models/ProjectOwner';

export const projectOwnersRouter = express.Router();

projectOwnersRouter.get('/project_owners', asyncWrap(getProjectOwners));
async function getProjectOwners(_req, res) {
  const projectOwners = await ProjectOwner.find({});

  return res.status(200).json({ projectOwners });
}
