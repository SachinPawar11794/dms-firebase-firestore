import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import { taskService } from '../services/task.service';
import { ResponseHelper } from '../../../utils/response';
import { CreateTaskDto, UpdateTaskDto, TaskQueryParams } from '../models/task.model';

export class TaskController {
  async createTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskData: CreateTaskDto = req.body;
      const createdBy = req.user!.uid;

      const task = await taskService.createTask(taskData, createdBy);
      ResponseHelper.success(res, task, 201);
    } catch (error: any) {
      next(error);
    }
  }

  async getTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const task = await taskService.getTaskById(id);

      if (!task) {
        ResponseHelper.error(res, 'NOT_FOUND', 'Task not found', 404);
        return;
      }

      ResponseHelper.success(res, task);
    } catch (error: any) {
      next(error);
    }
  }

  async getTasks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const queryParams: TaskQueryParams = {
        status: req.query.status as any,
        priority: req.query.priority as any,
        assignedTo: req.query.assignedTo as string,
        assignedBy: req.query.assignedBy as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
      };

      const { tasks, total } = await taskService.getTasks(queryParams);
      ResponseHelper.paginated(res, tasks, queryParams.page || 1, queryParams.limit || 50, total);
    } catch (error: any) {
      next(error);
    }
  }

  async updateTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const taskData: UpdateTaskDto = req.body;

      const task = await taskService.updateTask(id, taskData);
      ResponseHelper.success(res, task);
    } catch (error: any) {
      next(error);
    }
  }

  async updateTaskStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const task = await taskService.updateTaskStatus(id, status);
      ResponseHelper.success(res, task);
    } catch (error: any) {
      next(error);
    }
  }

  async deleteTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await taskService.deleteTask(id);
      ResponseHelper.success(res, { message: 'Task deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  }
}

export const taskController = new TaskController();
