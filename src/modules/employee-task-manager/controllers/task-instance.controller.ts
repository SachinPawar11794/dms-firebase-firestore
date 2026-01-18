import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import { taskInstanceService } from '../services/task-instance.service';
import { ResponseHelper } from '../../../utils/response';
import { CreateTaskInstanceDto, UpdateTaskInstanceDto, TaskInstanceQueryParams } from '../models/task-instance.model';
import { UserRepository } from '../../../repositories/user.repository';

export class TaskInstanceController {
  async createTaskInstance(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskInstanceData: CreateTaskInstanceDto = req.body;
      const createdBy = req.user!.uid;

      const taskInstance = await taskInstanceService.createTaskInstance(taskInstanceData, createdBy);
      ResponseHelper.success(res, taskInstance, 201);
    } catch (error: any) {
      next(error);
    }
  }

  async getTaskInstance(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const taskInstance = await taskInstanceService.getTaskInstanceById(id);

      if (!taskInstance) {
        ResponseHelper.error(res, 'NOT_FOUND', 'Task instance not found', 404);
        return;
      }

      ResponseHelper.success(res, taskInstance);
    } catch (error: any) {
      next(error);
    }
  }

  async getTaskInstances(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const queryParams: TaskInstanceQueryParams = {
        taskMasterId: req.query.taskMasterId as string,
        plantId: req.query.plantId as string,
        assignedTo: req.query.assignedTo as string,
        status: req.query.status as any,
        priority: req.query.priority as any,
        scheduledDateFrom: req.query.scheduledDateFrom ? new Date(req.query.scheduledDateFrom as string) : undefined,
        scheduledDateTo: req.query.scheduledDateTo ? new Date(req.query.scheduledDateTo as string) : undefined,
        dueDateFrom: req.query.dueDateFrom ? new Date(req.query.dueDateFrom as string) : undefined,
        dueDateTo: req.query.dueDateTo ? new Date(req.query.dueDateTo as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
      };

      const { taskInstances, total } = await taskInstanceService.getTaskInstances(queryParams);
      ResponseHelper.paginated(res, taskInstances, queryParams.page || 1, queryParams.limit || 50, total);
    } catch (error: any) {
      next(error);
    }
  }

  async getMyTasks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.uid;
      const queryParams: TaskInstanceQueryParams = {
        assignedTo: userId,
        status: req.query.status as any,
        scheduledDateFrom: req.query.scheduledDateFrom ? new Date(req.query.scheduledDateFrom as string) : undefined,
        scheduledDateTo: req.query.scheduledDateTo ? new Date(req.query.scheduledDateTo as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
      };

      const { taskInstances, total } = await taskInstanceService.getTaskInstances(queryParams);
      ResponseHelper.paginated(res, taskInstances, queryParams.page || 1, queryParams.limit || 50, total);
    } catch (error: any) {
      next(error);
    }
  }

  async updateTaskInstance(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const taskInstanceData: UpdateTaskInstanceDto = req.body;

      // Verify user owns this task or is admin/manager
      const taskInstance = await taskInstanceService.getTaskInstanceById(id);
      if (!taskInstance) {
        ResponseHelper.error(res, 'NOT_FOUND', 'Task instance not found', 404);
        return;
      }

      // Check permissions (user can only update their own tasks, unless admin/manager)
      // Get user role from PostgreSQL
      const userId = req.user!.uid;
      const userRepository = new UserRepository();
      const user = await userRepository.findByFirebaseUid(userId);
      const userRole = user?.role || 'employee';
      
      if (taskInstance.assignedTo !== userId && userRole !== 'admin' && userRole !== 'manager') {
        ResponseHelper.error(res, 'FORBIDDEN', 'You can only update your own tasks', 403);
        return;
      }

      const updatedTaskInstance = await taskInstanceService.updateTaskInstance(id, taskInstanceData);
      ResponseHelper.success(res, updatedTaskInstance);
    } catch (error: any) {
      next(error);
    }
  }

  async deleteTaskInstance(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await taskInstanceService.deleteTaskInstance(id);
      ResponseHelper.success(res, { message: 'Task instance deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  }

  async generateTasks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Only admins and managers can trigger task generation
      // Get user role from PostgreSQL
      const userId = req.user!.uid;
      const userRepository = new UserRepository();
      const user = await userRepository.findByFirebaseUid(userId);
      
      if (!user) {
        ResponseHelper.error(res, 'USER_NOT_FOUND', 'User not found', 404);
        return;
      }

      const userRole = user.role || 'employee';
      
      if (userRole !== 'admin' && userRole !== 'manager') {
        ResponseHelper.error(res, 'FORBIDDEN', 'Only admins and managers can generate tasks', 403);
        return;
      }

      const result = await taskInstanceService.generateTasksFromMasters();
      ResponseHelper.success(res, result);
    } catch (error: any) {
      next(error);
    }
  }
}

export const taskInstanceController = new TaskInstanceController();
