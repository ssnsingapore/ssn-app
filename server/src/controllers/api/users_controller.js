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

usersRouter.get('/users/:id/confirmation/:confirmationToken', asyncWrap(confirmUser));
async function confirmUser(req, res) {
  const { id, confirmationToken } = req.params;
  const user = await User.findById(id);

  res.cookie(
    config.CONFIRMATION_COOKIE_NAME,
    {
      secure: true,
      sameSite: true,
    }
  );

  if (user.isConfirmed()) {
    const message = 'Your account has already been confirmed. Please login.';
    return res.redirect(`${config.WEBSITE_BASE_URL}/login#type=INFO&message=${encodeURIComponent(message)}`);
  }

  if (user.confirmationToken !== confirmationToken) {
    const message = 'There was an error confirming your account. Please try again!';
    return res.redirect(`${config.WEBSITE_BASE_URL}/login#type=ERROR&message=${encodeURIComponent(message)}`);
  }

  await user.confirm();
  const message = 'Your account has been successfully confirmed! You will now be able to login.';
  return res.redirect(`${config.WEBSITE_BASE_URL}/login#type=SUCCESS&message=${encodeURIComponent(message)}`);
}
