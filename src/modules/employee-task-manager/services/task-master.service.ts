import { db } from '../../../config/firebase.config';
import { TaskMaster, CreateTaskMasterDto, UpdateTaskMasterDto, TaskMasterQueryParams } from '../models/task-master.model';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { logger } from '../../../utils/logger';

export class TaskMasterService {
  async createTaskMaster(taskMasterData: CreateTaskMasterDto, createdBy: string): Promise<TaskMaster> {
    try {
      const now = Timestamp.now();

      // Validate required fields
      if (!taskMasterData.title || !taskMasterData.description || !taskMasterData.plantId || !taskMasterData.assignedTo || !taskMasterData.assignedBy) {
        throw new Error('Missing required fields: title, description, plantId, assignedTo, and assignedBy are required');
      }

      // Validate startDate is provided (required field)
      if (!taskMasterData.startDate) {
        throw new Error('startDate is required: Task generation start date must be provided');
      }

      // Build task master object, only including defined values (Firestore doesn't allow undefined)
      const taskMaster: any = {
        title: taskMasterData.title.trim(),
        description: taskMasterData.description.trim(),
        plantId: taskMasterData.plantId,
        assignedTo: taskMasterData.assignedTo,
        assignedBy: taskMasterData.assignedBy,
        priority: taskMasterData.priority,
        frequency: taskMasterData.frequency,
        isActive: true,
        tags: taskMasterData.tags && taskMasterData.tags.length > 0 ? taskMasterData.tags : [],
        createdAt: now,
        updatedAt: now,
        createdBy,
      };

      // Only include frequencyValue and frequencyUnit if frequency is 'custom'
      if (taskMasterData.frequency === 'custom') {
        if (taskMasterData.frequencyValue !== undefined && taskMasterData.frequencyValue !== null) {
          taskMaster.frequencyValue = taskMasterData.frequencyValue;
        }
        if (taskMasterData.frequencyUnit !== undefined && taskMasterData.frequencyUnit !== null) {
          taskMaster.frequencyUnit = taskMasterData.frequencyUnit;
        }
      }

      // Handle startDate (required field)
      const startDate = taskMasterData.startDate instanceof Date
        ? Timestamp.fromDate(taskMasterData.startDate)
        : Timestamp.fromDate(new Date(taskMasterData.startDate));
      taskMaster.startDate = startDate;

      // Validate and set estimatedDuration (required field)
      if (!taskMasterData.estimatedDuration || taskMasterData.estimatedDuration <= 0) {
        throw new Error('estimatedDuration is required and must be greater than 0');
      }
      taskMaster.estimatedDuration = taskMasterData.estimatedDuration;

      if (taskMasterData.instructions && taskMasterData.instructions.trim()) {
        taskMaster.instructions = taskMasterData.instructions.trim();
      }

      const docRef = await db.collection('taskMasters').add(taskMaster);

      return {
        id: docRef.id,
        ...taskMaster,
      };
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
      
      // Check for Firestore index error
      if (error.code === 9 || error.message?.includes('index') || error.message?.includes('INDEX')) {
        const indexUrl = error.message?.match(/https:\/\/console\.firebase\.google\.com[^\s]+/)?.[0];
        const indexError: any = new Error('INDEX_REQUIRED');
        indexError.indexUrl = indexUrl || `https://console.firebase.google.com/project/${process.env.FIREBASE_PROJECT_ID}/firestore/indexes`;
        indexError.code = 'INDEX_REQUIRED';
        throw indexError;
      }
      
      // Preserve original error message
      const errorMessage = error.message || 'Unknown error';
      const enhancedError = new Error(`Failed to create task master: ${errorMessage}`);
      (enhancedError as any).originalError = error;
      (enhancedError as any).code = error.code;
      throw enhancedError;
    }
  }

  async getTaskMasterById(taskMasterId: string): Promise<TaskMaster | null> {
    try {
      const taskMasterDoc = await db.collection('taskMasters').doc(taskMasterId).get();

      if (!taskMasterDoc.exists) {
        return null;
      }

      const data = taskMasterDoc.data() as any;
      
      // Convert Timestamp fields to ISO strings
      const taskMaster: any = {
        id: taskMasterDoc.id,
        ...data,
      };

      // Convert startDate Timestamp to ISO string
      if (data.startDate && data.startDate.toDate) {
        taskMaster.startDate = data.startDate.toDate().toISOString();
      } else if (data.startDate instanceof Timestamp) {
        taskMaster.startDate = data.startDate.toDate().toISOString();
      }

      // Convert createdAt Timestamp to ISO string
      if (data.createdAt && data.createdAt.toDate) {
        taskMaster.createdAt = data.createdAt.toDate().toISOString();
      } else if (data.createdAt instanceof Timestamp) {
        taskMaster.createdAt = data.createdAt.toDate().toISOString();
      }

      // Convert updatedAt Timestamp to ISO string
      if (data.updatedAt && data.updatedAt.toDate) {
        taskMaster.updatedAt = data.updatedAt.toDate().toISOString();
      } else if (data.updatedAt instanceof Timestamp) {
        taskMaster.updatedAt = data.updatedAt.toDate().toISOString();
      }

      // Convert lastGenerated Timestamp to ISO string (if exists)
      if (data.lastGenerated) {
        if (data.lastGenerated.toDate) {
          taskMaster.lastGenerated = data.lastGenerated.toDate().toISOString();
        } else if (data.lastGenerated instanceof Timestamp) {
          taskMaster.lastGenerated = data.lastGenerated.toDate().toISOString();
        }
      }

      return taskMaster as TaskMaster;
    } catch (error: any) {
      logger.error('Error getting task master:', error);
      throw new Error('Failed to get task master');
    }
  }

  async getTaskMasters(queryParams: TaskMasterQueryParams): Promise<{ taskMasters: TaskMaster[]; total: number }> {
    try {
      let query: FirebaseFirestore.Query = db.collection('taskMasters');

      // Apply filters
      if (queryParams.plantId) {
        query = query.where('plantId', '==', queryParams.plantId);
      }
      if (queryParams.assignedTo) {
        query = query.where('assignedTo', '==', queryParams.assignedTo);
      }
      if (queryParams.assignedBy) {
        query = query.where('assignedBy', '==', queryParams.assignedBy);
      }
      if (queryParams.frequency) {
        query = query.where('frequency', '==', queryParams.frequency);
      }
      if (queryParams.isActive !== undefined) {
        query = query.where('isActive', '==', queryParams.isActive);
      }

      // Order by creation date
      query = query.orderBy('createdAt', 'desc');

      // Pagination
      const limit = queryParams.limit || 50;
      const page = queryParams.page || 1;
      const offset = (page - 1) * limit;

      const taskMastersSnapshot = await query.limit(limit).offset(offset).get();
      const totalSnapshot = await query.count().get();
      const total = totalSnapshot.data().count;

      const taskMasters: TaskMaster[] = taskMastersSnapshot.docs.map((doc) => {
        const data = doc.data() as any;
        const taskMaster: any = {
          id: doc.id,
          ...data,
        };

        // Convert Timestamp fields to ISO strings
        if (data.startDate && data.startDate.toDate) {
          taskMaster.startDate = data.startDate.toDate().toISOString();
        } else if (data.startDate instanceof Timestamp) {
          taskMaster.startDate = data.startDate.toDate().toISOString();
        }

        if (data.createdAt && data.createdAt.toDate) {
          taskMaster.createdAt = data.createdAt.toDate().toISOString();
        } else if (data.createdAt instanceof Timestamp) {
          taskMaster.createdAt = data.createdAt.toDate().toISOString();
        }

        if (data.updatedAt && data.updatedAt.toDate) {
          taskMaster.updatedAt = data.updatedAt.toDate().toISOString();
        } else if (data.updatedAt instanceof Timestamp) {
          taskMaster.updatedAt = data.updatedAt.toDate().toISOString();
        }

        if (data.lastGenerated) {
          if (data.lastGenerated.toDate) {
            taskMaster.lastGenerated = data.lastGenerated.toDate().toISOString();
          } else if (data.lastGenerated instanceof Timestamp) {
            taskMaster.lastGenerated = data.lastGenerated.toDate().toISOString();
          }
        }

        return taskMaster as TaskMaster;
      });

      return { taskMasters, total };
    } catch (error: any) {
      logger.error('Error getting task masters:', error);
      logger.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
        queryParams,
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
      throw new Error(`Failed to get task masters: ${error.message || 'Unknown error'}`);
    }
  }

  async updateTaskMaster(taskMasterId: string, taskMasterData: UpdateTaskMasterDto): Promise<TaskMaster> {
    try {
      // Build update object, only including defined values (Firestore doesn't allow undefined)
      const updateData: any = {
        updatedAt: Timestamp.now(),
      };

      // Only include fields that are actually provided (not undefined)
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
      if (taskMasterData.startDate !== undefined) {
        if (taskMasterData.startDate === null) {
          updateData.startDate = FieldValue.delete();
        } else {
          const startDate = taskMasterData.startDate instanceof Date
            ? Timestamp.fromDate(taskMasterData.startDate)
            : Timestamp.fromDate(new Date(taskMasterData.startDate));
          updateData.startDate = startDate;
        }
      }
      if (taskMasterData.priority !== undefined) {
        updateData.priority = taskMasterData.priority;
      }
      if (taskMasterData.frequency !== undefined) {
        updateData.frequency = taskMasterData.frequency;
        
        // Only include frequencyValue and frequencyUnit if frequency is 'custom'
        if (taskMasterData.frequency === 'custom') {
          if (taskMasterData.frequencyValue !== undefined && taskMasterData.frequencyValue !== null) {
            updateData.frequencyValue = taskMasterData.frequencyValue;
          }
          if (taskMasterData.frequencyUnit !== undefined && taskMasterData.frequencyUnit !== null) {
            updateData.frequencyUnit = taskMasterData.frequencyUnit;
          }
        } else {
          // If frequency is not custom, remove frequencyValue and frequencyUnit
          updateData.frequencyValue = FieldValue.delete();
          updateData.frequencyUnit = FieldValue.delete();
        }
      } else {
        // If frequency is not being updated, only include frequencyValue/Unit if explicitly provided
        if (taskMasterData.frequencyValue !== undefined) {
          if (taskMasterData.frequencyValue !== null) {
            updateData.frequencyValue = taskMasterData.frequencyValue;
          } else {
            updateData.frequencyValue = FieldValue.delete();
          }
        }
        if (taskMasterData.frequencyUnit !== undefined) {
          if (taskMasterData.frequencyUnit !== null) {
            updateData.frequencyUnit = taskMasterData.frequencyUnit;
          } else {
            updateData.frequencyUnit = FieldValue.delete();
          }
        }
      }
      
      if (taskMasterData.isActive !== undefined) {
        updateData.isActive = taskMasterData.isActive;
      }
      if (taskMasterData.tags !== undefined) {
        updateData.tags = taskMasterData.tags.length > 0 ? taskMasterData.tags : [];
      }
      if (taskMasterData.estimatedDuration !== undefined) {
        if (taskMasterData.estimatedDuration !== null && taskMasterData.estimatedDuration > 0) {
          updateData.estimatedDuration = taskMasterData.estimatedDuration;
        } else {
          // Remove field if explicitly set to null or 0
          updateData.estimatedDuration = FieldValue.delete();
        }
      }
      if (taskMasterData.instructions !== undefined) {
        if (taskMasterData.instructions && taskMasterData.instructions.trim()) {
          updateData.instructions = taskMasterData.instructions.trim();
        } else {
          // Remove field if empty
          updateData.instructions = FieldValue.delete();
        }
      }

      await db.collection('taskMasters').doc(taskMasterId).update(updateData);

      const updatedTaskMaster = await this.getTaskMasterById(taskMasterId);
      if (!updatedTaskMaster) {
        throw new Error('Task master not found after update');
      }

      return updatedTaskMaster;
    } catch (error: any) {
      logger.error('Error updating task master:', error);
      throw new Error('Failed to update task master');
    }
  }

  async deleteTaskMaster(taskMasterId: string): Promise<void> {
    try {
      await db.collection('taskMasters').doc(taskMasterId).delete();
    } catch (error: any) {
      logger.error('Error deleting task master:', error);
      throw new Error('Failed to delete task master');
    }
  }

  async getActiveTaskMasters(): Promise<TaskMaster[]> {
    try {
      const snapshot = await db
        .collection('taskMasters')
        .where('isActive', '==', true)
        .get();

      return snapshot.docs.map((doc) => {
        const data = doc.data() as any;
        const taskMaster: any = {
          id: doc.id,
          ...data,
        };

        // Convert Timestamp fields to ISO strings
        if (data.startDate && data.startDate.toDate) {
          taskMaster.startDate = data.startDate.toDate().toISOString();
        } else if (data.startDate instanceof Timestamp) {
          taskMaster.startDate = data.startDate.toDate().toISOString();
        }

        if (data.createdAt && data.createdAt.toDate) {
          taskMaster.createdAt = data.createdAt.toDate().toISOString();
        } else if (data.createdAt instanceof Timestamp) {
          taskMaster.createdAt = data.createdAt.toDate().toISOString();
        }

        if (data.updatedAt && data.updatedAt.toDate) {
          taskMaster.updatedAt = data.updatedAt.toDate().toISOString();
        } else if (data.updatedAt instanceof Timestamp) {
          taskMaster.updatedAt = data.updatedAt.toDate().toISOString();
        }

        if (data.lastGenerated) {
          if (data.lastGenerated.toDate) {
            taskMaster.lastGenerated = data.lastGenerated.toDate().toISOString();
          } else if (data.lastGenerated instanceof Timestamp) {
            taskMaster.lastGenerated = data.lastGenerated.toDate().toISOString();
          }
        }

        return taskMaster as TaskMaster;
      });
    } catch (error: any) {
      logger.error('Error getting active task masters:', error);
      throw new Error('Failed to get active task masters');
    }
  }
}

export const taskMasterService = new TaskMasterService();
