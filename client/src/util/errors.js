// extracts errors from fetch Response object
export const extractErrors = async (response) => {
  if (!response.hasError) {
    throw Error('Attempt to extract errors from response wih no error!');
  }

  return (await response.json()).errors;
};

export const ErrorFormatLevel = {
  DETAILED: 'detail',
  TITLE: 'title',
};

export const formatErrors = (
  errors,
  level = ErrorFormatLevel.DETAILED,
  base = 'Oops! We\'ve encountered a problem'
) => {
  const errString =
    errors
      .map(error => error[level])
      .join(';');

  if (errString) {
    return `${base}: ${errString}`;
  }

  return base;
};
