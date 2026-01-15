import { Timestamp } from 'firebase-admin/firestore';

export type ProductionStatus = 'planned' | 'in-progress' | 'completed' | 'on-hold';

export interface Production {
  id: string;
  productName: string;
  quantity: number;
  unit: string;
  productionDate: Timestamp;
  status: ProductionStatus;
  assignedTeam: string[]; // userIds
  qualityCheck: boolean;
  notes: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string; // userId
}

export interface ProductionOrder {
  id: string;
  orderNumber: string;
  productId: string;
  quantity: number;
  deadline: Timestamp;
  status: ProductionStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string; // userId
}

export interface CreateProductionDto {
  productName: string;
  quantity: number;
  unit: string;
  productionDate: Date | string;
  assignedTeam: string[];
  notes?: string;
}

export interface UpdateProductionDto {
  productName?: string;
  quantity?: number;
  unit?: string;
  productionDate?: Date | string;
  status?: ProductionStatus;
  assignedTeam?: string[];
  qualityCheck?: boolean;
  notes?: string;
}

export interface CreateProductionOrderDto {
  orderNumber: string;
  productId: string;
  quantity: number;
  deadline: Date | string;
}
