import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import { productionService } from '../services/production.service';
import { ResponseHelper } from '../../../utils/response';
import { CreateProductionDto, UpdateProductionDto } from '../models/production.model';

export class ProductionController {
  async createProduction(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const productionData: CreateProductionDto = req.body;
      const createdBy = req.user!.uid;

      const production = await productionService.createProduction(productionData, createdBy);
      ResponseHelper.success(res, production, 201);
    } catch (error: any) {
      next(error);
    }
  }

  async getProduction(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const production = await productionService.getProductionById(id);

      if (!production) {
        ResponseHelper.error(res, 'NOT_FOUND', 'Production not found', 404);
        return;
      }

      ResponseHelper.success(res, production);
    } catch (error: any) {
      next(error);
    }
  }

  async getProductions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

      const { productions, total } = await productionService.getProductions(page, limit);
      ResponseHelper.paginated(res, productions, page, limit, total);
    } catch (error: any) {
      next(error);
    }
  }

  async updateProduction(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const productionData: UpdateProductionDto = req.body;

      const production = await productionService.updateProduction(id, productionData);
      ResponseHelper.success(res, production);
    } catch (error: any) {
      next(error);
    }
  }

  async deleteProduction(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await productionService.deleteProduction(id);
      ResponseHelper.success(res, { message: 'Production deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  }
}

export const productionController = new ProductionController();
