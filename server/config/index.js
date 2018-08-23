// This file MUST NOT import any other files
// which require environment variables as
// dotenv.config() must be called before
// the environment variables are set
// and imports are resolved depth-first
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy } from 'passport-jwt';
import AWS from 'aws-sdk';

import { checkRequiredExist } from './util';
import { User } from '../models/User';

// =============================================================================
// ENVIRONMENT VARIABLES
// =============================================================================

dotenv.config();

// Note: NODE_ENV variable is recognized by Express
checkRequiredExist(
  'NODE_ENV',
  'PORT',
  'DATABASE_URI',
  'AUTH_SECRET',
  'AWS_BUCKET_NAME',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
);

export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isTest = process.env.NODE_ENV === 'test';
export const config = {
  PORT: process.env.PORT,
  DATABASE_URI: process.env.DATABASE_URI,
  AUTH_SECRET: process.env.AUTH_SECRET,
  AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,
  TOKEN_COOKIE_NAME: 'ssn_token',
  TOKEN_COOKIE_MAXAGE: 15 * 24 * 60 * 60 * 1000,
  JWT_EXPIRES_IN: '30 days',
};

// =============================================================================
// S3 CONFIGURATION
// =============================================================================
AWS.config = new AWS.Config({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'ap-southeast-1',
});

export const s3 = new AWS.S3();

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

