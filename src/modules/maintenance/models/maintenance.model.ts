import { Timestamp } from 'firebase-admin/firestore';

export type MaintenanceStatus = 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent';
export type EquipmentStatus = 'operational' | 'maintenance' | 'out-of-order';

export interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  equipmentId: string;
  equipmentName: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  assignedTo: string; // userId
  requestedBy: string; // userId
  scheduledDate: Timestamp | null;
  completedDate: Timestamp | null;
  cost: number;
  notes: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  serialNumber: string;
  location: string;
  status: EquipmentStatus;
  lastMaintenanceDate: Timestamp | null;
  nextMaintenanceDate: Timestamp | null;
  warrantyExpiry: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateMaintenanceRequestDto {
  title: string;
  description: string;
  equipmentId: string;
  equipmentName: string;
  priority: MaintenancePriority;
  requestedBy: string;
  scheduledDate?: Date | string;
  notes?: string;
}

export interface UpdateMaintenanceRequestDto {
  title?: string;
  description?: string;
  priority?: MaintenancePriority;
  status?: MaintenanceStatus;
  assignedTo?: string;
  scheduledDate?: Date | string;
  completedDate?: Date | string;
  cost?: number;
  notes?: string;
}

export interface CreateEquipmentDto {
  name: string;
  type: string;
  serialNumber: string;
  location: string;
  warrantyExpiry?: Date | string;
}

export interface UpdateEquipmentDto {
  name?: string;
  type?: string;
  location?: string;
  status?: EquipmentStatus;
  lastMaintenanceDate?: Date | string;
  nextMaintenanceDate?: Date | string;
  warrantyExpiry?: Date | string;
}
