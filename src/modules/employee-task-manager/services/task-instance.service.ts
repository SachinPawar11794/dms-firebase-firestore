import { TaskInstance, CreateTaskInstanceDto, UpdateTaskInstanceDto, TaskInstanceQueryParams } from '../models/task-instance.model';
import { TaskMaster } from '../models/task-master.model';
import { Timestamp } from 'firebase-admin/firestore';
import { logger } from '../../../utils/logger';
import { taskMasterService } from './task-master.service';
import { TaskInstanceRepository } from '../../../repositories/task-instance.repository';
import { TaskMasterRepository } from '../../../repositories/task-master.repository';

export class TaskInstanceService {
  private taskInstanceRepository: TaskInstanceRepository;
  private taskMasterRepository: TaskMasterRepository;

  constructor() {
    this.taskInstanceRepository = new TaskInstanceRepository();
    this.taskMasterRepository = new TaskMasterRepository();
  }
  async createTaskInstance(taskInstanceData: CreateTaskInstanceDto, createdBy: string): Promise<TaskInstance> {
    try {
      // Get the task master to copy data
      const taskMaster = await taskMasterService.getTaskMasterById(taskInstanceData.taskMasterId);
      if (!taskMaster) {
        throw new Error('Task master not found');
      }

      const scheduledDate = taskInstanceData.scheduledDate instanceof Date
        ? Timestamp.fromDate(taskInstanceData.scheduledDate)
        : Timestamp.fromDate(new Date(taskInstanceData.scheduledDate));
      const dueDate = taskInstanceData.dueDate instanceof Date
        ? Timestamp.fromDate(taskInstanceData.dueDate)
        : Timestamp.fromDate(new Date(taskInstanceData.dueDate));

      const scheduledDateObj = scheduledDate instanceof Timestamp ? scheduledDate.toDate() : new Date(scheduledDate);
      const dueDateObj = dueDate instanceof Timestamp ? dueDate.toDate() : new Date(dueDate);

      const taskInstance = await this.taskInstanceRepository.createTaskInstance({
        taskMasterId: taskMaster.id,
        title: taskMaster.title,
        description: taskMaster.description,
        assignedTo: taskMaster.assignedTo,
        assignedBy: taskMaster.assignedBy,
        priority: taskMaster.priority,
        dueDate: dueDateObj,
        scheduledDate: scheduledDateObj,
        createdBy,
      });

      return taskInstance;
    } catch (error: any) {
      logger.error('Error creating task instance:', error);
      throw new Error('Failed to create task instance');
    }
  }

  async getTaskInstanceById(taskInstanceId: string): Promise<TaskInstance | null> {
    try {
      return await this.taskInstanceRepository.findById(taskInstanceId);
    } catch (error: any) {
      logger.error('Error getting task instance:', error);
      throw new Error('Failed to get task instance');
    }
  }

  async getTaskInstances(queryParams: TaskInstanceQueryParams): Promise<{ taskInstances: TaskInstance[]; total: number }> {
    try {
      const limit = queryParams.limit || 50;
      const page = queryParams.page || 1;
      const offset = (page - 1) * limit;

      const filters: any = {};
      if (queryParams.assignedTo) filters.assignedTo = queryParams.assignedTo;
      if (queryParams.taskMasterId) filters.taskMasterId = queryParams.taskMasterId;
      if (queryParams.status) filters.status = queryParams.status;
      
      // Date filters
      if (queryParams.scheduledDateFrom) {
        filters.scheduledDateFrom = queryParams.scheduledDateFrom instanceof Date 
          ? queryParams.scheduledDateFrom 
          : new Date(queryParams.scheduledDateFrom);
      }
      if (queryParams.scheduledDateTo) {
        filters.scheduledDateTo = queryParams.scheduledDateTo instanceof Date 
          ? queryParams.scheduledDateTo 
          : new Date(queryParams.scheduledDateTo);
      }
      if (queryParams.dueDateFrom) {
        filters.dueDateFrom = queryParams.dueDateFrom instanceof Date 
          ? queryParams.dueDateFrom 
          : new Date(queryParams.dueDateFrom);
      }
      if (queryParams.dueDateTo) {
        filters.dueDateTo = queryParams.dueDateTo instanceof Date 
          ? queryParams.dueDateTo 
          : new Date(queryParams.dueDateTo);
      }

      const taskInstances = await this.taskInstanceRepository.findWithFilters(filters, limit, offset);
      const total = await this.taskInstanceRepository.count(filters);

      return { taskInstances, total };
    } catch (error: any) {
      logger.error('Error getting task instances:', error);
      throw new Error(`Failed to get task instances: ${error.message || 'Unknown error'}`);
    }
  }

  async updateTaskInstance(taskInstanceId: string, taskInstanceData: UpdateTaskInstanceDto): Promise<TaskInstance> {
    try {
      const updateData: any = {};

      if (taskInstanceData.status !== undefined) {
        updateData.status = taskInstanceData.status;
      }
      if (taskInstanceData.notes !== undefined) {
        updateData.notes = taskInstanceData.notes;
      }
      if (taskInstanceData.actualDuration !== undefined) {
        updateData.actualDuration = taskInstanceData.actualDuration;
      }

      // If status is completed and completedAt is not provided, set it to now
      if (taskInstanceData.status === 'completed' && !taskInstanceData.completedAt) {
        updateData.completedAt = Timestamp.now();
      } else if (taskInstanceData.completedAt) {
        updateData.completedAt = taskInstanceData.completedAt instanceof Date
          ? Timestamp.fromDate(taskInstanceData.completedAt)
          : Timestamp.fromDate(new Date(taskInstanceData.completedAt));
      }

      const updatedTaskInstance = await this.taskInstanceRepository.updateTaskInstance(taskInstanceId, updateData);
      if (!updatedTaskInstance) {
        throw new Error('Task instance not found');
      }

      return updatedTaskInstance;
    } catch (error: any) {
      logger.error('Error updating task instance:', error);
      throw new Error('Failed to update task instance');
    }
  }

  async deleteTaskInstance(taskInstanceId: string): Promise<void> {
    try {
      const deleted = await this.taskInstanceRepository.delete(taskInstanceId);
      if (!deleted) {
        throw new Error('Task instance not found');
      }
    } catch (error: any) {
      logger.error('Error deleting task instance:', error);
      throw new Error('Failed to delete task instance');
    }
  }

  /**
   * Generate task instances from active task masters based on their frequency
   * This should be called by a scheduled job (Cloud Function)
   */
  async generateTasksFromMasters(): Promise<{ generated: number; errors: number }> {
    try {
      const activeMasters = await taskMasterService.getActiveTaskMasters();
      let generated = 0;
      let errors = 0;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      for (const master of activeMasters) {
        try {
          // Check if we need to generate tasks for this master
          const shouldGenerate = this.shouldGenerateTask(master, today);
          
          if (!shouldGenerate) {
            continue;
          }

          // Calculate scheduled date and due date based on frequency
          const { scheduledDate, dueDate } = this.calculateTaskDates(master, today);

          // Check if task instance already exists for this scheduled date
          const existingInstance = await this.getTaskInstanceForDate(master.id, scheduledDate);
          if (existingInstance) {
            continue; // Skip if already generated
          }

          // Create task instance
          await this.createTaskInstance(
            {
              taskMasterId: master.id,
              scheduledDate: scheduledDate.toISOString(),
              dueDate: dueDate.toISOString(),
            },
            'system'
          );

          // Update lastGenerated timestamp - use repository directly
          await this.taskMasterRepository.updateTaskMaster(master.id, {
            lastGenerated: Timestamp.now(),
          } as any);

          generated++;
        } catch (error: any) {
          logger.error(`Error generating task from master ${master.id}:`, error);
          errors++;
        }
      }

      return { generated, errors };
    } catch (error: any) {
      logger.error('Error generating tasks from masters:', error);
      throw new Error('Failed to generate tasks from masters');
    }
  }

  private shouldGenerateTask(master: TaskMaster, today: Date): boolean {
    if (!master.isActive) {
      return false;
    }

    // Check if startDate is set and if today is before startDate
    if (master.startDate) {
      const startDate = master.startDate.toDate();
      const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      if (todayOnly < startDateOnly) {
        return false; // Don't generate tasks before start date
      }
    }

    const lastGenerated = master.lastGenerated?.toDate();
    
    switch (master.frequency) {
      case 'daily':
        return !lastGenerated || lastGenerated < today;
      
      case 'weekly':
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);
        return !lastGenerated || lastGenerated < lastWeek;
      
      case 'monthly':
        const lastMonth = new Date(today);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        return !lastGenerated || lastGenerated < lastMonth;
      
      case 'quarterly':
        const lastQuarter = new Date(today);
        lastQuarter.setMonth(lastQuarter.getMonth() - 3);
        return !lastGenerated || lastGenerated < lastQuarter;
      
      case 'yearly':
        const lastYear = new Date(today);
        lastYear.setFullYear(lastYear.getFullYear() - 1);
        return !lastGenerated || lastGenerated < lastYear;
      
      case 'custom':
        if (master.frequencyValue && master.frequencyUnit) {
          const lastCustom = new Date(today);
          if (master.frequencyUnit === 'days') {
            lastCustom.setDate(lastCustom.getDate() - master.frequencyValue);
          } else if (master.frequencyUnit === 'weeks') {
            lastCustom.setDate(lastCustom.getDate() - (master.frequencyValue * 7));
          } else if (master.frequencyUnit === 'months') {
            lastCustom.setMonth(lastCustom.getMonth() - master.frequencyValue);
          }
          return !lastGenerated || lastGenerated < lastCustom;
        }
        return false;
      
      default:
        return false;
    }
  }

  private calculateTaskDates(master: TaskMaster, baseDate: Date): { scheduledDate: Date; dueDate: Date } {
    const scheduledDate = new Date(baseDate);
    const dueDate = new Date(baseDate);

    switch (master.frequency) {
      case 'daily':
        // Scheduled today, due today
        break;
      
      case 'weekly':
        // Scheduled today, due in 7 days
        dueDate.setDate(dueDate.getDate() + 7);
        break;
      
      case 'monthly':
        // Scheduled today, due in 30 days
        dueDate.setDate(dueDate.getDate() + 30);
        break;
      
      case 'quarterly':
        // Scheduled today, due in 90 days
        dueDate.setDate(dueDate.getDate() + 90);
        break;
      
      case 'yearly':
        // Scheduled today, due in 365 days
        dueDate.setDate(dueDate.getDate() + 365);
        break;
      
      case 'custom':
        if (master.frequencyValue && master.frequencyUnit) {
          if (master.frequencyUnit === 'days') {
            dueDate.setDate(dueDate.getDate() + master.frequencyValue);
          } else if (master.frequencyUnit === 'weeks') {
            dueDate.setDate(dueDate.getDate() + (master.frequencyValue * 7));
          } else if (master.frequencyUnit === 'months') {
            dueDate.setMonth(dueDate.getMonth() + master.frequencyValue);
          }
        }
        break;
    }

    return { scheduledDate, dueDate };
  }

  private async getTaskInstanceForDate(taskMasterId: string, scheduledDate: Date): Promise<TaskInstance | null> {
    try {
      const startOfDay = new Date(scheduledDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(scheduledDate);
      endOfDay.setHours(23, 59, 59, 999);

      const instances = await this.taskInstanceRepository.findWithFilters({
        taskMasterId,
        scheduledDateFrom: startOfDay,
        scheduledDateTo: endOfDay,
      }, 1);

      return instances.length > 0 ? instances[0] : null;
    } catch (error: any) {
      logger.error('Error getting task instance for date:', error);
      return null;
    }
  }
}

export const taskInstanceService = new TaskInstanceService();
