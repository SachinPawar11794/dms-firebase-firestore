import {
  MaintenanceRequest,
  Equipment,
  CreateMaintenanceRequestDto,
  UpdateMaintenanceRequestDto,
  CreateEquipmentDto,
  UpdateEquipmentDto,
} from '../models/maintenance.model';
import { Timestamp } from 'firebase-admin/firestore';
import { logger } from '../../../utils/logger';
import { MaintenanceRequestRepository } from '../../../repositories/maintenance-request.repository';
import { EquipmentRepository } from '../../../repositories/equipment.repository';

export class MaintenanceService {
  private maintenanceRequestRepository: MaintenanceRequestRepository;
  private equipmentRepository: EquipmentRepository;

  constructor() {
    this.maintenanceRequestRepository = new MaintenanceRequestRepository();
    this.equipmentRepository = new EquipmentRepository();
  }
  async createMaintenanceRequest(
    requestData: CreateMaintenanceRequestDto,
    plantId?: string,
    createdBy?: string
  ): Promise<MaintenanceRequest> {
    try {

      return await this.maintenanceRequestRepository.createMaintenanceRequest({
        title: requestData.title,
        description: requestData.description,
        equipmentId: requestData.equipmentId,
        requestedBy: requestData.requestedBy,
        priority: requestData.priority,
        plantId,
        createdBy,
      });
    } catch (error: any) {
      logger.error('Error creating maintenance request:', error);
      throw new Error('Failed to create maintenance request');
    }
  }

  async getMaintenanceRequestById(requestId: string): Promise<MaintenanceRequest | null> {
    try {
      return await this.maintenanceRequestRepository.findById(requestId);
    } catch (error: any) {
      logger.error('Error getting maintenance request:', error);
      throw new Error('Failed to get maintenance request');
    }
  }

  async getMaintenanceRequests(page: number = 1, limit: number = 50, filters?: any): Promise<{
    requests: MaintenanceRequest[];
    total: number;
  }> {
    try {
      const offset = (page - 1) * limit;
      const filterParams: any = {};
      if (filters?.status) filterParams.status = filters.status;
      if (filters?.requestedBy) filterParams.requestedBy = filters.requestedBy;
      if (filters?.assignedTo) filterParams.assignedTo = filters.assignedTo;
      if (filters?.equipmentId) filterParams.equipmentId = filters.equipmentId;

      const requests = await this.maintenanceRequestRepository.findWithFilters(filterParams, limit, offset);
      const total = await this.maintenanceRequestRepository.count(filterParams);

      return { requests, total };
    } catch (error: any) {
      logger.error('Error getting maintenance requests:', error);
      throw new Error('Failed to get maintenance requests');
    }
  }

  async updateMaintenanceRequest(
    requestId: string,
    requestData: UpdateMaintenanceRequestDto
  ): Promise<MaintenanceRequest> {
    try {
      const updateData: any = {};

      if (requestData.title !== undefined) updateData.title = requestData.title;
      if (requestData.description !== undefined) updateData.description = requestData.description;
      if (requestData.priority !== undefined) updateData.priority = requestData.priority;
      if (requestData.status !== undefined) updateData.status = requestData.status;
      if (requestData.assignedTo !== undefined) updateData.assignedTo = requestData.assignedTo;
      if (requestData.cost !== undefined) updateData.cost = requestData.cost;
      if (requestData.notes !== undefined) updateData.notes = requestData.notes;

      if (requestData.scheduledDate) {
        updateData.scheduledDate = requestData.scheduledDate instanceof Date
          ? Timestamp.fromDate(requestData.scheduledDate)
          : Timestamp.fromDate(new Date(requestData.scheduledDate));
      }

      if (requestData.completedDate) {
        updateData.completedDate = requestData.completedDate instanceof Date
          ? Timestamp.fromDate(requestData.completedDate)
          : Timestamp.fromDate(new Date(requestData.completedDate));
      }

      const updatedRequest = await this.maintenanceRequestRepository.updateMaintenanceRequest(requestId, updateData);
      if (!updatedRequest) {
        throw new Error('Maintenance request not found');
      }

      return updatedRequest;
    } catch (error: any) {
      logger.error('Error updating maintenance request:', error);
      throw new Error('Failed to update maintenance request');
    }
  }

  async deleteMaintenanceRequest(requestId: string): Promise<void> {
    try {
      const deleted = await this.maintenanceRequestRepository.delete(requestId);
      if (!deleted) {
        throw new Error('Maintenance request not found');
      }
    } catch (error: any) {
      logger.error('Error deleting maintenance request:', error);
      throw new Error('Failed to delete maintenance request');
    }
  }

  async createEquipment(equipmentData: CreateEquipmentDto, plantId?: string, createdBy?: string): Promise<Equipment> {
    try {
      const warrantyExpiry = equipmentData.warrantyExpiry
        ? (equipmentData.warrantyExpiry instanceof Date
            ? equipmentData.warrantyExpiry
            : new Date(equipmentData.warrantyExpiry))
        : undefined;

      return await this.equipmentRepository.createEquipment({
        name: equipmentData.name,
        type: equipmentData.type,
        serialNumber: equipmentData.serialNumber,
        location: equipmentData.location,
        warrantyExpiry,
        status: 'operational',
        plantId,
        createdBy,
      });
    } catch (error: any) {
      logger.error('Error creating equipment:', error);
      throw new Error('Failed to create equipment');
    }
  }

  async getEquipmentById(equipmentId: string): Promise<Equipment | null> {
    try {
      return await this.equipmentRepository.findById(equipmentId);
    } catch (error: any) {
      logger.error('Error getting equipment:', error);
      throw new Error('Failed to get equipment');
    }
  }

  async getEquipment(page: number = 1, limit: number = 50, plantId?: string): Promise<{ equipment: Equipment[]; total: number }> {
    try {
      const offset = (page - 1) * limit;
      const filters: any = {};
      if (plantId) filters.plantId = plantId;

      const equipment = await this.equipmentRepository.findWithFilters(filters, limit, offset);
      const total = await this.equipmentRepository.count(filters);

      return { equipment, total };
    } catch (error: any) {
      logger.error('Error getting equipment:', error);
      throw new Error('Failed to get equipment');
    }
  }

  async updateEquipment(equipmentId: string, equipmentData: UpdateEquipmentDto): Promise<Equipment> {
    try {
      const updateData: any = {};

      if (equipmentData.name !== undefined) updateData.name = equipmentData.name;
      if (equipmentData.type !== undefined) updateData.type = equipmentData.type;
      if (equipmentData.location !== undefined) updateData.location = equipmentData.location;
      if (equipmentData.status !== undefined) updateData.status = equipmentData.status;

      if (equipmentData.lastMaintenanceDate) {
        updateData.lastMaintenanceDate = equipmentData.lastMaintenanceDate instanceof Date
          ? Timestamp.fromDate(equipmentData.lastMaintenanceDate)
          : Timestamp.fromDate(new Date(equipmentData.lastMaintenanceDate));
      }

      if (equipmentData.nextMaintenanceDate) {
        updateData.nextMaintenanceDate = equipmentData.nextMaintenanceDate instanceof Date
          ? Timestamp.fromDate(equipmentData.nextMaintenanceDate)
          : Timestamp.fromDate(new Date(equipmentData.nextMaintenanceDate));
      }

      if (equipmentData.warrantyExpiry) {
        updateData.warrantyExpiry = equipmentData.warrantyExpiry instanceof Date
          ? Timestamp.fromDate(equipmentData.warrantyExpiry)
          : Timestamp.fromDate(new Date(equipmentData.warrantyExpiry));
      }

      const updatedEquipment = await this.equipmentRepository.updateEquipment(equipmentId, updateData);
      if (!updatedEquipment) {
        throw new Error('Equipment not found');
      }

      return updatedEquipment;
    } catch (error: any) {
      logger.error('Error updating equipment:', error);
      throw new Error('Failed to update equipment');
    }
  }

  async deleteEquipment(equipmentId: string): Promise<void> {
    try {
      const deleted = await this.equipmentRepository.delete(equipmentId);
      if (!deleted) {
        throw new Error('Equipment not found');
      }
    } catch (error: any) {
      logger.error('Error deleting equipment:', error);
      throw new Error('Failed to delete equipment');
    }
  }
}

export const maintenanceService = new MaintenanceService();
