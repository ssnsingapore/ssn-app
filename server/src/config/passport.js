import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy } from 'passport-jwt';

import { User } from 'models/User';
import { Role } from 'models/Role';
import { Admin } from 'models/Admin';
import { ProjectOwner } from 'models/ProjectOwner';
import { config } from './environment';

export const extractJwtFromCookie = (req) => {
  if (req && req.cookies) {
    return req.cookies[config.TOKEN_COOKIE_NAME];
  }

  return null;
};

export const configurePassport = () => {
  // =============================================================================
  // PASSPORT CONFIGURATION
  // =============================================================================

  passport.use(`${Role.USER}Local`, new LocalStrategy(
    {
      usernameField: 'user[email]',
      passwordField: 'user[password]',
    },
    (async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user || !(await user.isValidPassword(password))) {
          return done(null, false);
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  ));

  passport.use(`${Role.ADMIN}Local`, new LocalStrategy(
    {
      usernameField: 'user[email]',
      passwordField: 'user[password]',
    },
    (async (email, password, done) => {
      try {
        const user = await Admin.findOne({ email });
        if (!user || !(await user.isValidPassword(password))) {
          return done(null, false);
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  ));

  passport.use(`${Role.PROJECT_OWNER}Local`, new LocalStrategy(
    {
      usernameField: 'user[email]',
      passwordField: 'user[password]',
    },
    (async (email, password, done) => {
      try {
        const user = await ProjectOwner.findOne({ email });
        if (!user || !(await user.isValidPassword(password))) {
          return done(null, false);
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  ));


  const getUserFromJwt = model => (async (jwtPayload, done) => {
    try {
      const { userid } = jwtPayload;
      const user = await model.findOne({ _id: userid });
      if (!user) {
        return done(null, false, {});
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  });

  const secretOrKeyProvider = model => async (_req, rawJwtToken, done) => {
    const payload = jwt.decode(rawJwtToken);
    const { userid } = payload;
    const user = await model.findOne({ _id: userid });
    return done(null, `${config.AUTH_SECRET}-${user.hashedPassword}-${user.lastLogoutTime}`);
  };

  // Workaround to get signing secret which requires
  // user's hashed password and last logout time
  // Not the most ideal as we have to hit the DB twice
  // with passport-jwts current API

  passport.use(`${Role.USER}Jwt`, new JwtStrategy(
    {
      jwtFromRequest: extractJwtFromCookie,
      secretOrKeyProvider: secretOrKeyProvider(User),
    },
    getUserFromJwt(User)
  ));

  passport.use(`${Role.PROJECT_OWNER}Jwt`, new JwtStrategy(
    {
      jwtFromRequest: extractJwtFromCookie,
      secretOrKeyProvider: secretOrKeyProvider(ProjectOwner),
    },
    getUserFromJwt(ProjectOwner)
  ));

  passport.use(`${Role.ADMIN}Jwt`, new JwtStrategy(
    {
      jwtFromRequest: extractJwtFromCookie,
      secretOrKeyProvider: secretOrKeyProvider(Admin),
    },
    getUserFromJwt(Admin)
  ));
};
