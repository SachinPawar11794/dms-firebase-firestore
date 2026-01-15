import { db } from '../../../config/firebase.config';
import { TaskInstance, CreateTaskInstanceDto, UpdateTaskInstanceDto, TaskInstanceQueryParams } from '../models/task-instance.model';
import { TaskMaster } from '../models/task-master.model';
import { Timestamp } from 'firebase-admin/firestore';
import { logger } from '../../../utils/logger';
import { taskMasterService } from './task-master.service';

export class TaskInstanceService {
  async createTaskInstance(taskInstanceData: CreateTaskInstanceDto, createdBy: string): Promise<TaskInstance> {
    try {
      // Get the task master to copy data
      const taskMaster = await taskMasterService.getTaskMasterById(taskInstanceData.taskMasterId);
      if (!taskMaster) {
        throw new Error('Task master not found');
      }

      const now = Timestamp.now();
      const scheduledDate = taskInstanceData.scheduledDate instanceof Date
        ? Timestamp.fromDate(taskInstanceData.scheduledDate)
        : Timestamp.fromDate(new Date(taskInstanceData.scheduledDate));
      const dueDate = taskInstanceData.dueDate instanceof Date
        ? Timestamp.fromDate(taskInstanceData.dueDate)
        : Timestamp.fromDate(new Date(taskInstanceData.dueDate));

      const taskInstance: Omit<TaskInstance, 'id'> = {
        taskMasterId: taskMaster.id,
        title: taskMaster.title,
        description: taskMaster.description,
        plantId: taskMaster.plantId,
        assignedTo: taskMaster.assignedTo,
        assignedBy: taskMaster.assignedBy,
        status: 'pending',
        priority: taskMaster.priority,
        scheduledDate,
        dueDate,
        tags: taskMaster.tags || [],
        estimatedDuration: taskMaster.estimatedDuration,
        instructions: taskMaster.instructions,
        createdAt: now,
        updatedAt: now,
        createdBy,
      };

      const docRef = await db.collection('taskInstances').add(taskInstance);

      // Convert Timestamps to ISO strings for JSON serialization
      const response: any = {
        id: docRef.id,
        ...taskInstance,
      };
      
      if (response.scheduledDate instanceof Timestamp) {
        response.scheduledDate = response.scheduledDate.toDate().toISOString();
      }
      if (response.dueDate instanceof Timestamp) {
        response.dueDate = response.dueDate.toDate().toISOString();
      }
      if (response.completedAt instanceof Timestamp) {
        response.completedAt = response.completedAt.toDate().toISOString();
      }
      if (response.createdAt instanceof Timestamp) {
        response.createdAt = response.createdAt.toDate().toISOString();
      }
      if (response.updatedAt instanceof Timestamp) {
        response.updatedAt = response.updatedAt.toDate().toISOString();
      }
      
      return response;
    } catch (error: any) {
      logger.error('Error creating task instance:', error);
      throw new Error('Failed to create task instance');
    }
  }

  async getTaskInstanceById(taskInstanceId: string): Promise<TaskInstance | null> {
    try {
      const taskInstanceDoc = await db.collection('taskInstances').doc(taskInstanceId).get();

      if (!taskInstanceDoc.exists) {
        return null;
      }

      const data = taskInstanceDoc.data() as Omit<TaskInstance, 'id'>;
      // Convert Timestamps to ISO strings for JSON serialization
      const instance: any = {
        id: taskInstanceDoc.id,
        ...data,
      };
      
      // Convert Timestamp fields to ISO strings
      if (instance.scheduledDate instanceof Timestamp) {
        instance.scheduledDate = instance.scheduledDate.toDate().toISOString();
      }
      if (instance.dueDate instanceof Timestamp) {
        instance.dueDate = instance.dueDate.toDate().toISOString();
      }
      if (instance.completedAt instanceof Timestamp) {
        instance.completedAt = instance.completedAt.toDate().toISOString();
      }
      if (instance.createdAt instanceof Timestamp) {
        instance.createdAt = instance.createdAt.toDate().toISOString();
      }
      if (instance.updatedAt instanceof Timestamp) {
        instance.updatedAt = instance.updatedAt.toDate().toISOString();
      }
      
      return instance;
    } catch (error: any) {
      logger.error('Error getting task instance:', error);
      throw new Error('Failed to get task instance');
    }
  }

  async getTaskInstances(queryParams: TaskInstanceQueryParams): Promise<{ taskInstances: TaskInstance[]; total: number }> {
    try {
      let query: FirebaseFirestore.Query = db.collection('taskInstances');

      // Apply filters - order matters for Firestore indexes
      // Start with equality filters first
      if (queryParams.assignedTo) {
        query = query.where('assignedTo', '==', queryParams.assignedTo);
      }
      if (queryParams.taskMasterId) {
        query = query.where('taskMasterId', '==', queryParams.taskMasterId);
      }
      if (queryParams.plantId) {
        query = query.where('plantId', '==', queryParams.plantId);
      }
      if (queryParams.status) {
        query = query.where('status', '==', queryParams.status);
      }
      if (queryParams.priority) {
        query = query.where('priority', '==', queryParams.priority);
      }

      // Range filters (these must come after equality filters)
      if (queryParams.scheduledDateFrom) {
        const fromDate = queryParams.scheduledDateFrom instanceof Date
          ? Timestamp.fromDate(queryParams.scheduledDateFrom)
          : Timestamp.fromDate(new Date(queryParams.scheduledDateFrom));
        query = query.where('scheduledDate', '>=', fromDate);
      }
      if (queryParams.scheduledDateTo) {
        const toDate = queryParams.scheduledDateTo instanceof Date
          ? Timestamp.fromDate(queryParams.scheduledDateTo)
          : Timestamp.fromDate(new Date(queryParams.scheduledDateTo));
        query = query.where('scheduledDate', '<=', toDate);
      }

      // Get total count with same filters
      let total = 0;
      try {
        const countQuery = db.collection('taskInstances');
        let countQueryBuilder: FirebaseFirestore.Query = countQuery;
        if (queryParams.assignedTo) {
          countQueryBuilder = countQueryBuilder.where('assignedTo', '==', queryParams.assignedTo);
        }
        if (queryParams.taskMasterId) {
          countQueryBuilder = countQueryBuilder.where('taskMasterId', '==', queryParams.taskMasterId);
        }
        if (queryParams.plantId) {
          countQueryBuilder = countQueryBuilder.where('plantId', '==', queryParams.plantId);
        }
        if (queryParams.status) {
          countQueryBuilder = countQueryBuilder.where('status', '==', queryParams.status);
        }
        if (queryParams.priority) {
          countQueryBuilder = countQueryBuilder.where('priority', '==', queryParams.priority);
        }
        if (queryParams.scheduledDateFrom) {
          const fromDate = queryParams.scheduledDateFrom instanceof Date
            ? Timestamp.fromDate(queryParams.scheduledDateFrom)
            : Timestamp.fromDate(new Date(queryParams.scheduledDateFrom));
          countQueryBuilder = countQueryBuilder.where('scheduledDate', '>=', fromDate);
        }
        if (queryParams.scheduledDateTo) {
          const toDate = queryParams.scheduledDateTo instanceof Date
            ? Timestamp.fromDate(queryParams.scheduledDateTo)
            : Timestamp.fromDate(new Date(queryParams.scheduledDateTo));
          countQueryBuilder = countQueryBuilder.where('scheduledDate', '<=', toDate);
        }
        const totalSnapshot = await countQueryBuilder.count().get();
        total = totalSnapshot.data().count;
      } catch (countError: any) {
        logger.warn('Could not get count:', countError);
        // Will calculate total from results if count fails
      }

      // Pagination
      const limit = queryParams.limit || 50;
      const page = queryParams.page || 1;
      const offset = (page - 1) * limit;

      // Don't use orderBy with where clauses to avoid index requirements
      // We'll sort in memory instead
      // Get all matching documents (with reasonable limit to prevent memory issues)
      const maxFetch = Math.max(limit * (page + 1), 500); // Fetch enough for pagination
      const taskInstancesSnapshot = await query.limit(maxFetch).get();

      let taskInstances: TaskInstance[] = taskInstancesSnapshot.docs.map((doc) => {
        const data = doc.data() as Omit<TaskInstance, 'id'>;
        // Convert Timestamps to ISO strings for JSON serialization
        const instance: any = {
          id: doc.id,
          ...data,
        };
        
        // Convert Timestamp fields to ISO strings
        if (instance.scheduledDate instanceof Timestamp) {
          instance.scheduledDate = instance.scheduledDate.toDate().toISOString();
        }
        if (instance.dueDate instanceof Timestamp) {
          instance.dueDate = instance.dueDate.toDate().toISOString();
        }
        if (instance.completedAt instanceof Timestamp) {
          instance.completedAt = instance.completedAt.toDate().toISOString();
        }
        if (instance.createdAt instanceof Timestamp) {
          instance.createdAt = instance.createdAt.toDate().toISOString();
        }
        if (instance.updatedAt instanceof Timestamp) {
          instance.updatedAt = instance.updatedAt.toDate().toISOString();
        }
        
        return instance;
      });

      // Always sort in memory by scheduledDate (descending)
      // Note: scheduledDate is now ISO string, so we can sort directly
      taskInstances.sort((a, b) => {
        const aDateStr = typeof a.scheduledDate === 'string' ? a.scheduledDate : (a.scheduledDate as Timestamp).toDate().toISOString();
        const bDateStr = typeof b.scheduledDate === 'string' ? b.scheduledDate : (b.scheduledDate as Timestamp).toDate().toISOString();
        const aDate = new Date(aDateStr).getTime();
        const bDate = new Date(bDateStr).getTime();
        return bDate - aDate; // Descending
      });

      // Update total if count query failed
      if (total === 0) {
        total = taskInstances.length;
      }

      // Apply pagination in memory
      const startIndex = offset;
      const endIndex = startIndex + limit;
      const paginatedTasks = taskInstances.slice(startIndex, endIndex);

      return { taskInstances: paginatedTasks, total };
    } catch (error: any) {
      logger.error('Error getting task instances:', error);
      logger.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });

      // Check if this is a Firestore index error
      if (error.code === 9 || error.message?.includes('index') || error.message?.includes('INDEX')) {
        // Firestore index required error
        // Extract index URL from error if available
        const indexUrl = error.message?.match(/https:\/\/console\.firebase\.google\.com[^\s]+/)?.[0];
        
        const indexError: any = new Error('INDEX_REQUIRED');
        indexError.indexUrl = indexUrl || `https://console.firebase.google.com/project/${process.env.FIREBASE_PROJECT_ID}/firestore/indexes`;
        indexError.code = 'INDEX_REQUIRED';
        throw indexError;
      }

      // Return more detailed error message
      throw new Error(`Failed to get task instances: ${error.message || 'Unknown error'}`);
    }
  }

  async updateTaskInstance(taskInstanceId: string, taskInstanceData: UpdateTaskInstanceDto): Promise<TaskInstance> {
    try {
      const updateData: any = {
        ...taskInstanceData,
        updatedAt: Timestamp.now(),
      };

      if (taskInstanceData.completedAt) {
        updateData.completedAt = taskInstanceData.completedAt instanceof Date
          ? Timestamp.fromDate(taskInstanceData.completedAt)
          : Timestamp.fromDate(new Date(taskInstanceData.completedAt));
      }

      // If status is completed and completedAt is not provided, set it to now
      if (taskInstanceData.status === 'completed' && !updateData.completedAt) {
        updateData.completedAt = Timestamp.now();
      }

      await db.collection('taskInstances').doc(taskInstanceId).update(updateData);

      const updatedTaskInstance = await this.getTaskInstanceById(taskInstanceId);
      if (!updatedTaskInstance) {
        throw new Error('Task instance not found after update');
      }

      return updatedTaskInstance;
    } catch (error: any) {
      logger.error('Error updating task instance:', error);
      throw new Error('Failed to update task instance');
    }
  }

  async deleteTaskInstance(taskInstanceId: string): Promise<void> {
    try {
      await db.collection('taskInstances').doc(taskInstanceId).delete();
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

          // Update lastGenerated timestamp directly in Firestore
          await db.collection('taskMasters').doc(master.id).update({
            lastGenerated: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });

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

      const snapshot = await db
        .collection('taskInstances')
        .where('taskMasterId', '==', taskMasterId)
        .where('scheduledDate', '>=', Timestamp.fromDate(startOfDay))
        .where('scheduledDate', '<=', Timestamp.fromDate(endOfDay))
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...(doc.data() as Omit<TaskInstance, 'id'>),
      };
    } catch (error: any) {
      logger.error('Error getting task instance for date:', error);
      return null;
    }
  }
}

export const taskInstanceService = new TaskInstanceService();
