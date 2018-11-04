import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import errorhandler from 'errorhandler';
import mongoose from 'mongoose';
import passport from 'passport';
import findConfig from 'find-config';

import { isProduction, isTest, config } from 'config/environment';
import { configurePassport } from 'config/passport';
import { router } from 'controllers';
import { handleError } from 'util/errors';
import { CheckForInactiveProjectsService } from 'services/CheckForInactiveProjectsService';
import { scheduleCronJob } from 'config/cron';

if (!isTest) {
  const options = config.MONGO_USERNAME
    ? {
      auth: {
        user: config.MONGO_USERNAME,
        password: config.MONGO_PASSWORD,
      },
    } : {};
  mongoose.connect(config.DATABASE_URI, options);
}

configurePassport();

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());

// Serve static files
const indexFilePath = findConfig('index.html', { dir: 'client/build' });
if (indexFilePath) {
  app.use(express.static(path.dirname(indexFilePath)));
}

if (!isTest && config.CRON_SCHEDULE) {
  scheduleCronJob(new CheckForInactiveProjectsService());
}

if (!isProduction) {
  app.use(errorhandler());
}

// API routes
app.use(router);

// Catch all routes that don't match any previous ones
// and send back the React app's index.html file
app.get('/*', (_req, res, next) => {
  if (indexFilePath) {
    return res.sendFile(indexFilePath);
  }
  return next();
});
// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError.NotFound());
});

// error handler
app.use((err, req, res, _next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = isProduction ? {} : err;

  handleError(err, res);
});

export default app;
