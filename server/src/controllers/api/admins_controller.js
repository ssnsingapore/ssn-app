import express from 'express';
import passport from 'passport';

import { config } from 'config/environment';
import { asyncWrap } from 'util/async_wrapper';
import { Admin } from 'models/Admin';
import { LoginService } from 'services/LoginService';
import { Role } from 'models/Role';
import { authMiddleware } from 'util/auth';

export const adminsRouter = express.Router();

adminsRouter.get('/admins', asyncWrap(getAdmins));
async function getAdmins(_req, res) {
  const admins = await Admin.find({}).exec();
  return res
    .status(200)
    .json({ admins });
}

adminsRouter.post(
  '/admins/login',
  passport.authenticate(`${Role.ADMIN}Local`, { session: false, failWithError: true }),
  asyncWrap(login)
);
async function login(req, res) {
  const { user } = req;
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

adminsRouter.delete(
  '/admins/logout',
  ...authMiddleware({ authorize: Role.ADMIN }),
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
