import express from 'express';
import passport from 'passport';
import uid from 'uid-safe';

import { User } from 'models/User';
import { asyncWrap } from 'util/async_wrapper';
import { config } from 'config/environment';
import { checkIfFound, UnprocessableEntityErrorView } from 'util/errors';

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
  await user.setPassword(password);

  try {
    await user.save();
  } catch (err) {
    return checkForDuplicateEmail(err, res);
  }

  return setJwtCookieAndCsrfToken(res, user, 201);
}

function checkForDuplicateEmail(err, res) {
  if (err.name === 'ValidationError'
    && err.errors.email.message === 'should be unique') {
    return res
      .status(422)
      .json({
        errors: [
          new UnprocessableEntityErrorView(
            'Email is taken',
            'The email address you have entered is already associated with another account',
          ),
        ],
      });
  }

  throw err;
}

usersRouter.post(
  '/login',
  passport.authenticate('local', { session: false }),
  asyncWrap(login)
);
async function login(req, res) {
  // req.user will be available after successful auth
  const { user } = req;
  return setJwtCookieAndCsrfToken(res, user, 200);
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
