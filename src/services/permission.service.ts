import { db } from '../config/firebase.config';
import { UserPermissionUpdateDto } from '../models/user.model';
import { Timestamp } from 'firebase-admin/firestore';
import { logger } from '../utils/logger';
import { Module, Permission } from '../models/permission.model';

export class PermissionService {
  async updateUserModulePermissions(
    userId: string,
    permissionUpdate: UserPermissionUpdateDto
  ): Promise<void> {
    try {
      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const modulePermissions = userData?.modulePermissions || {};

      modulePermissions[permissionUpdate.module] = permissionUpdate.permissions;

      await userRef.update({
        modulePermissions,
        updatedAt: Timestamp.now(),
      });

      logger.info(`Updated permissions for user ${userId} in module ${permissionUpdate.module}`);
    } catch (error: any) {
      logger.error('Error updating permissions:', error);
      throw new Error('Failed to update permissions');
    }
  }

  async getUserPermissions(userId: string): Promise<Record<string, string[]>> {
    try {
      const userDoc = await db.collection('users').doc(userId).get();

      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      return userData?.modulePermissions || {};
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
      const userDoc = await db.collection('users').doc(userId).get();

      if (!userDoc.exists) {
        return false;
      }

      const userData = userDoc.data();

      // Admin has all permissions
      if (userData?.role === 'admin') {
        return true;
      }

      const modulePermissions = userData?.modulePermissions || {};
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

      await db.collection('users').doc(userId).update({
        modulePermissions,
        updatedAt: Timestamp.now(),
      });
    } catch (error: any) {
      logger.error('Error setting default permissions:', error);
      throw new Error('Failed to set default permissions');
    }
  }
}

export const permissionService = new PermissionService();
