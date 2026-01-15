import { Timestamp } from 'firebase-admin/firestore';

export interface Plant {
  id: string;
  name: string;
  code: string; // Unique plant code
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string; // userId
}

export interface CreatePlantDto {
  name: string;
  code: string;
}

export interface UpdatePlantDto {
  name?: string;
  code?: string;
  isActive?: boolean;
}
