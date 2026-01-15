import { Timestamp } from 'firebase-admin/firestore';
import { TaskStatus, TaskPriority } from './task.model';

export interface TaskInstance {
  id: string;
  taskMasterId: string; // Reference to TaskMaster
  title: string; // Copied from master
  description: string; // Copied from master
  plantId: string; // Copied from master
  assignedTo: string; // userId (copied from master)
  assignedBy: string; // userId (copied from master)
  status: TaskStatus;
  priority: TaskPriority; // Copied from master
  dueDate: Timestamp; // Calculated based on frequency
  scheduledDate: Timestamp; // When this task should be performed
  completedAt?: Timestamp;
  tags?: string[];
  attachments?: string[]; // Storage URLs
  notes?: string; // User can add notes when completing
  estimatedDuration: number; // Required: Copied from master (in minutes)
  actualDuration?: number; // Actual time taken (in minutes)
  instructions?: string; // Copied from master
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string; // userId (system or admin)
}

export interface CreateTaskInstanceDto {
  taskMasterId: string;
  scheduledDate: Date | string;
  dueDate: Date | string;
}

export interface UpdateTaskInstanceDto {
  status?: TaskStatus;
  notes?: string;
  actualDuration?: number;
  completedAt?: Date | string;
  attachments?: string[];
}

export interface TaskInstanceQueryParams {
  taskMasterId?: string;
  plantId?: string;
  assignedTo?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  scheduledDateFrom?: Date | string;
  scheduledDateTo?: Date | string;
  dueDateFrom?: Date | string;
  dueDateTo?: Date | string;
  page?: number;
  limit?: number;
}
