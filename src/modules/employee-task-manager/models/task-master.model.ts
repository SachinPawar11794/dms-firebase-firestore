import { Timestamp } from 'firebase-admin/firestore';
import { TaskPriority } from './task.model';

export type TaskFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

export interface TaskMaster {
  id: string;
  title: string;
  description: string;
  plantId: string; // Plant ID
  assignedTo: string; // userId (employee)
  assignedBy: string; // userId (manager/admin)
  priority: TaskPriority;
  frequency: TaskFrequency;
  frequencyValue?: number; // For custom frequency (e.g., every 3 days)
  frequencyUnit?: 'days' | 'weeks' | 'months'; // For custom frequency
  startDate: Timestamp; // Required: When the recurring task should start generating
  isActive: boolean;
  tags?: string[];
  estimatedDuration: number; // Required: Estimated time in minutes
  instructions?: string; // Detailed instructions for the task
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string; // userId
  lastGenerated?: Timestamp; // Last time tasks were generated from this master
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
  startDate: Date | string; // Required: When the recurring task should start generating
  tags?: string[];
  estimatedDuration: number; // Required: Estimated time in minutes
  instructions?: string;
}

export interface UpdateTaskMasterDto {
  title?: string;
  description?: string;
  plantId?: string;
  assignedTo?: string;
  priority?: TaskPriority;
  frequency?: TaskFrequency;
  frequencyValue?: number;
  frequencyUnit?: 'days' | 'weeks' | 'months';
  startDate?: Date | string; // When the recurring task should start generating
  isActive?: boolean;
  tags?: string[];
  estimatedDuration?: number;
  instructions?: string;
}

export interface TaskMasterQueryParams {
  plantId?: string;
  assignedTo?: string;
  assignedBy?: string;
  frequency?: TaskFrequency;
  isActive?: boolean;
  page?: number;
  limit?: number;
}
