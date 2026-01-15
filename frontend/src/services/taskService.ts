import apiClient from './api';

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  createdAt: string;
}

export interface CreateTaskDto {
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
}

export const taskService = {
  getTasks: async (filters?: any) => {
    try {
      const response = await apiClient.get('/api/v1/employee-task-manager/tasks', {
        params: filters,
      });
      return response.data;
    } catch (error: any) {
      // If 404 or 401, user is not logged in - return empty data
      if (error.response?.status === 404 || error.response?.status === 401) {
        return { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
      }
      throw error;
    }
  },

  getTask: async (id: string) => {
    const response = await apiClient.get(`/api/v1/employee-task-manager/tasks/${id}`);
    return response.data.data;
  },

  createTask: async (taskData: CreateTaskDto) => {
    const response = await apiClient.post('/api/v1/employee-task-manager/tasks', taskData);
    return response.data.data;
  },

  updateTask: async (id: string, taskData: Partial<Task>) => {
    const response = await apiClient.put(`/api/v1/employee-task-manager/tasks/${id}`, taskData);
    return response.data.data;
  },

  updateTaskStatus: async (id: string, status: Task['status']) => {
    const response = await apiClient.patch(`/api/v1/employee-task-manager/tasks/${id}/status`, {
      status,
    });
    return response.data.data;
  },

  deleteTask: async (id: string) => {
    await apiClient.delete(`/api/v1/employee-task-manager/tasks/${id}`);
  },
};
