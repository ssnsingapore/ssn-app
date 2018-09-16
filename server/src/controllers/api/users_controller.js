import express from 'express';
import passport from 'passport';

import { User } from 'models/User';
import { asyncWrap } from 'util/async_wrapper';
import { config } from 'config/environment';
import { checkIfFound } from 'util/errors';
import { SignUpService } from '../../services/SignUpService';
import { LoginService } from '../../services/LoginService';

export const usersRouter = express.Router();

usersRouter.get('/users/:id', asyncWrap(getUser));
async function getUser(req, res) {
  const userId = req.params.id;
  const user = await User.findById(userId);
  checkIfFound(user);

  return res
    .status(200)
    .json({ user: user.toJSON() });
}

usersRouter.post('/users', asyncWrap(registerNewUser));
async function registerNewUser(req, res) {
  const {
    name, email, password,
  } = req.body.user;

  const user = new User({
    name,
    email,
  });

  const errorsObject = await new SignUpService(user, password).execute();

  if (errorsObject) {
    return res
      .status(422)
      .json(errorsObject);
  }

  return res
    .status(201)
    .json({ user });
}

// Add logic to prevent logins if account is not yet confirmed
// and redirect with alert message
usersRouter.post(
  '/login',
  passport.authenticate('local', { session: false }),
  asyncWrap(login)
);
async function login(req, res) {
  // req.user will be available after successful auth
  const { user } = req;
  return loginUser(res, user);
}

async function loginUser(res, user) {
  await setJwtCookieAndCsrfToken(res, user);
  return res
    .status(200)
    .json({
      user,
    });
}

async function setJwtCookieAndCsrfToken(res, user) {
  const { cookieArguments, csrfToken } = await new LoginService(user)
    .generateCookieAndCsrfToken();

  res.set('csrf-token', csrfToken);
  res.cookie(...cookieArguments);
}

usersRouter.delete(
  '/logout',
  passport.authenticate('jwt', { session: false, failWithError: true }),
  asyncWrap(logout)
);
async function logout(req, res) {
  // req.user will be available after successful auth
  const { user } = req;

  await user.update({ lastLogoutTime: new Date() });
  res.clearCookie(
    config.TOKEN_COOKIE_NAME,
    {
      httpOnly: true,
      secure: true,
      sameSite: true,
    }
  );
  return res
    .status(204)
    .end();
}

async function setJwtCookieAndCsrfToken(res, user, status) {
  const csrfToken = await uid(18);

  res.cookie(
    config.TOKEN_COOKIE_NAME,
    user.generateJWT(csrfToken),
    {
      httpOnly: true,
      secure: true,
      sameSite: true,
      maxAge: config.TOKEN_COOKIE_MAXAGE,
    },
  );
  res.set('csrf-token', csrfToken);
  return res
    .status(status)
    .json({
      user: user.toJSON(),
    });
}
