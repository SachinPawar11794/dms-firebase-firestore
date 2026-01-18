import { BaseRepository } from './base.repository';
import { TaskMaster } from '../modules/employee-task-manager/models/task-master.model';
import { Timestamp } from 'firebase-admin/firestore';

export class TaskMasterRepository extends BaseRepository<TaskMaster> {
  constructor() {
    super('task_masters');
  }

  protected mapRowToEntity(row: any): TaskMaster {
    const customSchedule = typeof row.custom_schedule === 'string' 
      ? JSON.parse(row.custom_schedule) 
      : (row.custom_schedule || {});
    
    return {
      id: row.id,
      title: row.title,
      description: row.description || '',
      plantId: row.assigned_to_plant || '',
      assignedTo: row.assigned_to || '',
      assignedBy: row.assigned_by || row.created_by || '',
      priority: row.priority,
      frequency: row.frequency,
      frequencyValue: customSchedule.frequencyValue,
      frequencyUnit: customSchedule.frequencyUnit,
      startDate: Timestamp.fromDate(new Date(row.created_at)), // Use created_at as startDate
      isActive: row.is_active,
      tags: Array.isArray(row.tags) ? row.tags : [],
      estimatedDuration: row.estimated_duration || 0,
      instructions: row.instructions,
      createdAt: Timestamp.fromDate(new Date(row.created_at)),
      updatedAt: Timestamp.fromDate(new Date(row.updated_at)),
      createdBy: row.created_by || '',
      lastGenerated: row.last_generated_at ? Timestamp.fromDate(new Date(row.last_generated_at)) : undefined,
    };
  }

  /**
   * Find task masters with filters
   */
  async findWithFilters(filters: {
    plantId?: string;
    assignedTo?: string;
    assignedBy?: string;
    frequency?: string;
    isActive?: boolean;
  }, limit?: number, offset?: number): Promise<TaskMaster[]> {
    let query = `SELECT * FROM ${this.tableName}`;
    const params: any[] = [];
    const conditions: string[] = [];
    let paramIndex = 1;

    if (filters.plantId) {
      conditions.push(`assigned_to_plant = $${paramIndex}`);
      params.push(filters.plantId);
      paramIndex++;
    }
    if (filters.assignedTo) {
      conditions.push(`assigned_to = $${paramIndex}`);
      params.push(filters.assignedTo);
      paramIndex++;
    }
    if (filters.assignedBy) {
      conditions.push(`created_by = $${paramIndex}`);
      params.push(filters.assignedBy);
      paramIndex++;
    }
    if (filters.frequency) {
      conditions.push(`frequency = $${paramIndex}`);
      params.push(filters.frequency);
      paramIndex++;
    }
    if (filters.isActive !== undefined) {
      conditions.push(`is_active = $${paramIndex}`);
      params.push(filters.isActive);
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
   * Create task master
   */
  async createTaskMaster(data: {
    title: string;
    description: string;
    plantId?: string;
    assignedTo?: string;
    assignedToDepartment?: string;
    priority: string;
    frequency: string;
    customSchedule?: any;
    estimatedDuration?: number;
    isActive?: boolean;
    createdBy?: string;
  }): Promise<TaskMaster> {
    const fields = [
      'title', 'description', 'frequency', 'priority',
      'assigned_to_plant', 'assigned_to', 'assigned_to_department',
      'custom_schedule', 'estimated_duration', 'is_active', 'created_by'
    ];
    const values = [
      data.title,
      data.description,
      data.frequency,
      data.priority,
      data.plantId || null,
      data.assignedTo || null,
      data.assignedToDepartment || null,
      JSON.stringify(data.customSchedule || {}),
      data.estimatedDuration || null,
      data.isActive !== undefined ? data.isActive : true,
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
   * Update task master
   */
  async updateTaskMaster(id: string, data: Partial<TaskMaster>): Promise<TaskMaster | null> {
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
    if (data.plantId !== undefined) {
      updateFields.push(`assigned_to_plant = $${paramIndex}`);
      values.push(data.plantId);
      paramIndex++;
    }
    if (data.assignedTo !== undefined) {
      updateFields.push(`assigned_to = $${paramIndex}`);
      values.push(data.assignedTo);
      paramIndex++;
    }
    if (data.priority !== undefined) {
      updateFields.push(`priority = $${paramIndex}`);
      values.push(data.priority);
      paramIndex++;
    }
    if (data.frequency !== undefined) {
      updateFields.push(`frequency = $${paramIndex}`);
      values.push(data.frequency);
      paramIndex++;
    }
    if (data.frequencyValue !== undefined || data.frequencyUnit !== undefined) {
      // Get existing custom_schedule or create new
      const existing = await this.findById(id);
      const customSchedule = existing ? (this.mapRowToEntity(existing as any).frequencyValue ? { frequencyValue: data.frequencyValue, frequencyUnit: data.frequencyUnit } : {}) : {};
      if (data.frequencyValue !== undefined) customSchedule.frequencyValue = data.frequencyValue;
      if (data.frequencyUnit !== undefined) customSchedule.frequencyUnit = data.frequencyUnit;
      updateFields.push(`custom_schedule = $${paramIndex}`);
      values.push(JSON.stringify(customSchedule));
      paramIndex++;
    }
    if (data.estimatedDuration !== undefined) {
      updateFields.push(`estimated_duration = $${paramIndex}`);
      values.push(data.estimatedDuration);
      paramIndex++;
    }
    if (data.isActive !== undefined) {
      updateFields.push(`is_active = $${paramIndex}`);
      values.push(data.isActive);
      paramIndex++;
    }
    if (data.lastGenerated !== undefined) {
      updateFields.push(`last_generated_at = $${paramIndex}`);
      values.push(data.lastGenerated instanceof Timestamp ? data.lastGenerated.toDate() : new Date(data.lastGenerated));
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
