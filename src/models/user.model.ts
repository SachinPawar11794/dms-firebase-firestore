import { Timestamp } from 'firebase-admin/firestore';

export interface ModulePermission {
  [moduleName: string]: string[]; // e.g., ['read', 'write', 'delete']
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'manager' | 'employee' | 'guest';
  modulePermissions: ModulePermission;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
  employeeId?: string;
  plant?: string;
  department?: string;
  designation?: string;
  contactNo?: string;
}

export interface CreateUserDto {
  email: string;
  displayName: string;
  role: 'admin' | 'manager' | 'employee' | 'guest';
  modulePermissions?: ModulePermission;
  isActive?: boolean;
  employeeId?: string;
  plant?: string;
  department?: string;
  designation?: string;
  contactNo?: string;
}

export interface UpdateUserDto {
  displayName?: string;
  role?: 'admin' | 'manager' | 'employee' | 'guest';
  modulePermissions?: ModulePermission;
  isActive?: boolean;
  employeeId?: string;
  plant?: string;
  department?: string;
  designation?: string;
  contactNo?: string;
}

export interface UserPermissionUpdateDto {
  module: string;
  permissions: string[];
}
