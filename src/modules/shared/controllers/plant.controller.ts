import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import { plantService } from '../services/plant.service';
import { ResponseHelper } from '../../../utils/response';
import { CreatePlantDto, UpdatePlantDto } from '../models/plant.model';

export class PlantController {
  async createPlant(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const plantData: CreatePlantDto = req.body;
      const createdBy = req.user!.uid;

      const plant = await plantService.createPlant(plantData, createdBy);
      ResponseHelper.success(res, plant, 201);
    } catch (error: any) {
      next(error);
    }
  }

  async getPlant(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const plant = await plantService.getPlantById(id);

      if (!plant) {
        ResponseHelper.error(res, 'NOT_FOUND', 'Plant not found', 404);
        return;
      }

      ResponseHelper.success(res, plant);
    } catch (error: any) {
      next(error);
    }
  }

  async getAllPlants(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const activeOnly = req.query.activeOnly === 'true';
      const plants = await plantService.getAllPlants(activeOnly);
      ResponseHelper.success(res, plants);
    } catch (error: any) {
      next(error);
    }
  }

  async updatePlant(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const plantData: UpdatePlantDto = req.body;

      const plant = await plantService.updatePlant(id, plantData);
      ResponseHelper.success(res, plant);
    } catch (error: any) {
      next(error);
    }
  }

  async deletePlant(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await plantService.deletePlant(id);
      ResponseHelper.success(res, { message: 'Plant deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  }
}

export const plantController = new PlantController();
