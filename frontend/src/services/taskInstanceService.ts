import apiClient from './api';
import { TaskStatus, TaskPriority } from './taskService';

export interface TaskInstance {
  id: string;
  taskMasterId: string;
  title: string;
  description: string;
  plantId: string;
  assignedTo: string;
  assignedBy: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  scheduledDate: string;
  completedAt?: string;
  tags?: string[];
  attachments?: string[];
  notes?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  instructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInstanceDto {
  taskMasterId: string;
  scheduledDate: string;
  dueDate: string;
}

export interface UpdateTaskInstanceDto {
  status?: TaskStatus;
  notes?: string;
  actualDuration?: number;
  completedAt?: string;
  attachments?: string[];
}

export interface TaskInstanceFilters {
  taskMasterId?: string;
  plantId?: string;
  assignedTo?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  scheduledDateFrom?: string;
  scheduledDateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  page?: number;
  limit?: number;
}

export const taskInstanceService = {
  getTaskInstances: async (filters?: TaskInstanceFilters) => {
    const response = await apiClient.get('/api/v1/employee-task-manager/task-instances', {
      params: filters,
    });
    return response.data;
  },

  getMyTasks: async (filters?: Omit<TaskInstanceFilters, 'assignedTo'>) => {
    try {
      const response = await apiClient.get('/api/v1/employee-task-manager/task-instances/my-tasks', {
        params: filters,
      });
      return response.data;
    } catch (error: any) {
      // If 404 or 401, user is not logged in - return empty data
      if (error.response?.status === 404 || error.response?.status === 401) {
        return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
      }
      throw error;
    }
  },

  getTaskInstance: async (id: string) => {
    const response = await apiClient.get(`/api/v1/employee-task-manager/task-instances/${id}`);
    return response.data.data;
  },

  createTaskInstance: async (taskInstanceData: CreateTaskInstanceDto) => {
    const response = await apiClient.post('/api/v1/employee-task-manager/task-instances', taskInstanceData);
    return response.data.data;
  },

  updateTaskInstance: async (id: string, taskInstanceData: UpdateTaskInstanceDto) => {
    const response = await apiClient.put(`/api/v1/employee-task-manager/task-instances/${id}`, taskInstanceData);
    return response.data.data;
  },

  deleteTaskInstance: async (id: string) => {
    await apiClient.delete(`/api/v1/employee-task-manager/task-instances/${id}`);
  },

  generateTasks: async () => {
    const response = await apiClient.post('/api/v1/employee-task-manager/task-instances/generate');
    return response.data.data;
  },
};
