import express from 'express';
import { asyncWrap } from 'util/async_wrapper';
import { ProjectOwner } from 'models/ProjectOwner';
import { Role } from 'models/Role';
import passport from 'passport';
import { LoginService } from 'services/LoginService';
import { BadRequestErrorView } from 'util/errors';
import { config, isProduction } from 'config/environment';
import { SignUpService } from '../../services/SignUpService';


export const projectOwnersRouter = express.Router();

projectOwnersRouter.get('/project_owners', asyncWrap(getProjectOwners));
async function getProjectOwners(_req, res) {
  const projectOwners = await ProjectOwner.find({});

  return res.status(200).json({ projectOwners });
}

projectOwnersRouter.get('/project_owners/:id', asyncWrap(getProjectOwner));
async function getProjectOwner(req, res) {
  const { id } = req.params;
  const projectOwner = await ProjectOwner.findById(id);
  return res.status(200).json({ projectOwner });
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

projectOwnersRouter.post(
  '/project_owners/login',
  passport.authenticate(`${Role.project_owner}Local`,
    { session: false, failWithError: true }),
  asyncWrap(login)
);
async function login(req, res) {
  const { user } = req;
  if (user.isConfirmed()) {
    const { cookieArguments, csrfToken } = await new LoginService(user)
      .generateCookieAndCsrfToken();

    res.set('csrf-token', csrfToken);
    res.cookie(...cookieArguments);
    return res
      .status(200)
      .json({
        user,
      });
  }

  const message = 'Please activate your account before logging in.';
  return res
    .status(400)
    .json({ errors: [new BadRequestErrorView(message)] });
}

projectOwnersRouter.get('/project_owners/:id/confirmation/:confirmationToken', asyncWrap(confirmProjectOwner));
async function confirmProjectOwner(req, res) {
  const { id, confirmationToken } = req.params;
  const projectOwner = await ProjectOwner.findById(id);

  res.cookie(
    config.MESSAGE_COOKIE_NAME,
    config.MESSAGE_COOKIE_NAME,
    {
      secure: isProduction,
      sameSite: true,
    }
  );
  if (!projectOwner || projectOwner.confirmationToken !== confirmationToken) {
    const message = 'There was an error confirming your account. Please try again!';
    return res.redirect(`${config.WEBSITE_BASE_URL}/login#type=ERROR&message=${encodeURIComponent(message)}`);
  }

  if (projectOwner.isConfirmed()) {
    const message = 'Your account has already been confirmed. Please login.';
    return res.redirect(`${config.WEBSITE_BASE_URL}/login#type=INFO&message=${encodeURIComponent(message)}`);
  }

  await projectOwner.confirm();
  const message = 'Your account has been successfully confirmed! You will now be able to login.';
  return res.redirect(`${config.WEBSITE_BASE_URL}/login#type=SUCCESS&message=${encodeURIComponent(message)}`);
}
