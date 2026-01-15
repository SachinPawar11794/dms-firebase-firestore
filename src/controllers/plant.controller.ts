import { Request, Response, NextFunction } from 'express';
import plantService from '../services/plant.service';
import { ResponseHelper } from '../utils/response';
import logger from '../utils/logger';

export class PlantController {
  async getAllPlants(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await plantService.getAllPlants(page, limit);
      ResponseHelper.success(res, result);
    } catch (error: any) {
      logger.error('Error in getAllPlants controller:', error);
      ResponseHelper.error(res, 'PLANT_FETCH_ERROR', error.message || 'Failed to get plants', 500);
    }
  }

  async getPlantById(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const plant = await plantService.getPlantById(id);

      if (!plant) {
        ResponseHelper.error(res, 'PLANT_NOT_FOUND', 'Plant not found', 404);
        return;
      }

      ResponseHelper.success(res, plant);
    } catch (error: any) {
      logger.error('Error in getPlantById controller:', error);
      ResponseHelper.error(res, 'PLANT_FETCH_ERROR', error.message || 'Failed to get plant', 500);
    }
  }

  async createPlant(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.uid;
      const plant = await plantService.createPlant(req.body, userId);
      ResponseHelper.success(res, plant, 201);
    } catch (error: any) {
      logger.error('Error in createPlant controller:', error);
      const statusCode = error.message.includes('already exists') ? 400 : 500;
      ResponseHelper.error(res, 'PLANT_CREATE_ERROR', error.message || 'Failed to create plant', statusCode);
    }
  }

  async updatePlant(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.uid;
      const plant = await plantService.updatePlant(id, req.body, userId);
      ResponseHelper.success(res, plant);
    } catch (error: any) {
      logger.error('Error in updatePlant controller:', error);
      const statusCode = error.message.includes('already exists') || error.message.includes('not found') ? 400 : 500;
      ResponseHelper.error(res, 'PLANT_UPDATE_ERROR', error.message || 'Failed to update plant', statusCode);
    }
  }

  async deletePlant(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await plantService.deletePlant(id);
      ResponseHelper.success(res, null);
    } catch (error: any) {
      logger.error('Error in deletePlant controller:', error);
      const statusCode = error.message.includes('Cannot delete') ? 400 : 500;
      ResponseHelper.error(res, 'PLANT_DELETE_ERROR', error.message || 'Failed to delete plant', statusCode);
    }
  }

  async getActivePlants(_req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const plants = await plantService.getActivePlants();
      ResponseHelper.success(res, plants);
    } catch (error: any) {
      logger.error('Error in getActivePlants controller:', error);
      ResponseHelper.error(res, 'PLANT_FETCH_ERROR', error.message || 'Failed to get active plants', 500);
    }
  }
}

export default new PlantController();
