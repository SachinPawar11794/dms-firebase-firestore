import { TaskMaster, CreateTaskMasterDto, UpdateTaskMasterDto, TaskMasterQueryParams } from '../models/task-master.model';
import { logger } from '../../../utils/logger';
import { TaskMasterRepository } from '../../../repositories/task-master.repository';

export class TaskMasterService {
  private taskMasterRepository: TaskMasterRepository;

  constructor() {
    this.taskMasterRepository = new TaskMasterRepository();
  }
  async createTaskMaster(taskMasterData: CreateTaskMasterDto, createdBy: string): Promise<TaskMaster> {
    try {
      // Validate required fields
      if (!taskMasterData.title || !taskMasterData.description || !taskMasterData.plantId || !taskMasterData.assignedTo || !taskMasterData.assignedBy) {
        throw new Error('Missing required fields: title, description, plantId, assignedTo, and assignedBy are required');
      }

      // Validate startDate is provided (required field)
      if (!taskMasterData.startDate) {
        throw new Error('startDate is required: Task generation start date must be provided');
      }

      // Build custom schedule if frequency is 'custom'
      const customSchedule: any = {};
      if (taskMasterData.frequency === 'custom') {
        if (taskMasterData.frequencyValue !== undefined && taskMasterData.frequencyValue !== null) {
          customSchedule.frequencyValue = taskMasterData.frequencyValue;
        }
        if (taskMasterData.frequencyUnit !== undefined && taskMasterData.frequencyUnit !== null) {
          customSchedule.frequencyUnit = taskMasterData.frequencyUnit;
        }
      }

      // Validate and set estimatedDuration (required field)
      if (!taskMasterData.estimatedDuration || taskMasterData.estimatedDuration <= 0) {
        throw new Error('estimatedDuration is required and must be greater than 0');
      }

      const taskMaster = await this.taskMasterRepository.createTaskMaster({
        title: taskMasterData.title.trim(),
        description: taskMasterData.description.trim(),
        plantId: taskMasterData.plantId,
        assignedTo: taskMasterData.assignedTo,
        assignedToDepartment: undefined, // Can be added later if needed
        priority: taskMasterData.priority,
        frequency: taskMasterData.frequency,
        customSchedule: Object.keys(customSchedule).length > 0 ? customSchedule : undefined,
        estimatedDuration: taskMasterData.estimatedDuration,
        isActive: true,
        createdBy: createdBy,
      });

      return taskMaster;
    } catch (error: any) {
      logger.error('Error creating task master:', {
        error: error.message,
        code: error.code,
        stack: error.stack,
        name: error.name,
        taskMasterData: {
          title: taskMasterData.title,
          plantId: taskMasterData.plantId,
          assignedTo: taskMasterData.assignedTo,
          assignedBy: taskMasterData.assignedBy,
        },
      });
      
      throw error;
    }
  }

  async getTaskMasterById(taskMasterId: string): Promise<TaskMaster | null> {
    try {
      return await this.taskMasterRepository.findById(taskMasterId);
    } catch (error: any) {
      logger.error('Error getting task master:', error);
      throw new Error('Failed to get task master');
    }
  }

  async getTaskMasters(queryParams: TaskMasterQueryParams): Promise<{ taskMasters: TaskMaster[]; total: number }> {
    try {
      const limit = queryParams.limit || 50;
      const page = queryParams.page || 1;
      const offset = (page - 1) * limit;

      const filters: any = {};
      if (queryParams.plantId) filters.plantId = queryParams.plantId;
      if (queryParams.assignedTo) filters.assignedTo = queryParams.assignedTo;
      if (queryParams.assignedBy) filters.assignedBy = queryParams.assignedBy;
      if (queryParams.frequency) filters.frequency = queryParams.frequency;
      if (queryParams.isActive !== undefined) filters.isActive = queryParams.isActive;

      const taskMasters = await this.taskMasterRepository.findWithFilters(filters, limit, offset);
      const total = await this.taskMasterRepository.count(filters);

      return { taskMasters, total };
    } catch (error: any) {
      logger.error('Error getting task masters:', error);
      throw new Error(`Failed to get task masters: ${error.message || 'Unknown error'}`);
    }
  }

  async updateTaskMaster(taskMasterId: string, taskMasterData: UpdateTaskMasterDto): Promise<TaskMaster> {
    try {
      const updateData: Partial<TaskMaster> = {};

      if (taskMasterData.title !== undefined) {
        updateData.title = taskMasterData.title.trim();
      }
      if (taskMasterData.description !== undefined) {
        updateData.description = taskMasterData.description.trim();
      }
      if (taskMasterData.plantId !== undefined) {
        updateData.plantId = taskMasterData.plantId;
      }
      if (taskMasterData.assignedTo !== undefined) {
        updateData.assignedTo = taskMasterData.assignedTo;
      }
      if (taskMasterData.priority !== undefined) {
        updateData.priority = taskMasterData.priority;
      }
      if (taskMasterData.frequency !== undefined) {
        updateData.frequency = taskMasterData.frequency;
      }
      if (taskMasterData.frequencyValue !== undefined) {
        updateData.frequencyValue = taskMasterData.frequencyValue;
      }
      if (taskMasterData.frequencyUnit !== undefined) {
        updateData.frequencyUnit = taskMasterData.frequencyUnit;
      }
      if (taskMasterData.isActive !== undefined) {
        updateData.isActive = taskMasterData.isActive;
      }
      if (taskMasterData.tags !== undefined) {
        updateData.tags = taskMasterData.tags;
      }
      if (taskMasterData.estimatedDuration !== undefined) {
        updateData.estimatedDuration = taskMasterData.estimatedDuration;
      }
      if (taskMasterData.instructions !== undefined) {
        updateData.instructions = taskMasterData.instructions.trim();
      }

      const updatedTaskMaster = await this.taskMasterRepository.updateTaskMaster(taskMasterId, updateData);
      if (!updatedTaskMaster) {
        throw new Error('Task master not found');
      }

      return updatedTaskMaster;
    } catch (error: any) {
      logger.error('Error updating task master:', error);
      throw new Error('Failed to update task master');
    }
  }

  async deleteTaskMaster(taskMasterId: string): Promise<void> {
    try {
      const deleted = await this.taskMasterRepository.delete(taskMasterId);
      if (!deleted) {
        throw new Error('Task master not found');
      }
    } catch (error: any) {
      logger.error('Error deleting task master:', error);
      throw new Error('Failed to delete task master');
    }
  }

  async getActiveTaskMasters(): Promise<TaskMaster[]> {
    try {
      return await this.taskMasterRepository.findWithFilters({ isActive: true });
    } catch (error: any) {
      logger.error('Error getting active task masters:', error);
      throw new Error('Failed to get active task masters');
    }
  }
}

export const taskMasterService = new TaskMasterService();
