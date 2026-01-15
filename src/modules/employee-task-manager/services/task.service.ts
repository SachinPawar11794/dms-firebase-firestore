import { db } from '../../../config/firebase.config';
import { Task, CreateTaskDto, UpdateTaskDto, TaskQueryParams } from '../models/task.model';
import { Timestamp } from 'firebase-admin/firestore';
import { logger } from '../../../utils/logger';

export class TaskService {
  async createTask(taskData: CreateTaskDto, createdBy: string): Promise<Task> {
    try {
      const now = Timestamp.now();
      const dueDate = taskData.dueDate instanceof Date
        ? Timestamp.fromDate(taskData.dueDate)
        : Timestamp.fromDate(new Date(taskData.dueDate));

      const task: Omit<Task, 'id'> = {
        title: taskData.title,
        description: taskData.description,
        assignedTo: taskData.assignedTo,
        assignedBy: taskData.assignedBy,
        status: 'pending',
        priority: taskData.priority,
        dueDate,
        createdAt: now,
        updatedAt: now,
        createdBy,
        tags: taskData.tags || [],
        attachments: [],
      };

      const docRef = await db.collection('tasks').add(task);

      return {
        id: docRef.id,
        ...task,
      };
    } catch (error: any) {
      logger.error('Error creating task:', error);
      throw new Error('Failed to create task');
    }
  }

  async getTaskById(taskId: string): Promise<Task | null> {
    try {
      const taskDoc = await db.collection('tasks').doc(taskId).get();

      if (!taskDoc.exists) {
        return null;
      }

      return {
        id: taskDoc.id,
        ...(taskDoc.data() as Omit<Task, 'id'>),
      };
    } catch (error: any) {
      logger.error('Error getting task:', error);
      throw new Error('Failed to get task');
    }
  }

  async getTasks(queryParams: TaskQueryParams): Promise<{ tasks: Task[]; total: number }> {
    try {
      let query: FirebaseFirestore.Query = db.collection('tasks');

      // Apply filters
      if (queryParams.status) {
        query = query.where('status', '==', queryParams.status);
      }
      if (queryParams.priority) {
        query = query.where('priority', '==', queryParams.priority);
      }
      if (queryParams.assignedTo) {
        query = query.where('assignedTo', '==', queryParams.assignedTo);
      }
      if (queryParams.assignedBy) {
        query = query.where('assignedBy', '==', queryParams.assignedBy);
      }

      // Order by creation date
      query = query.orderBy('createdAt', 'desc');

      // Pagination
      const limit = queryParams.limit || 50;
      const page = queryParams.page || 1;
      const offset = (page - 1) * limit;

      const tasksSnapshot = await query.limit(limit).offset(offset).get();
      const totalSnapshot = await query.count().get();
      const total = totalSnapshot.data().count;

      const tasks: Task[] = tasksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Task, 'id'>),
      }));

      return { tasks, total };
    } catch (error: any) {
      logger.error('Error getting tasks:', error);
      throw new Error('Failed to get tasks');
    }
  }

  async updateTask(taskId: string, taskData: UpdateTaskDto): Promise<Task> {
    try {
      const updateData: any = {
        ...taskData,
        updatedAt: Timestamp.now(),
      };

      if (taskData.dueDate) {
        updateData.dueDate = taskData.dueDate instanceof Date
          ? Timestamp.fromDate(taskData.dueDate)
          : Timestamp.fromDate(new Date(taskData.dueDate));
      }

      await db.collection('tasks').doc(taskId).update(updateData);

      const updatedTask = await this.getTaskById(taskId);
      if (!updatedTask) {
        throw new Error('Task not found after update');
      }

      return updatedTask;
    } catch (error: any) {
      logger.error('Error updating task:', error);
      throw new Error('Failed to update task');
    }
  }

  async updateTaskStatus(taskId: string, status: Task['status']): Promise<Task> {
    try {
      await db.collection('tasks').doc(taskId).update({
        status,
        updatedAt: Timestamp.now(),
      });

      const updatedTask = await this.getTaskById(taskId);
      if (!updatedTask) {
        throw new Error('Task not found after update');
      }

      return updatedTask;
    } catch (error: any) {
      logger.error('Error updating task status:', error);
      throw new Error('Failed to update task status');
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    try {
      await db.collection('tasks').doc(taskId).delete();
    } catch (error: any) {
      logger.error('Error deleting task:', error);
      throw new Error('Failed to delete task');
    }
  }
}

export const taskService = new TaskService();
