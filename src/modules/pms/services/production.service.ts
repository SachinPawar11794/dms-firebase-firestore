import { Production, CreateProductionDto, UpdateProductionDto } from '../models/production.model';
import { Timestamp } from 'firebase-admin/firestore';
import { logger } from '../../../utils/logger';
import { ProductionRepository } from '../../../repositories/production.repository';

export class ProductionService {
  private productionRepository: ProductionRepository;

  constructor() {
    this.productionRepository = new ProductionRepository();
  }
  async createProduction(productionData: CreateProductionDto, createdBy: string, plantId?: string): Promise<Production> {
    try {
      const productionDate = productionData.productionDate instanceof Date
        ? productionData.productionDate
        : new Date(productionData.productionDate);

      return await this.productionRepository.createProduction({
        productName: productionData.productName,
        quantity: productionData.quantity,
        unit: productionData.unit,
        productionDate,
        assignedTeam: productionData.assignedTeam,
        qualityCheck: false,
        notes: productionData.notes,
        plantId,
        createdBy,
      });
    } catch (error: any) {
      logger.error('Error creating production:', error);
      throw new Error('Failed to create production');
    }
  }

  async getProductionById(productionId: string): Promise<Production | null> {
    try {
      return await this.productionRepository.findById(productionId);
    } catch (error: any) {
      logger.error('Error getting production:', error);
      throw new Error('Failed to get production');
    }
  }

  async getProductions(page: number = 1, limit: number = 50, plantId?: string): Promise<{ productions: Production[]; total: number }> {
    try {
      const offset = (page - 1) * limit;
      const filters: any = {};
      if (plantId) filters.plantId = plantId;

      const productions = await this.productionRepository.findWithFilters(filters, limit, offset);
      const total = await this.productionRepository.count(filters);

      return { productions, total };
    } catch (error: any) {
      logger.error('Error getting productions:', error);
      throw new Error('Failed to get productions');
    }
  }

  async updateProduction(productionId: string, productionData: UpdateProductionDto): Promise<Production> {
    try {
      const updateData: any = {};

      if (productionData.productName !== undefined) updateData.productName = productionData.productName;
      if (productionData.quantity !== undefined) updateData.quantity = productionData.quantity;
      if (productionData.unit !== undefined) updateData.unit = productionData.unit;
      if (productionData.status !== undefined) updateData.status = productionData.status;
      if (productionData.assignedTeam !== undefined) updateData.assignedTeam = productionData.assignedTeam;
      if (productionData.qualityCheck !== undefined) updateData.qualityCheck = productionData.qualityCheck;
      if (productionData.notes !== undefined) updateData.notes = productionData.notes;

      if (productionData.productionDate) {
        updateData.productionDate = productionData.productionDate instanceof Date
          ? Timestamp.fromDate(productionData.productionDate)
          : Timestamp.fromDate(new Date(productionData.productionDate));
      }

      const updatedProduction = await this.productionRepository.updateProduction(productionId, updateData);
      if (!updatedProduction) {
        throw new Error('Production not found');
      }

      return updatedProduction;
    } catch (error: any) {
      logger.error('Error updating production:', error);
      throw new Error('Failed to update production');
    }
  }

  async deleteProduction(productionId: string): Promise<void> {
    try {
      const deleted = await this.productionRepository.delete(productionId);
      if (!deleted) {
        throw new Error('Production not found');
      }
    } catch (error: any) {
      logger.error('Error deleting production:', error);
      throw new Error('Failed to delete production');
    }
  }
}

export const productionService = new ProductionService();
