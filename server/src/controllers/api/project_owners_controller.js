import express from 'express';
import { asyncWrap } from 'util/async_wrapper';
import { ProjectOwner } from 'models/ProjectOwner';
import { Role } from 'models/Role';
import { SignUpService } from '../../services/SignUpService';

export const projectOwnersRouter = express.Router();

projectOwnersRouter.get('/project_owners', asyncWrap(getProjectOwners));
async function getProjectOwners(_req, res) {
  const projectOwners = await ProjectOwner.find({});

  return res.status(200).json({ projectOwners });
}

projectOwnersRouter.post('/project_owners', asyncWrap(registerNewProjectOwner));
async function registerNewProjectOwner(req, res) {
  const projectOwner = new ProjectOwner({
    ...req.body.projectOwner,
  });
  const { password } = req.body.projectOwner;

  const errorsObject = await new SignUpService(projectOwner, password, Role.project_owner).execute();

  if (errorsObject) {
    return res
      .status(422)
      .json(errorsObject);
  }

  return res
    .status(201)
    .json({ projectOwner });
}
