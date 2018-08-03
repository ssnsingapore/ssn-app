// Catches and propagates any asynchronous errors so that they can
// be handled by subsequent error-handling middleware
export const asyncWrap = (fn) => {
  if (fn.length <= 3) {
    // Normal express middleware
    return (req, res, next) => {
      fn(req, res, next).catch(next);
    };
  }
  // Error-handling middleware
  return (err, req, res, next) => {
    fn(err, req, res, next).catch(next);
  };
};
