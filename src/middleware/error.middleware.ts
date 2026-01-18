import { Request, Response, NextFunction } from 'express';
import { ResponseHelper } from '../utils/response';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error('Error:', {
    error: err.message,
    code: err.code,
    statusCode: err.statusCode,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
  });

  // Permission errors
  if (err.code === 'permission-denied') {
    ResponseHelper.error(res, 'PERMISSION_DENIED', 'Access denied', 403);
    return;
  }

  if (err.code === 'not-found') {
    ResponseHelper.error(res, 'NOT_FOUND', 'Resource not found', 404);
    return;
  }

  // Validation errors (from express-validator)
  if (err.array && typeof err.array === 'function') {
    const validationErrors = err.array();
    ResponseHelper.error(
      res,
      'VALIDATION_ERROR',
      'Validation failed',
      400,
      validationErrors
    );
    return;
  }

  // Default error - preserve original message
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const errorCode = err.code || 'INTERNAL_ERROR';

  ResponseHelper.error(res, errorCode, message, statusCode, {
    originalError: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
