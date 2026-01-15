import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase.config';
import { ResponseHelper } from '../utils/response';
import { logger } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      ResponseHelper.error(res, 'AUTH_REQUIRED', 'Authentication token required', 401);
      return;
    }

    const token = authHeader.split('Bearer ')[1];

    try {
      const decodedToken = await auth.verifyIdToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
      };
      next();
    } catch (error: any) {
      logger.warn('Invalid token:', error.message);
      ResponseHelper.error(res, 'INVALID_TOKEN', 'Invalid or expired token', 401);
      return;
    }
  } catch (error: any) {
    logger.error('Authentication error:', error);
    ResponseHelper.error(res, 'AUTH_ERROR', 'Authentication failed', 500);
    return;
  }
};
