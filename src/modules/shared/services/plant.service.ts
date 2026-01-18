import { Plant, CreatePlantDto, UpdatePlantDto } from '../models/plant.model';
import { logger } from '../../../utils/logger';
import { PlantRepository } from '../../../repositories/plant.repository';

export class PlantService {
  private plantRepository: PlantRepository;

  constructor() {
    this.plantRepository = new PlantRepository();
  }

  async createPlant(plantData: CreatePlantDto, createdBy: string): Promise<Plant> {
    try {
      // Check if plant code already exists
      const existingPlant = await this.plantRepository.findByCode(plantData.code);
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
        createdBy,
        updatedBy: createdBy,
      });

      return plant;
    } catch (error: any) {
      logger.error('Error creating plant:', error);
      throw error;
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

  async getAllPlants(activeOnly: boolean = false): Promise<Plant[]> {
    try {
      if (activeOnly) {
        return await this.plantRepository.findActive();
      }
      return await this.plantRepository.findAll({}, undefined, undefined);
    } catch (error: any) {
      logger.error('Error getting plants:', error);
      throw new Error('Failed to get plants');
    }
  }

  async updatePlant(plantId: string, plantData: UpdatePlantDto, updatedBy?: string): Promise<Plant> {
    try {
      // If updating code, check for duplicates
      if (plantData.code) {
        const existingPlant = await this.plantRepository.findByCode(plantData.code);
        if (existingPlant && existingPlant.id !== plantId) {
          throw new Error('Plant code already exists');
        }
      }

      const updatedPlant = await this.plantRepository.updatePlant(plantId, {
        ...plantData,
        updatedBy,
      });

      if (!updatedPlant) {
        throw new Error('Plant not found');
      }

      return updatedPlant;
    } catch (error: any) {
      logger.error('Error updating plant:', error);
      throw error;
    }
  }

  async deletePlant(plantId: string): Promise<void> {
    try {
      // Check if plant is used by any users
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
}

export const plantService = new PlantService();
