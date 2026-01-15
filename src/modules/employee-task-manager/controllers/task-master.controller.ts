import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import { taskMasterService } from '../services/task-master.service';
import { ResponseHelper } from '../../../utils/response';
import { logger } from '../../../utils/logger';
import { CreateTaskMasterDto, UpdateTaskMasterDto, TaskMasterQueryParams } from '../models/task-master.model';

export class TaskMasterController {
  async createTaskMaster(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskMasterData: CreateTaskMasterDto = req.body;
      const createdBy = req.user!.uid;

      // Log the incoming data for debugging
      logger.info('Creating task master:', {
        title: taskMasterData.title,
        plantId: taskMasterData.plantId,
        assignedTo: taskMasterData.assignedTo,
        assignedBy: taskMasterData.assignedBy,
        createdBy,
      });

      const taskMaster = await taskMasterService.createTaskMaster(taskMasterData, createdBy);
      ResponseHelper.success(res, taskMaster, 201);
    } catch (error: any) {
      logger.error('Error in createTaskMaster controller:', {
        error: error.message,
        stack: error.stack,
        body: req.body,
      });
      next(error);
    }
  }

  async getTaskMaster(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const taskMaster = await taskMasterService.getTaskMasterById(id);

      if (!taskMaster) {
        ResponseHelper.error(res, 'NOT_FOUND', 'Task master not found', 404);
        return;
      }

      ResponseHelper.success(res, taskMaster);
    } catch (error: any) {
      next(error);
    }
  }

  async getTaskMasters(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const queryParams: TaskMasterQueryParams = {
        plantId: req.query.plantId as string,
        assignedTo: req.query.assignedTo as string,
        assignedBy: req.query.assignedBy as string,
        frequency: req.query.frequency as any,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
      };

      const { taskMasters, total } = await taskMasterService.getTaskMasters(queryParams);
      ResponseHelper.paginated(res, taskMasters, queryParams.page || 1, queryParams.limit || 50, total);
    } catch (error: any) {
      next(error);
    }
  }

  async updateTaskMaster(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const taskMasterData: UpdateTaskMasterDto = req.body;

      const taskMaster = await taskMasterService.updateTaskMaster(id, taskMasterData);
      ResponseHelper.success(res, taskMaster);
    } catch (error: any) {
      next(error);
    }
  }

  async deleteTaskMaster(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await taskMasterService.deleteTaskMaster(id);
      ResponseHelper.success(res, { message: 'Task master deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  }
}

export const taskMasterController = new TaskMasterController();
