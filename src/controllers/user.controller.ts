import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { authService } from '../services/auth.service';
import { permissionService } from '../services/permission.service';
import { ResponseHelper } from '../utils/response';
import { CreateUserDto, UpdateUserDto, UserPermissionUpdateDto } from '../models/user.model';

export class UserController {
  async createUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userData: CreateUserDto = req.body;
      const password = req.body.password;
      const uid = req.body.uid; // Optional: if UID is provided, skip Auth creation

      // If password is provided, create both Auth user and PostgreSQL user record
      if (password) {
        if (!userData.email || !userData.displayName || !password) {
          ResponseHelper.error(res, 'VALIDATION_ERROR', 'Email, display name, and password are required', 400);
          return;
        }

        // Validate password strength
        if (password.length < 8) {
          ResponseHelper.error(res, 'VALIDATION_ERROR', 'Password must be at least 8 characters', 400);
          return;
        }

        const user = await authService.createUserWithAuth({
          ...userData,
          password,
        });
        ResponseHelper.success(res, user, 201);
        return;
      }

      // If UID is provided, create only PostgreSQL user record (for existing Auth users)
      if (uid) {
        const user = await authService.createUser(userData, uid);
        ResponseHelper.success(res, user, 201);
        return;
      }

      // Otherwise, error
      ResponseHelper.error(res, 'VALIDATION_ERROR', 'Either password (for new user) or UID (for existing Auth user) is required', 400);
    } catch (error: any) {
      next(error);
    }
  }

  async getCurrentUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.uid;
      const user = await authService.getUserById(userId);

      if (!user) {
        // User is authenticated but document doesn't exist - return 401 instead of 404
        // This indicates an authentication/setup issue, not a not-found issue
        ResponseHelper.error(res, 'USER_NOT_SETUP', 'User account not properly set up. Please contact administrator.', 401);
        return;
      }

      ResponseHelper.success(res, user);
    } catch (error: any) {
      next(error);
    }
  }

  async getUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await authService.getUserById(id);

      if (!user) {
        ResponseHelper.error(res, 'NOT_FOUND', 'User not found', 404);
        return;
      }

      ResponseHelper.success(res, user);
    } catch (error: any) {
      next(error);
    }
  }

  async getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const offset = (page - 1) * limit;

      const { users, total } = await authService.getAllUsers(limit, offset);
      ResponseHelper.paginated(res, users, page, limit, total);
    } catch (error: any) {
      next(error);
    }
  }

  async updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userData: UpdateUserDto = req.body;

      const user = await authService.updateUser(id, userData);
      ResponseHelper.success(res, user);
    } catch (error: any) {
      next(error);
    }
  }

  async deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await authService.deleteUser(id);
      ResponseHelper.success(res, { message: 'User deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  }

  async updateUserPermissions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const permissionData: UserPermissionUpdateDto = req.body;

      await permissionService.updateUserModulePermissions(id, permissionData);
      const user = await authService.getUserById(id);

      ResponseHelper.success(res, user);
    } catch (error: any) {
      next(error);
    }
  }

  async getUserPermissions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const permissions = await permissionService.getUserPermissions(id);
      ResponseHelper.success(res, permissions);
    } catch (error: any) {
      next(error);
    }
  }
}

export const userController = new UserController();
