import { UserPermissionUpdateDto } from '../models/user.model';
import { logger } from '../utils/logger';
import { Module, Permission } from '../models/permission.model';
import { UserRepository } from '../repositories/user.repository';

export class PermissionService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }
  async updateUserModulePermissions(
    userId: string,
    permissionUpdate: UserPermissionUpdateDto
  ): Promise<void> {
    try {
      const user = await this.userRepository.findByFirebaseUid(userId);

      if (!user) {
        throw new Error('User not found');
      }

      const modulePermissions = user.modulePermissions || {};
      modulePermissions[permissionUpdate.module] = permissionUpdate.permissions;

      await this.userRepository.updateByFirebaseUid(userId, {
        modulePermissions,
      });

      logger.info(`Updated permissions for user ${userId} in module ${permissionUpdate.module}`);
    } catch (error: any) {
      logger.error('Error updating permissions:', error);
      throw new Error('Failed to update permissions');
    }
  }

  async getUserPermissions(userId: string): Promise<Record<string, string[]>> {
    try {
      const user = await this.userRepository.findByFirebaseUid(userId);

      if (!user) {
        throw new Error('User not found');
      }

      return user.modulePermissions || {};
    } catch (error: any) {
      logger.error('Error getting user permissions:', error);
      throw new Error('Failed to get user permissions');
    }
  }

  async hasPermission(
    userId: string,
    module: Module,
    permission: Permission
  ): Promise<boolean> {
    try {
      const user = await this.userRepository.findByFirebaseUid(userId);

      if (!user) {
        return false;
      }

      // Admin has all permissions
      if (user.role === 'admin') {
        return true;
      }

      const modulePermissions = user.modulePermissions || {};
      const permissions = modulePermissions[module] || [];

      return permissions.includes(permission) || permissions.includes('admin');
    } catch (error: any) {
      logger.error('Error checking permission:', error);
      return false;
    }
  }

  async setDefaultPermissionsForRole(userId: string, role: string): Promise<void> {
    try {
      const defaultPermissions: Record<string, string[]> = {
        admin: ['read', 'write', 'delete', 'admin'],
        manager: ['read', 'write'],
        employee: ['read'],
        guest: [],
      };

      const permissions = defaultPermissions[role] || [];

      const modulePermissions: Record<string, string[]> = {
        employeeTaskManager: permissions,
        pms: permissions,
        humanResource: permissions,
        maintenance: permissions,
      };

      await this.userRepository.updateByFirebaseUid(userId, {
        modulePermissions,
      });
    } catch (error: any) {
      logger.error('Error setting default permissions:', error);
      throw new Error('Failed to set default permissions');
    }
  }
}

export const permissionService = new PermissionService();
