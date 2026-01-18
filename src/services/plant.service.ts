import { Plant, CreatePlantDto, UpdatePlantDto } from '../models/plant.model';
import logger from '../utils/logger';
import { PlantRepository } from '../repositories/plant.repository';

class PlantService {
  private plantRepository: PlantRepository;

  constructor() {
    this.plantRepository = new PlantRepository();
  }

  async getAllPlants(page = 1, limit = 50): Promise<{ data: Plant[]; total: number; page: number; limit: number }> {
    try {
      const offset = (page - 1) * limit;
      
      // Get total count
      const total = await this.plantRepository.count();

      // Get paginated data
      const plants = await this.plantRepository.findAll({}, limit, offset);

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
      return await this.plantRepository.findById(plantId);
    } catch (error: any) {
      logger.error('Error getting plant:', error);
      throw new Error('Failed to get plant');
    }
  }

  async getPlantByCode(code: string): Promise<Plant | null> {
    try {
      return await this.plantRepository.findByCode(code);
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

      const plant = await this.plantRepository.createPlant({
        name: plantData.name,
        code: plantData.code,
        address: plantData.address,
        city: plantData.city,
        state: plantData.state,
        country: plantData.country,
        postalCode: plantData.postalCode,
        contactPerson: plantData.contactPerson,
        contactEmail: plantData.contactEmail,
        contactPhone: plantData.contactPhone,
        isActive: plantData.isActive !== undefined ? plantData.isActive : true,
        createdBy: userId,
        updatedBy: userId,
      });

      return plant;
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

      const updatedPlant = await this.plantRepository.updatePlant(plantId, {
        ...plantData,
        updatedBy: userId,
      });

      if (!updatedPlant) {
        throw new Error('Plant not found');
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
      const isUsed = await this.plantRepository.isUsedByUsers(plantId);
      if (isUsed) {
        throw new Error('Cannot delete plant: It is assigned to one or more users');
      }

      const deleted = await this.plantRepository.delete(plantId);
      if (!deleted) {
        throw new Error('Plant not found');
      }
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
      return await this.plantRepository.findActive();
    } catch (error: any) {
      logger.error('Error getting active plants:', error);
      throw new Error('Failed to get active plants');
    }
  }
}

export default new PlantService();
