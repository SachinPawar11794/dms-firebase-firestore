import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import { maintenanceService } from '../services/maintenance.service';
import { ResponseHelper } from '../../../utils/response';
import {
  CreateMaintenanceRequestDto,
  UpdateMaintenanceRequestDto,
  CreateEquipmentDto,
  UpdateEquipmentDto,
} from '../models/maintenance.model';

export class MaintenanceController {
  async createMaintenanceRequest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const requestData: CreateMaintenanceRequestDto = {
        ...req.body,
        requestedBy: req.user!.uid,
      };
      const request = await maintenanceService.createMaintenanceRequest(requestData);
      ResponseHelper.success(res, request, 201);
    } catch (error: any) {
      next(error);
    }
  }

  async getMaintenanceRequest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const request = await maintenanceService.getMaintenanceRequestById(id);

      if (!request) {
        ResponseHelper.error(res, 'NOT_FOUND', 'Maintenance request not found', 404);
        return;
      }

      ResponseHelper.success(res, request);
    } catch (error: any) {
      next(error);
    }
  }

  async getMaintenanceRequests(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

      const { requests, total } = await maintenanceService.getMaintenanceRequests(page, limit);
      ResponseHelper.paginated(res, requests, page, limit, total);
    } catch (error: any) {
      next(error);
    }
  }

  async updateMaintenanceRequest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const requestData: UpdateMaintenanceRequestDto = req.body;

      const request = await maintenanceService.updateMaintenanceRequest(id, requestData);
      ResponseHelper.success(res, request);
    } catch (error: any) {
      next(error);
    }
  }

  async deleteMaintenanceRequest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await maintenanceService.deleteMaintenanceRequest(id);
      ResponseHelper.success(res, { message: 'Maintenance request deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  }

  async createEquipment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const equipmentData: CreateEquipmentDto = req.body;
      const equipment = await maintenanceService.createEquipment(equipmentData);
      ResponseHelper.success(res, equipment, 201);
    } catch (error: any) {
      next(error);
    }
  }

  async getEquipment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const equipment = await maintenanceService.getEquipmentById(id);

      if (!equipment) {
        ResponseHelper.error(res, 'NOT_FOUND', 'Equipment not found', 404);
        return;
      }

      ResponseHelper.success(res, equipment);
    } catch (error: any) {
      next(error);
    }
  }

  async getAllEquipment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

      const { equipment, total } = await maintenanceService.getEquipment(page, limit);
      ResponseHelper.paginated(res, equipment, page, limit, total);
    } catch (error: any) {
      next(error);
    }
  }

  async updateEquipment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const equipmentData: UpdateEquipmentDto = req.body;

      const equipment = await maintenanceService.updateEquipment(id, equipmentData);
      ResponseHelper.success(res, equipment);
    } catch (error: any) {
      next(error);
    }
  }

  async deleteEquipment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await maintenanceService.deleteEquipment(id);
      ResponseHelper.success(res, { message: 'Equipment deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  }
}

export const maintenanceController = new MaintenanceController();
