import { Task, CreateTaskDto, UpdateTaskDto, TaskQueryParams } from '../models/task.model';
import { Timestamp } from 'firebase-admin/firestore';
import { logger } from '../../../utils/logger';
import { TaskRepository } from '../../../repositories/task.repository';

export class TaskService {
  private taskRepository: TaskRepository;

  constructor() {
    this.taskRepository = new TaskRepository();
  }

  async createTask(taskData: CreateTaskDto, createdBy: string): Promise<Task> {
    try {
      const dueDate = taskData.dueDate instanceof Date
        ? taskData.dueDate
        : new Date(taskData.dueDate);

      const task = await this.taskRepository.createTask({
        title: taskData.title,
        description: taskData.description,
        assignedTo: taskData.assignedTo,
        assignedBy: taskData.assignedBy,
        priority: taskData.priority,
        dueDate,
        tags: taskData.tags,
        createdBy,
      });

      return task;
    } catch (error: any) {
      logger.error('Error creating task:', error);
      throw new Error('Failed to create task');
    }
  }

  async getTaskById(taskId: string): Promise<Task | null> {
    try {
      return await this.taskRepository.findById(taskId);
    } catch (error: any) {
      logger.error('Error getting task:', error);
      throw new Error('Failed to get task');
    }
  }

  async getTasks(queryParams: TaskQueryParams): Promise<{ tasks: Task[]; total: number }> {
    try {
      const limit = queryParams.limit || 50;
      const page = queryParams.page || 1;
      const offset = (page - 1) * limit;

      const filters: any = {};
      if (queryParams.status) filters.status = queryParams.status;
      if (queryParams.priority) filters.priority = queryParams.priority;
      if (queryParams.assignedTo) filters.assignedTo = queryParams.assignedTo;
      if (queryParams.assignedBy) filters.assignedBy = queryParams.assignedBy;

      const tasks = await this.taskRepository.findWithFilters(filters, limit, offset);
      const total = await this.taskRepository.count(filters);

      return { tasks, total };
    } catch (error: any) {
      logger.error('Error getting tasks:', error);
      throw new Error('Failed to get tasks');
    }
  }

  async updateTask(taskId: string, taskData: UpdateTaskDto): Promise<Task> {
    try {
      const updateData: any = {};

      if (taskData.title !== undefined) updateData.title = taskData.title;
      if (taskData.description !== undefined) updateData.description = taskData.description;
      if (taskData.assignedTo !== undefined) updateData.assignedTo = taskData.assignedTo;
      if (taskData.status !== undefined) updateData.status = taskData.status;
      if (taskData.priority !== undefined) updateData.priority = taskData.priority;
      if (taskData.tags !== undefined) updateData.tags = taskData.tags;

      if (taskData.dueDate) {
        updateData.dueDate = taskData.dueDate instanceof Date
          ? Timestamp.fromDate(taskData.dueDate)
          : Timestamp.fromDate(new Date(taskData.dueDate));
      }

      const updatedTask = await this.taskRepository.updateTask(taskId, updateData);
      if (!updatedTask) {
        throw new Error('Task not found');
      }

      return updatedTask;
    } catch (error: any) {
      logger.error('Error updating task:', error);
      throw new Error('Failed to update task');
    }
  }

  async updateTaskStatus(taskId: string, status: Task['status']): Promise<Task> {
    try {
      const updatedTask = await this.taskRepository.updateTask(taskId, { status });
      if (!updatedTask) {
        throw new Error('Task not found');
      }

      return updatedTask;
    } catch (error: any) {
      logger.error('Error updating task status:', error);
      throw new Error('Failed to update task status');
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    try {
      const deleted = await this.taskRepository.delete(taskId);
      if (!deleted) {
        throw new Error('Task not found');
      }
    } catch (error: any) {
      logger.error('Error deleting task:', error);
      throw new Error('Failed to delete task');
    }
  }
}

export const taskService = new TaskService();
