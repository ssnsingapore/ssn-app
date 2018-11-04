import dotenv from 'dotenv';
import math from 'mathjs';

// =============================================================================
// ENVIRONMENT VARIABLES
// =============================================================================
// This file MUST NOT import any other files
// which require environment variables as
// dotenv.config() must be called before
// the environment variables are set
// and imports are resolved depth-first

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

// Note: NODE_ENV variable is recognized by Express
checkRequiredExist(
  'NODE_ENV',
  'PORT',
  'API_BASE_URL',
  'WEBSITE_BASE_URL',

  'DATABASE_URI',
  'AUTH_SECRET',
  'TOKEN_COOKIE_NAME',
  'TOKEN_COOKIE_MAXAGE',
  'JWT_EXPIRES_IN',

  'PASSWORD_RESET_DURATION',

  'AWS_BUCKET_NAME',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',

  'OAUTH_USER_EMAIL',
  'OAUTH_CLIENT_ID',
  'OAUTH_CLIENT_SECRET',
  'OAUTH_REFRESH_TOKEN',
);

const config = {
  PORT: process.env.PORT,
  API_BASE_URL: process.env.API_BASE_URL,
  WEBSITE_BASE_URL: process.env.WEBSITE_BASE_URL,

  DATABASE_URI: process.env.DATABASE_URI,
  MONGO_USERNAME: process.env.MONGO_USERNAME,
  MONGO_PASSWORD: process.env.MONGO_PASSWORD,

  AUTH_SECRET: process.env.AUTH_SECRET,
  TOKEN_COOKIE_NAME: process.env.TOKEN_COOKIE_NAME,
  TOKEN_COOKIE_MAXAGE: math.eval(process.env.TOKEN_COOKIE_MAXAGE || 0),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,

  MESSAGE_COOKIE_NAME: 'ssn_message',
  PASSWORD_RESET_DURATION: math.eval(process.env.PASSWORD_RESET_DURATION || 0),
  PASSWORD_RESET_TOKEN_COOKIE_NAME: 'ssn_password_reset_token',
  PASSWORD_RESET_EMAIL_COOKIE_NAME: 'ssn_password_reset_email',
  PASSWORD_RESET_CSRF_COOKIE_NAME: 'ssn_password_reset_csrf_token',

  AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,

  CRON_SCHEDULE: process.env.CRON_SCHEDULE,
};

export {
  isTest, isProduction, isDevelopment, config,
};

function checkRequiredExist(...variables) {
  if (isTest) {
    return;
  }

  variables.forEach((name) => {
    if (!process.env[name]) {
      throw new Error(`Environment variable ${name} is missing`);
    }
  });
}
