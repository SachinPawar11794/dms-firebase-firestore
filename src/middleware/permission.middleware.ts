import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { ResponseHelper } from '../utils/response';
import { logger } from '../utils/logger';
import { Module, Permission } from '../models/permission.model';
import { UserRepository } from '../repositories/user.repository';

export const checkPermission = (module: Module, permission: Permission) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        ResponseHelper.error(res, 'AUTH_REQUIRED', 'Authentication required', 401);
        return;
      }

      const userId = req.user.uid;
      const userRepository = new UserRepository();

      // Get user from PostgreSQL
      const user = await userRepository.findByFirebaseUid(userId);

      if (!user) {
        // User is authenticated but document doesn't exist - return 401 instead of 404
        // This indicates an authentication/setup issue, not a not-found issue
        ResponseHelper.error(res, 'USER_NOT_SETUP', 'User account not properly set up. Please contact administrator.', 401);
        return;
      }

      const modulePermissions = user.modulePermissions || {};

      // Check if user has admin role (full access)
      if (user.role === 'admin') {
        next();
        return;
      }

      // Check module-specific permissions
      const permissions = modulePermissions[module] || [];

      // Check if user has the required permission
      if (!permissions.includes(permission) && !permissions.includes('admin')) {
        logger.warn(`Permission denied: User ${userId} attempted to access ${module} with ${permission}`);
        ResponseHelper.error(
          res,
          'PERMISSION_DENIED',
          `Insufficient permissions for ${module} module`,
          403
        );
        return;
      }

      next();
    } catch (error: any) {
      logger.error('Permission check error:', error);
      ResponseHelper.error(res, 'PERMISSION_ERROR', 'Permission check failed', 500);
      return;
    }
  };
};

// Middleware to require admin role
export const requireAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      ResponseHelper.error(res, 'AUTH_REQUIRED', 'Authentication required', 401);
      return;
    }

    const userId = req.user.uid;
    const userRepository = new UserRepository();
    const user = await userRepository.findByFirebaseUid(userId);

    if (!user) {
      ResponseHelper.error(res, 'USER_NOT_SETUP', 'User account not properly set up. Please contact administrator.', 401);
      return;
    }

    if (user.role !== 'admin') {
      logger.warn(`Admin access denied: User ${userId} attempted admin operation`);
      ResponseHelper.error(res, 'ADMIN_REQUIRED', 'Admin role required', 403);
      return;
    }

    next();
  } catch (error: any) {
    logger.error('Admin check error:', error);
    ResponseHelper.error(res, 'PERMISSION_ERROR', 'Permission check failed', 500);
    return;
  }
};
