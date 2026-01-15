import apiClient from './api';
import { TaskPriority } from './taskService';

export type TaskFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

export interface TaskMaster {
  id: string;
  title: string;
  description: string;
  plantId: string;
  assignedTo: string;
  assignedBy: string;
  priority: TaskPriority;
  frequency: TaskFrequency;
  frequencyValue?: number;
  frequencyUnit?: 'days' | 'weeks' | 'months';
  startDate?: string; // When the recurring task should start generating
  isActive: boolean;
  tags?: string[];
  estimatedDuration?: number;
  instructions?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastGenerated?: string;
}

export interface CreateTaskMasterDto {
  title: string;
  description: string;
  plantId: string;
  assignedTo: string;
  assignedBy: string;
  priority: TaskPriority;
  frequency: TaskFrequency;
  frequencyValue?: number;
  frequencyUnit?: 'days' | 'weeks' | 'months';
  startDate?: string; // When the recurring task should start generating (ISO date string)
  isActive?: boolean;
  tags?: string[];
  estimatedDuration?: number;
  instructions?: string;
}

export interface TaskMasterFilters {
  plantId?: string;
  assignedTo?: string;
  assignedBy?: string;
  frequency?: TaskFrequency;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export const taskMasterService = {
  getTaskMasters: async (filters?: TaskMasterFilters) => {
    const response = await apiClient.get('/api/v1/employee-task-manager/task-masters', {
      params: filters,
    });
    return response.data;
  },

  getTaskMaster: async (id: string) => {
    const response = await apiClient.get(`/api/v1/employee-task-manager/task-masters/${id}`);
    return response.data.data;
  },

  createTaskMaster: async (taskMasterData: CreateTaskMasterDto) => {
    console.log('Creating task master with data:', taskMasterData);
    console.log('Data breakdown:', {
      title: taskMasterData.title,
      description: taskMasterData.description,
      plantId: taskMasterData.plantId,
      assignedTo: taskMasterData.assignedTo,
      assignedBy: taskMasterData.assignedBy,
      priority: taskMasterData.priority,
      frequency: taskMasterData.frequency,
      frequencyValue: taskMasterData.frequencyValue,
      frequencyUnit: taskMasterData.frequencyUnit,
      estimatedDuration: taskMasterData.estimatedDuration,
      instructions: taskMasterData.instructions,
    });
    try {
      const response = await apiClient.post('/api/v1/employee-task-manager/task-masters', taskMasterData);
      return response.data.data;
    } catch (error: any) {
      console.group('❌ Task Master Creation Error');
      console.error('Full error object:', error);
      console.error('Error response:', error.response);
      if (error.response?.data) {
        console.error('Error response data:', error.response.data);
        if (error.response.data.error) {
          console.error('Error details:', error.response.data.error);
          console.error('Error message:', error.response.data.error.message);
          console.error('Error code:', error.response.data.error.code);
          console.error('Error details object:', error.response.data.error.details);
        }
      }
      console.error('Error message:', error.message);
      console.groupEnd();
      throw error;
    }
  },

  updateTaskMaster: async (id: string, taskMasterData: Partial<CreateTaskMasterDto>) => {
    const response = await apiClient.put(`/api/v1/employee-task-manager/task-masters/${id}`, taskMasterData);
    return response.data.data;
  },

  deleteTaskMaster: async (id: string) => {
    await apiClient.delete(`/api/v1/employee-task-manager/task-masters/${id}`);
  },
};
