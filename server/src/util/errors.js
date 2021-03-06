import createError from 'http-errors';

class InternalServerErrorView {
  constructor() {
    this.status = 500;
    this.title = 'Internal Server Error';
    this.detail = 'Looks like something went wrong. Please try again!';
  }
}

export class BadRequestErrorView {
  constructor(detail) {
    this.status = 400;
    this.title = 'Bad Request';
    this.detail = detail || 'Looks like we had some trouble processing your request.';
  }
}
class NotFoundErrorView {
  constructor() {
    this.status = 404;
    this.title = 'Not Found';
    this.detail = 'The resource you were looking for could not be found.';
  }
}

class UnauthorizedErrorView {
  constructor() {
    this.status = 401;
    this.title = 'Unauthorized';
    this.detail = 'Looks like you\'ve been logged out.';
  }
}

export class ForbiddenErrorView {
  constructor() {
    this.status = 403;
    this.title = 'Forbidden';
    this.detail = 'Looks like you tried to make a forbidden request.';
  }
}

export class UnprocessableEntityErrorView {
  constructor(title, detail) {
    this.status = 422;
    this.title = title;
    this.detail = detail;
  }
}

/**
 * Handles error thrown in controller
 * If it's a mongoose ValidationError,
 * format the error messages
 * If it's a NotFoundError
 * return 404
 * Otherwise return status 500
 *
 * @param {Error} err
 * @returns {Response}
 */
export function handleError(err, res) {
  if (err.name === 'ValidationError') {
    return res
      .status(422)
      .json({ errors: formatValidationErrors(err) });
  }

  if (err.status === 401) {
    return res
      .status(401)
      .json({ errors: [new UnauthorizedErrorView()] });
  }

  if (err.status === 403) {
    return res
      .status(403)
      .json({ errors: [new ForbiddenErrorView()] });
  }

  if (err.status === 404) {
    return res
      .status(404)
      .json({ errors: [new NotFoundErrorView()] });
  }

  console.log('ERROR', err);

  return res
    .status(500)
    .json({ errors: [new InternalServerErrorView()] });
}

export function checkIfFound(resource) {
  if (resource === null) {
    throw createError.NotFound();
  }
}

/**
 * Takes a mongoose ValidationError object
 * and returns errors array to be returned in response
 *
 * @param {ValidationError} err
 * @returns {Array} array of error objects with title and detail
 */
function formatValidationErrors(err) {
  if (err.name !== 'ValidationError') {
    throw Error('Error object to be formatted is not a mongoose ValidationError');
  }

  const errorKeys = Object.keys(err.errors);
  return errorKeys.map((key) => {
    const errorMessage = `${key} ${err.errors[key].message}.`;
    return new UnprocessableEntityErrorView(key, errorMessage);
  });
}

export function constructMongooseValidationError(key, message) {
  const error = new Error();
  error.name = 'ValidationError';
  error.errors = {
    [key]: {
      message,
    },
  };
  error.message = formatValidationErrors(error);
  return error;
}
