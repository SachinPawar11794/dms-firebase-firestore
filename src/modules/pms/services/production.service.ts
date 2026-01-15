import { db } from '../../../config/firebase.config';
import { Production, CreateProductionDto, UpdateProductionDto } from '../models/production.model';
import { Timestamp } from 'firebase-admin/firestore';
import { logger } from '../../../utils/logger';

export class ProductionService {
  async createProduction(productionData: CreateProductionDto, createdBy: string): Promise<Production> {
    try {
      const now = Timestamp.now();
      const productionDate = productionData.productionDate instanceof Date
        ? Timestamp.fromDate(productionData.productionDate)
        : Timestamp.fromDate(new Date(productionData.productionDate));

      const production: Omit<Production, 'id'> = {
        productName: productionData.productName,
        quantity: productionData.quantity,
        unit: productionData.unit,
        productionDate,
        status: 'planned',
        assignedTeam: productionData.assignedTeam,
        qualityCheck: false,
        notes: productionData.notes || '',
        createdAt: now,
        updatedAt: now,
        createdBy,
      };

      const docRef = await db.collection('productions').add(production);

      return {
        id: docRef.id,
        ...production,
      };
    } catch (error: any) {
      logger.error('Error creating production:', error);
      throw new Error('Failed to create production');
    }
  }

  async getProductionById(productionId: string): Promise<Production | null> {
    try {
      const productionDoc = await db.collection('productions').doc(productionId).get();

      if (!productionDoc.exists) {
        return null;
      }

      return {
        id: productionDoc.id,
        ...(productionDoc.data() as Omit<Production, 'id'>),
      };
    } catch (error: any) {
      logger.error('Error getting production:', error);
      throw new Error('Failed to get production');
    }
  }

  async getProductions(page: number = 1, limit: number = 50): Promise<{ productions: Production[]; total: number }> {
    try {
      const offset = (page - 1) * limit;
      const productionsSnapshot = await db
        .collection('productions')
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .offset(offset)
        .get();

      const totalSnapshot = await db.collection('productions').count().get();
      const total = totalSnapshot.data().count;

      const productions: Production[] = productionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Production, 'id'>),
      }));

      return { productions, total };
    } catch (error: any) {
      logger.error('Error getting productions:', error);
      throw new Error('Failed to get productions');
    }
  }

  async updateProduction(productionId: string, productionData: UpdateProductionDto): Promise<Production> {
    try {
      const updateData: any = {
        ...productionData,
        updatedAt: Timestamp.now(),
      };

      if (productionData.productionDate) {
        updateData.productionDate = productionData.productionDate instanceof Date
          ? Timestamp.fromDate(productionData.productionDate)
          : Timestamp.fromDate(new Date(productionData.productionDate));
      }

      await db.collection('productions').doc(productionId).update(updateData);

      const updatedProduction = await this.getProductionById(productionId);
      if (!updatedProduction) {
        throw new Error('Production not found after update');
      }

      return updatedProduction;
    } catch (error: any) {
      logger.error('Error updating production:', error);
      throw new Error('Failed to update production');
    }
  }

  async deleteProduction(productionId: string): Promise<void> {
    try {
      await db.collection('productions').doc(productionId).delete();
    } catch (error: any) {
      logger.error('Error deleting production:', error);
      throw new Error('Failed to delete production');
    }
  }
}

export const productionService = new ProductionService();
