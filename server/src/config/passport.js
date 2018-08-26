import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy } from 'passport-jwt';

import { User } from 'models/User';
import { config } from './environment';

export const configurePassport = () => {
  // =============================================================================
  // PASSPORT CONFIGURATION
  // =============================================================================

  passport.use(new LocalStrategy(
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

  const extractJwtFromCookie = (req) => {
    if (req && req.cookies) {
      return req.cookies[config.TOKEN_COOKIE_NAME];
    }

    return null;
  };

  // Workaround to get signing secret which requires
  // user's hashed password and last logout time
  // Not the most ideal as we have to hit the DB twice
  // with passport-jwts current API
  const secretOrKeyProvider = async (_req, rawJwtToken, done) => {
    const payload = jwt.decode(rawJwtToken);
    const { userid } = payload;
    const user = await User.findOne({ _id: userid });

    return done(null, `${config.AUTH_SECRET}-${user.hashedPassword}-${user.lastLogoutTime}`);
  };

  passport.use(new JwtStrategy(
    {
      jwtFromRequest: extractJwtFromCookie,
      secretOrKeyProvider,
    },
    (async (jwtPayload, done) => {
      try {
        const { userid } = jwtPayload;
        const user = await User.findOne({ _id: userid });
        if (!user) {
          return done(null, false, {});
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  ));
}
;