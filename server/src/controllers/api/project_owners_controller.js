import express from 'express';
import passport from 'passport';
import createError from 'http-errors';
import multer from 'multer';
import { s3 } from 'config/aws';

import { config, isProduction } from 'config/environment';
import { asyncWrap } from 'util/async_wrapper';
import { BadRequestErrorView } from 'util/errors';
import { ProjectOwner } from 'models/ProjectOwner';
import { Role } from 'models/Role';
import { LoginService } from 'services/LoginService';
import { SignUpService } from 'services/SignUpService';
import { PasswordResetService } from 'services/PasswordResetService';
import { authMiddleware } from 'util/auth';

export const projectOwnersRouter = express.Router();

// =============================================================================
// Public routes
// =============================================================================

projectOwnersRouter.get('/project_owners', asyncWrap(getProjectOwners));
async function getProjectOwners(req, res) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.pageSize) || 20;
  const customLabels = {
    docs: 'projectOwners',
    totalDocs: 'totalProjectOwners',
  };
  const query = {
    confirmedAt: { $ne: null },
  };
  const results = await ProjectOwner.paginate(query, {
    page, limit, customLabels, sort: { name: 'asc' }, collation: { locale: 'en' },
  });
  return res.status(200).json(results);
}

projectOwnersRouter.get('/project_owners/:id', asyncWrap(getProjectOwner));
async function getProjectOwner(req, res) {
  const { id } = req.params;
  const projectOwner = await ProjectOwner.findById(id);
  return res.status(200).json({ projectOwner });
}

// =============================================================================
// Login/Logout
// =============================================================================

projectOwnersRouter.post(
  '/project_owners/login',
  passport.authenticate(`${Role.PROJECT_OWNER}Local`,
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

projectOwnersRouter.delete(
  '/project_owners/logout',
  ...authMiddleware({ authorize: Role.PROJECT_OWNER }),
  asyncWrap(logout)
);
async function logout(req, res) {
  const { user } = req;

  await user.update({ lastLogoutTime: new Date() });
  res.clearCookie(config.TOKEN_COOKIE_NAME, {
    httpOnly: true,
    secure: true,
    sameSite: true,
  });
  return res.status(204).end();
}

// =============================================================================
// Project Owner Routes
// =============================================================================

const upload = multer();

// TODO: Rename and make authenticated route
projectOwnersRouter.put('/project_owner/profile',
  ...authMiddleware({ authorize: Role.PROJECT_OWNER }),
  upload.single('profilePhoto'),
  asyncWrap(updateProjectOwner));

async function updateProjectOwner(req, res) {
  const projectOwner = req.user;
  const { password } = req.body;

  const projectOwnerAttributes = req.body;
  if (projectOwnerAttributes.password) {
    delete projectOwnerAttributes.password;
    delete projectOwnerAttributes.passwordConfirmation;
  }

  projectOwner.set(projectOwnerAttributes);
  if (password) {
    projectOwner.setPassword(password);
    await projectOwner.save();
    const { cookieArguments, csrfToken } = await new LoginService(projectOwner)
      .generateCookieAndCsrfToken();
    res.set('csrf-token', csrfToken);
    res.cookie(...cookieArguments);
  } else {
    await projectOwner.save();
  }

  const profilePhotoImage = req.file;
  if (profilePhotoImage) {
    const response = await s3.upload({
      Body: profilePhotoImage.buffer,
      Key: `${new Date().getTime()}-${projectOwner.id}-${projectOwner.name}`,
      ACL: 'public-read',
      Bucket: `${config.AWS_BUCKET_NAME}/project_owner_profile_photos`,
    }).promise();
    projectOwner.set({ profilePhotoUrl: response.Location });
    await projectOwner.save();
  }

  return res.status(200).json({ user: projectOwner });
}

// =============================================================================
// Sign Up and Account Confirmation
// =============================================================================
projectOwnersRouter.post('/project_owners',
  upload.single('profilePhoto'),
  asyncWrap(registerNewProjectOwner));
async function registerNewProjectOwner(req, res) {
  const { file, body } = req;
  const projectOwner = new ProjectOwner({
    ...body,
  });

  const errorsObject = await new SignUpService(projectOwner, body.password, Role.PROJECT_OWNER, file).execute();
  if (errorsObject) {
    return res
      .status(422)
      .json(errorsObject);
  }

  return res
    .status(201)
    .json({ projectOwner });
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
  res.set('cache-control', 'private, no-cache, no-store, must-revalidate');

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

// =============================================================================
// Password Reset
// =============================================================================

const passwordResetService = new PasswordResetService(ProjectOwner);

projectOwnersRouter.post('/project_owners/password/reset', asyncWrap(triggerPasswordReset));
async function triggerPasswordReset(req, res) {
  const { email } = req.body;
  const errorsObject = await passwordResetService.trigger(email);

  if (errorsObject) {
    return res
      .status(400)
      .json(errorsObject);
  }

  return res
    .status(204)
    .json();
}

projectOwnersRouter.get('/project_owners/:id/password/reset/:passwordResetToken', asyncWrap(redirectToPasswordResetForm));
async function redirectToPasswordResetForm(req, res) {
  const { id, passwordResetToken } = req.params;
  const { redirectUrl, cookieArgs } = await passwordResetService.getRedirectUrlAndCookieArgs(
    id,
    passwordResetToken
  );

  Object.keys(cookieArgs).forEach((type) => {
    res.cookie(...cookieArgs[type]);
  });

  res.set('cache-control', 'private, no-cache, no-store, must-revalidate');
  return res.redirect(redirectUrl);
}

projectOwnersRouter.put('/project_owners/password/reset', asyncWrap(resetPassword));
async function resetPassword(req, res, next) {
  const csrfToken = req.get('csrf-token');
  if (!csrfToken) {
    return next(createError.Forbidden());
  }

  const email = req.cookies[config.PASSWORD_RESET_EMAIL_COOKIE_NAME];
  const passwordResetToken = req.cookies[config.PASSWORD_RESET_TOKEN_COOKIE_NAME];
  const { password } = req.body;

  const errorsObject = await passwordResetService.attemptPasswordReset(
    email,
    passwordResetToken,
    password,
  );

  if (errorsObject) {
    return res
      .status(400)
      .json(errorsObject);
  }

  const cookieArgsObject = await passwordResetService.getClearCookieArgs();
  res.clearCookie(...cookieArgsObject.passwordResetToken);
  res.clearCookie(...cookieArgsObject.email);

  return res.status(204).json();
}
