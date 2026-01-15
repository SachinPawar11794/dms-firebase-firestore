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

  // Firestore index error
  if (err.code === 'INDEX_REQUIRED' || err.message === 'INDEX_REQUIRED' || err.code === 9) {
    // Extract index URL from error if available
    let indexUrl = err.indexUrl;
    
    // Try to extract from error message if not directly provided
    if (!indexUrl && err.message) {
      const urlMatch = err.message.match(/https:\/\/console\.firebase\.google\.com[^\s]+/);
      if (urlMatch) {
        indexUrl = urlMatch[0];
      }
    }
    
    // Fallback to Firebase Console indexes page
    if (!indexUrl && process.env.FIREBASE_PROJECT_ID) {
      indexUrl = `https://console.firebase.google.com/project/${process.env.FIREBASE_PROJECT_ID}/firestore/indexes`;
    }
    
    ResponseHelper.error(
      res,
      'INDEX_REQUIRED',
      'Firestore composite index is required for this query. A link to create the index has been provided.',
      500,
      { 
        indexUrl: indexUrl || 'https://console.firebase.google.com',
        message: 'Please create the required index in Firebase Console. The link will open automatically.',
        details: err.message
      }
    );
    return;
  }

  // Firestore errors
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
