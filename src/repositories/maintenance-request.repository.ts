import { BaseRepository } from './base.repository';
import { MaintenanceRequest } from '../modules/maintenance/models/maintenance.model';
import { Timestamp } from 'firebase-admin/firestore';

export class MaintenanceRequestRepository extends BaseRepository<MaintenanceRequest> {
  constructor() {
    super('maintenance_requests');
  }

  protected mapRowToEntity(row: any): MaintenanceRequest {
    return {
      id: row.id,
      title: row.title,
      description: row.description || '',
      equipmentId: row.equipment_id || '',
      equipmentName: '', // Will need to join or store
      priority: row.priority,
      status: row.status,
      assignedTo: row.assigned_to || '',
      requestedBy: row.requested_by,
      scheduledDate: row.requested_date ? Timestamp.fromDate(new Date(row.requested_date)) : null,
      completedDate: row.completed_date ? Timestamp.fromDate(new Date(row.completed_date)) : null,
      cost: parseFloat(row.cost || 0),
      notes: row.notes || '',
      createdAt: Timestamp.fromDate(new Date(row.created_at)),
      updatedAt: Timestamp.fromDate(new Date(row.updated_at)),
    };
  }

  /**
   * Find maintenance requests with filters
   */
  async findWithFilters(filters: {
    status?: string;
    requestedBy?: string;
    assignedTo?: string;
    equipmentId?: string;
  }, limit?: number, offset?: number): Promise<MaintenanceRequest[]> {
    let query = `SELECT * FROM ${this.tableName}`;
    const params: any[] = [];
    const conditions: string[] = [];
    let paramIndex = 1;

    if (filters.status) {
      conditions.push(`status = $${paramIndex}`);
      params.push(filters.status);
      paramIndex++;
    }
    if (filters.requestedBy) {
      conditions.push(`requested_by = $${paramIndex}`);
      params.push(filters.requestedBy);
      paramIndex++;
    }
    if (filters.assignedTo) {
      conditions.push(`assigned_to = $${paramIndex}`);
      params.push(filters.assignedTo);
      paramIndex++;
    }
    if (filters.equipmentId) {
      conditions.push(`equipment_id = $${paramIndex}`);
      params.push(filters.equipmentId);
      paramIndex++;
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY created_at DESC`;

    if (limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(limit);
      paramIndex++;
    }

    if (offset) {
      query += ` OFFSET $${paramIndex}`;
      params.push(offset);
    }

    const result = await this.query(query, params);
    return result.rows.map(row => this.mapRowToEntity(row));
  }

  /**
   * Create maintenance request
   */
  async createMaintenanceRequest(data: {
    title: string;
    description: string;
    equipmentId?: string;
    requestedBy: string;
    priority: string;
    plantId?: string;
    createdBy?: string;
  }): Promise<MaintenanceRequest> {
    const fields = [
      'title', 'description', 'equipment_id', 'requested_by',
      'status', 'priority', 'plant_id', 'created_by'
    ];
    const values = [
      data.title,
      data.description,
      data.equipmentId || null,
      data.requestedBy,
      'pending', // Default status
      data.priority,
      data.plantId || null,
      data.createdBy || null,
    ];

    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

    const query = `
      INSERT INTO ${this.tableName} (${fields.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await this.query(query, values);
    return this.mapRowToEntity(result.rows[0]);
  }

  /**
   * Update maintenance request
   */
  async updateMaintenanceRequest(id: string, data: Partial<MaintenanceRequest>): Promise<MaintenanceRequest | null> {
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.title !== undefined) {
      updateFields.push(`title = $${paramIndex}`);
      values.push(data.title);
      paramIndex++;
    }
    if (data.description !== undefined) {
      updateFields.push(`description = $${paramIndex}`);
      values.push(data.description);
      paramIndex++;
    }
    if (data.priority !== undefined) {
      updateFields.push(`priority = $${paramIndex}`);
      values.push(data.priority);
      paramIndex++;
    }
    if (data.status !== undefined) {
      updateFields.push(`status = $${paramIndex}`);
      values.push(data.status);
      paramIndex++;
    }
    if (data.assignedTo !== undefined) {
      updateFields.push(`assigned_to = $${paramIndex}`);
      values.push(data.assignedTo);
      paramIndex++;
    }
    if (data.scheduledDate !== undefined) {
      updateFields.push(`requested_date = $${paramIndex}`);
      const scheduledDateValue = data.scheduledDate instanceof Timestamp 
        ? data.scheduledDate.toDate() 
        : (typeof data.scheduledDate === 'string' ? new Date(data.scheduledDate) : data.scheduledDate);
      values.push(scheduledDateValue);
      paramIndex++;
    }
    if (data.completedDate !== undefined) {
      updateFields.push(`completed_date = $${paramIndex}`);
      const completedDateValue = data.completedDate instanceof Timestamp 
        ? data.completedDate.toDate() 
        : (typeof data.completedDate === 'string' ? new Date(data.completedDate) : data.completedDate);
      values.push(completedDateValue);
      paramIndex++;
    }
    if (data.cost !== undefined) {
      updateFields.push(`cost = $${paramIndex}`);
      values.push(data.cost);
      paramIndex++;
    }
    if (data.notes !== undefined) {
      updateFields.push(`notes = $${paramIndex}`);
      values.push(data.notes);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE ${this.tableName}
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.query(query, values);
    return result.rows.length > 0 ? this.mapRowToEntity(result.rows[0]) : null;
  }
}
