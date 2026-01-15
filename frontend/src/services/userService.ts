import apiClient from './api';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'manager' | 'employee' | 'guest';
  modulePermissions: {
    [module: string]: string[];
  };
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
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
  password?: string; // Required for new users
  modulePermissions?: {
    [module: string]: string[];
  };
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
  modulePermissions?: {
    [module: string]: string[];
  };
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

export const userService = {
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await apiClient.get('/api/v1/users/me');
      return response.data.data;
    } catch (error: any) {
      // If 404 or 401, user is not logged in - return null
      if (error.response?.status === 404 || error.response?.status === 401) {
        return null;
      }
      throw error;
    }
  },

  getAllUsers: async (page = 1, limit = 50) => {
    const response = await apiClient.get('/api/v1/users', {
      params: { page, limit },
    });
    return response.data;
  },

  getUser: async (id: string): Promise<User> => {
    const response = await apiClient.get(`/api/v1/users/${id}`);
    return response.data.data;
  },

  createUser: async (userData: CreateUserDto): Promise<User> => {
    const response = await apiClient.post('/api/v1/users', userData);
    return response.data.data;
  },

  updateUser: async (id: string, userData: UpdateUserDto): Promise<User> => {
    const response = await apiClient.put(`/api/v1/users/${id}`, userData);
    return response.data.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/users/${id}`);
  },

  updateUserPermissions: async (id: string, permissionData: UserPermissionUpdateDto): Promise<User> => {
    const response = await apiClient.put(`/api/v1/users/${id}/permissions`, permissionData);
    return response.data.data;
  },

  getUserPermissions: async (id: string) => {
    const response = await apiClient.get(`/api/v1/users/${id}/permissions`);
    return response.data.data;
  },
};
