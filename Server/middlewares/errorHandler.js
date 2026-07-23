import logger from '../utils/logger.js';
import { sendError } from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(`${err.name || 'Error'}: ${err.message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';
  let code = err.code || null;

  // Joi validation error
  if (err.isJoi || (err.details && Array.isArray(err.details))) {
    statusCode = 400;
    message = err.details ? err.details.map((d) => d.message).join(', ') : err.message;
    code = 'VALIDATION_ERROR';
  }
  // JWT errors
  else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    code = 'UNAUTHORIZED';
  }
  // Mongoose CastError (e.g., bad ObjectId)
  else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for field: ${err.path}`;
    code = 'INVALID_ID';
  }
  // Mongo duplicate key error
  else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value entered for unique field: ${field}`;
    code = 'DUPLICATE_KEY';
  }
  // Generic 500 error masking
  else if (statusCode === 500) {
    message = 'Internal server error';
    code = 'SERVER_ERROR';
  }

  return sendError(res, message, code, statusCode);
};

export default errorHandler;
