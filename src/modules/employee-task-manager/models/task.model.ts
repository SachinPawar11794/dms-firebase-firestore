import { Timestamp } from 'firebase-admin/firestore';

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string; // userId
  assignedBy: string; // userId
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string; // userId
  tags?: string[];
  attachments?: string[]; // Storage URLs
}

export interface CreateTaskDto {
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  priority: TaskPriority;
  dueDate: Date | string;
  tags?: string[];
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  assignedTo?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date | string;
  tags?: string[];
}

export interface TaskQueryParams {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
  assignedBy?: string;
  page?: number;
  limit?: number;
}
