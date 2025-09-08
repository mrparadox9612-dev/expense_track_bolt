const ErrorResponse = require('../utils/errorResponse');

const notFound = (req, res, next) => {
  const error = new ErrorResponse(`Not found - ${req.originalUrl}`, 404);
  next(error);
};

module.exports = notFound;