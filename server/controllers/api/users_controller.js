import express from 'express';
import passport from 'passport';

import { User } from 'models/User';
import { asyncWrap } from 'util/async_wrapper';
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

  return res
    .status(201)
    .json({ user: user.toJSON() });
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
  const { user } = req;

  return res
    .status(200)
    .json({
      token: user.generateJWT(),
      user: user.toJSON(),
    });
}
