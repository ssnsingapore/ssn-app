import passport from 'passport';
import createError from 'http-errors';
import jwt from 'jsonwebtoken';
import { extractJwtFromCookie } from 'config/passport';

const csrfProtection = (req, _res, next) => {
  const csrfToken = req.get('csrf-token');
  const rawJwtToken = extractJwtFromCookie(req);
  const payload = jwt.decode(rawJwtToken);

  if (!payload) {
    return next(createError.Unauthorized());
  }

  if (csrfToken !== payload.csrfToken) {
    return next(createError.Forbidden());
  }

  return next();
};

const roleAuthorization = role => (req, _res, next) => {
  const rawJwtToken = extractJwtFromCookie(req);
  const payload = jwt.decode(rawJwtToken);

  if (!payload) {
    return next(createError.Unauthorized());
  }

  if (payload.role !== role) {
    return next(createError.Forbidden());
  }

  return next();
};

export const authMiddleware = ({ authorize } = {}) => {
  if (authorize) {
    return [
      csrfProtection,
      roleAuthorization(authorize),
      passport.authenticate('jwt', { session: false, failWithError: true }),
    ];
  }

  return [
    csrfProtection,
    // See here https://github.com/jaredhanson/passport/issues/458 for failWithError option that allows propagation to error-handling middleware
    passport.authenticate('jwt', { session: false, failWithError: true }),
  ];
};
