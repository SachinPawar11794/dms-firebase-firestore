import { db } from '../../../config/firebase.config';
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

export class MaintenanceService {
  async createMaintenanceRequest(
    requestData: CreateMaintenanceRequestDto
  ): Promise<MaintenanceRequest> {
    try {
      const now = Timestamp.now();
      const scheduledDate = requestData.scheduledDate
        ? (requestData.scheduledDate instanceof Date
            ? Timestamp.fromDate(requestData.scheduledDate)
            : Timestamp.fromDate(new Date(requestData.scheduledDate)))
        : null;

      const request: Omit<MaintenanceRequest, 'id'> = {
        title: requestData.title,
        description: requestData.description,
        equipmentId: requestData.equipmentId,
        equipmentName: requestData.equipmentName,
        priority: requestData.priority,
        status: 'pending',
        assignedTo: '',
        requestedBy: requestData.requestedBy,
        scheduledDate,
        completedDate: null,
        cost: 0,
        notes: requestData.notes || '',
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await db.collection('maintenanceRequests').add(request);

      return {
        id: docRef.id,
        ...request,
      };
    } catch (error: any) {
      logger.error('Error creating maintenance request:', error);
      throw new Error('Failed to create maintenance request');
    }
  }

  async getMaintenanceRequestById(requestId: string): Promise<MaintenanceRequest | null> {
    try {
      const requestDoc = await db.collection('maintenanceRequests').doc(requestId).get();

      if (!requestDoc.exists) {
        return null;
      }

      return {
        id: requestDoc.id,
        ...(requestDoc.data() as Omit<MaintenanceRequest, 'id'>),
      };
    } catch (error: any) {
      logger.error('Error getting maintenance request:', error);
      throw new Error('Failed to get maintenance request');
    }
  }

  async getMaintenanceRequests(page: number = 1, limit: number = 50): Promise<{
    requests: MaintenanceRequest[];
    total: number;
  }> {
    try {
      const offset = (page - 1) * limit;
      const requestsSnapshot = await db
        .collection('maintenanceRequests')
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .offset(offset)
        .get();

      const totalSnapshot = await db.collection('maintenanceRequests').count().get();
      const total = totalSnapshot.data().count;

      const requests: MaintenanceRequest[] = requestsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<MaintenanceRequest, 'id'>),
      }));

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
      const updateData: any = {
        ...requestData,
        updatedAt: Timestamp.now(),
      };

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

      await db.collection('maintenanceRequests').doc(requestId).update(updateData);

      const updatedRequest = await this.getMaintenanceRequestById(requestId);
      if (!updatedRequest) {
        throw new Error('Maintenance request not found after update');
      }

      return updatedRequest;
    } catch (error: any) {
      logger.error('Error updating maintenance request:', error);
      throw new Error('Failed to update maintenance request');
    }
  }

  async deleteMaintenanceRequest(requestId: string): Promise<void> {
    try {
      await db.collection('maintenanceRequests').doc(requestId).delete();
    } catch (error: any) {
      logger.error('Error deleting maintenance request:', error);
      throw new Error('Failed to delete maintenance request');
    }
  }

  async createEquipment(equipmentData: CreateEquipmentDto): Promise<Equipment> {
    try {
      const now = Timestamp.now();
      const warrantyExpiry = equipmentData.warrantyExpiry
        ? (equipmentData.warrantyExpiry instanceof Date
            ? Timestamp.fromDate(equipmentData.warrantyExpiry)
            : Timestamp.fromDate(new Date(equipmentData.warrantyExpiry)))
        : null;

      const equipment: Omit<Equipment, 'id'> = {
        name: equipmentData.name,
        type: equipmentData.type,
        serialNumber: equipmentData.serialNumber,
        location: equipmentData.location,
        status: 'operational',
        lastMaintenanceDate: null,
        nextMaintenanceDate: null,
        warrantyExpiry,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await db.collection('equipment').add(equipment);

      return {
        id: docRef.id,
        ...equipment,
      };
    } catch (error: any) {
      logger.error('Error creating equipment:', error);
      throw new Error('Failed to create equipment');
    }
  }

  async getEquipmentById(equipmentId: string): Promise<Equipment | null> {
    try {
      const equipmentDoc = await db.collection('equipment').doc(equipmentId).get();

      if (!equipmentDoc.exists) {
        return null;
      }

      return {
        id: equipmentDoc.id,
        ...(equipmentDoc.data() as Omit<Equipment, 'id'>),
      };
    } catch (error: any) {
      logger.error('Error getting equipment:', error);
      throw new Error('Failed to get equipment');
    }
  }

  async getEquipment(page: number = 1, limit: number = 50): Promise<{ equipment: Equipment[]; total: number }> {
    try {
      const offset = (page - 1) * limit;
      const equipmentSnapshot = await db
        .collection('equipment')
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .offset(offset)
        .get();

      const totalSnapshot = await db.collection('equipment').count().get();
      const total = totalSnapshot.data().count;

      const equipment: Equipment[] = equipmentSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Equipment, 'id'>),
      }));

      return { equipment, total };
    } catch (error: any) {
      logger.error('Error getting equipment:', error);
      throw new Error('Failed to get equipment');
    }
  }

  async updateEquipment(equipmentId: string, equipmentData: UpdateEquipmentDto): Promise<Equipment> {
    try {
      const updateData: any = {
        ...equipmentData,
        updatedAt: Timestamp.now(),
      };

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

      await db.collection('equipment').doc(equipmentId).update(updateData);

      const updatedEquipment = await this.getEquipmentById(equipmentId);
      if (!updatedEquipment) {
        throw new Error('Equipment not found after update');
      }

      return updatedEquipment;
    } catch (error: any) {
      logger.error('Error updating equipment:', error);
      throw new Error('Failed to update equipment');
    }
  }

  async deleteEquipment(equipmentId: string): Promise<void> {
    try {
      await db.collection('equipment').doc(equipmentId).delete();
    } catch (error: any) {
      logger.error('Error deleting equipment:', error);
      throw new Error('Failed to delete equipment');
    }
  }
}

export const maintenanceService = new MaintenanceService();
