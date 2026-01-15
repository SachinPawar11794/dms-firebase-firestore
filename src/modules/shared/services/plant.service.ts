import { db } from '../../../config/firebase.config';
import { Plant, CreatePlantDto, UpdatePlantDto } from '../models/plant.model';
import { Timestamp } from 'firebase-admin/firestore';
import { logger } from '../../../utils/logger';

export class PlantService {
  async createPlant(plantData: CreatePlantDto, createdBy: string): Promise<Plant> {
    try {
      // Check if plant code already exists
      const existingPlant = await db
        .collection('plants')
        .where('code', '==', plantData.code)
        .limit(1)
        .get();

      if (!existingPlant.empty) {
        throw new Error('Plant code already exists');
      }

      const now = Timestamp.now();

      const plant: Omit<Plant, 'id'> = {
        name: plantData.name,
        code: plantData.code,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        createdBy,
      };

      const docRef = await db.collection('plants').add(plant);

      return {
        id: docRef.id,
        ...plant,
      };
    } catch (error: any) {
      logger.error('Error creating plant:', error);
      throw error;
    }
  }

  async getPlantById(plantId: string): Promise<Plant | null> {
    try {
      const plantDoc = await db.collection('plants').doc(plantId).get();

      if (!plantDoc.exists) {
        return null;
      }

      return {
        id: plantDoc.id,
        ...(plantDoc.data() as Omit<Plant, 'id'>),
      };
    } catch (error: any) {
      logger.error('Error getting plant:', error);
      throw new Error('Failed to get plant');
    }
  }

  async getAllPlants(activeOnly: boolean = false): Promise<Plant[]> {
    try {
      let query: FirebaseFirestore.Query = db.collection('plants');

      if (activeOnly) {
        query = query.where('isActive', '==', true);
      }

      query = query.orderBy('name', 'asc');

      const snapshot = await query.get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Plant, 'id'>),
      }));
    } catch (error: any) {
      logger.error('Error getting plants:', error);
      
      // Check if it's a Firestore index error
      if (error.code === 9 && error.details?.includes('index')) {
        // Extract the index creation URL from error details
        const indexUrlMatch = error.details.match(/https:\/\/console\.firebase\.google\.com[^\s]+/);
        if (indexUrlMatch) {
          const indexError = new Error('INDEX_REQUIRED');
          (indexError as any).indexUrl = indexUrlMatch[0];
          (indexError as any).originalError = error;
          throw indexError;
        }
      }
      
      throw new Error('Failed to get plants');
    }
  }

  async updatePlant(plantId: string, plantData: UpdatePlantDto): Promise<Plant> {
    try {
      // If updating code, check for duplicates
      if (plantData.code) {
        const existingPlant = await db
          .collection('plants')
          .where('code', '==', plantData.code)
          .limit(1)
          .get();

        if (!existingPlant.empty && existingPlant.docs[0].id !== plantId) {
          throw new Error('Plant code already exists');
        }
      }

      const updateData: any = {
        ...plantData,
        updatedAt: Timestamp.now(),
      };

      await db.collection('plants').doc(plantId).update(updateData);

      const updatedPlant = await this.getPlantById(plantId);
      if (!updatedPlant) {
        throw new Error('Plant not found after update');
      }

      return updatedPlant;
    } catch (error: any) {
      logger.error('Error updating plant:', error);
      throw error;
    }
  }

  async deletePlant(plantId: string): Promise<void> {
    try {
      await db.collection('plants').doc(plantId).delete();
    } catch (error: any) {
      logger.error('Error deleting plant:', error);
      throw new Error('Failed to delete plant');
    }
  }
}

export const plantService = new PlantService();
