import dotenv from 'dotenv';

// =============================================================================
// ENVIRONMENT VARIABLES
// =============================================================================
// This file MUST NOT import any other files
// which require environment variables as
// dotenv.config() must be called before
// the environment variables are set
// and imports are resolved depth-first

dotenv.config();

export const checkRequiredExist = (...variables) => {
  variables.forEach((name) => {
    if (!process.env[name]) {
      throw new Error(`Environment variable ${name} is missing`);
    }
  });
};

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
