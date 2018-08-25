import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import errorhandler from 'errorhandler';
import mongoose from 'mongoose';
import passport from 'passport';

import { isProduction, isTest, config } from './config';
import { router } from './controllers';
import { handleError } from './util/errors';

if (!isTest) {
  mongoose.connect(config.DATABASE_URI);
}

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());

if (isProduction) {
  app.use(express.static(path.join(__dirname, '../../client/build')));
} else {
  app.use(errorhandler());
}

// API routes
app.use(router);

// Catch all routes that don't match any previous ones
// and send back the React app's index.html file
app.get('/*', (req, res, _next) => {
  const indexFilePath = isProduction
    ? path.join(__dirname, '../../client', 'build', 'index.html')
    : path.join(__dirname, '../client', 'build', 'index.html');
  res.sendFile(indexFilePath);
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
