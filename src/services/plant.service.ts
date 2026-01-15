import { db } from '../config/firebase.config';
import { Plant, CreatePlantDto, UpdatePlantDto } from '../models/plant.model';
import { Timestamp } from 'firebase-admin/firestore';
import logger from '../utils/logger';

class PlantService {
  async getAllPlants(page = 1, limit = 50): Promise<{ data: Plant[]; total: number; page: number; limit: number }> {
    try {
      const offset = (page - 1) * limit;
      
      // Get total count
      const countSnapshot = await db.collection('plants').count().get();
      const total = countSnapshot.data().count;

      // Get paginated data
      const snapshot = await db
        .collection('plants')
        .orderBy('createdAt', 'desc')
        .offset(offset)
        .limit(limit)
        .get();

      const plants: Plant[] = [];
      snapshot.forEach((doc) => {
        plants.push({
          id: doc.id,
          ...(doc.data() as Omit<Plant, 'id'>),
        });
      });

      return {
        data: plants,
        total,
        page,
        limit,
      };
    } catch (error: any) {
      logger.error('Error getting plants:', error);
      throw new Error('Failed to get plants');
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

  async getPlantByCode(code: string): Promise<Plant | null> {
    try {
      const snapshot = await db
        .collection('plants')
        .where('code', '==', code.toUpperCase())
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...(doc.data() as Omit<Plant, 'id'>),
      };
    } catch (error: any) {
      logger.error('Error getting plant by code:', error);
      throw new Error('Failed to get plant by code');
    }
  }

  async createPlant(plantData: CreatePlantDto, userId?: string): Promise<Plant> {
    try {
      // Check if plant code already exists
      const existingPlant = await this.getPlantByCode(plantData.code);
      if (existingPlant) {
        throw new Error('Plant code already exists');
      }

      const now = Timestamp.now();
      const plant: Omit<Plant, 'id'> = {
        name: plantData.name,
        code: plantData.code.toUpperCase(),
        address: plantData.address,
        city: plantData.city,
        state: plantData.state,
        country: plantData.country,
        postalCode: plantData.postalCode,
        contactPerson: plantData.contactPerson,
        contactEmail: plantData.contactEmail,
        contactPhone: plantData.contactPhone,
        isActive: plantData.isActive !== undefined ? plantData.isActive : true,
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
        updatedBy: userId,
      };

      const docRef = await db.collection('plants').add(plant);

      return {
        id: docRef.id,
        ...plant,
      };
    } catch (error: any) {
      logger.error('Error creating plant:', error);
      if (error.message === 'Plant code already exists') {
        throw error;
      }
      throw new Error('Failed to create plant');
    }
  }

  async updatePlant(plantId: string, plantData: UpdatePlantDto, userId?: string): Promise<Plant> {
    try {
      // If code is being updated, check if it already exists
      if (plantData.code) {
        const existingPlant = await this.getPlantByCode(plantData.code);
        if (existingPlant && existingPlant.id !== plantId) {
          throw new Error('Plant code already exists');
        }
      }

      const updateData: any = {
        ...plantData,
        updatedAt: Timestamp.now(),
        updatedBy: userId,
      };

      // Convert code to uppercase if provided
      if (updateData.code) {
        updateData.code = updateData.code.toUpperCase();
      }

      // Remove undefined fields
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      await db.collection('plants').doc(plantId).update(updateData);

      const updatedPlant = await this.getPlantById(plantId);
      if (!updatedPlant) {
        throw new Error('Plant not found after update');
      }

      return updatedPlant;
    } catch (error: any) {
      logger.error('Error updating plant:', error);
      if (error.message === 'Plant code already exists') {
        throw error;
      }
      throw new Error('Failed to update plant');
    }
  }

  async deletePlant(plantId: string): Promise<void> {
    try {
      // Check if plant is being used by any users
      const usersSnapshot = await db
        .collection('users')
        .where('plant', '==', plantId)
        .limit(1)
        .get();

      if (!usersSnapshot.empty) {
        throw new Error('Cannot delete plant: It is assigned to one or more users');
      }

      await db.collection('plants').doc(plantId).delete();
    } catch (error: any) {
      logger.error('Error deleting plant:', error);
      if (error.message.includes('Cannot delete plant')) {
        throw error;
      }
      throw new Error('Failed to delete plant');
    }
  }

  async getActivePlants(): Promise<Plant[]> {
    try {
      const snapshot = await db
        .collection('plants')
        .where('isActive', '==', true)
        .orderBy('name', 'asc')
        .get();

      const plants: Plant[] = [];
      snapshot.forEach((doc) => {
        plants.push({
          id: doc.id,
          ...(doc.data() as Omit<Plant, 'id'>),
        });
      });

      return plants;
    } catch (error: any) {
      logger.error('Error getting active plants:', error);
      throw new Error('Failed to get active plants');
    }
  }
}

export default new PlantService();
