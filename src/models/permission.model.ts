export enum Permission {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  ADMIN = 'admin',
}

export enum Module {
  EMPLOYEE_TASK_MANAGER = 'employeeTaskManager',
  PMS = 'pms',
  HUMAN_RESOURCE = 'humanResource',
  MAINTENANCE = 'maintenance',
}

export interface PermissionCheck {
  module: Module;
  permission: Permission;
}

export const DEFAULT_PERMISSIONS: Record<string, string[]> = {
  admin: ['read', 'write', 'delete', 'admin'],
  manager: ['read', 'write'],
  employee: ['read'],
  guest: [],
};
