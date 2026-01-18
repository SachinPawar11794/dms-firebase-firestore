import { BaseRepository } from './base.repository';
import { TaskInstance } from '../modules/employee-task-manager/models/task-instance.model';
import { Timestamp } from 'firebase-admin/firestore';

export class TaskInstanceRepository extends BaseRepository<TaskInstance> {
  constructor() {
    super('task_instances');
  }

  protected mapRowToEntity(row: any): TaskInstance {
    return {
      id: row.id,
      taskMasterId: row.task_master_id,
      title: row.title,
      description: row.description || '',
      plantId: '', // Will need to join with task_master or store separately
      assignedTo: row.assigned_to,
      assignedBy: row.assigned_by,
      status: row.status,
      priority: row.priority,
      dueDate: Timestamp.fromDate(new Date(row.due_date)),
      scheduledDate: Timestamp.fromDate(new Date(row.scheduled_date)),
      completedAt: row.completed_at ? Timestamp.fromDate(new Date(row.completed_at)) : undefined,
      tags: [],
      attachments: [],
      notes: row.notes,
      estimatedDuration: 0, // Will need to join or store
      actualDuration: row.actual_duration,
      instructions: row.instructions,
      createdAt: Timestamp.fromDate(new Date(row.created_at)),
      updatedAt: Timestamp.fromDate(new Date(row.updated_at)),
      createdBy: row.created_by,
    };
  }

  /**
   * Find task instances with filters
   */
  async findWithFilters(filters: {
    taskMasterId?: string;
    assignedTo?: string;
    status?: string;
    scheduledDateFrom?: Date;
    scheduledDateTo?: Date;
    dueDateFrom?: Date;
    dueDateTo?: Date;
  }, limit?: number, offset?: number): Promise<TaskInstance[]> {
    let query = `SELECT * FROM ${this.tableName}`;
    const params: any[] = [];
    const conditions: string[] = [];
    let paramIndex = 1;

    if (filters.taskMasterId) {
      conditions.push(`task_master_id = $${paramIndex}`);
      params.push(filters.taskMasterId);
      paramIndex++;
    }
    if (filters.assignedTo) {
      conditions.push(`assigned_to = $${paramIndex}`);
      params.push(filters.assignedTo);
      paramIndex++;
    }
    if (filters.status) {
      conditions.push(`status = $${paramIndex}`);
      params.push(filters.status);
      paramIndex++;
    }
    if (filters.scheduledDateFrom) {
      conditions.push(`scheduled_date >= $${paramIndex}`);
      params.push(filters.scheduledDateFrom);
      paramIndex++;
    }
    if (filters.scheduledDateTo) {
      conditions.push(`scheduled_date <= $${paramIndex}`);
      params.push(filters.scheduledDateTo);
      paramIndex++;
    }
    if (filters.dueDateFrom) {
      conditions.push(`due_date >= $${paramIndex}`);
      params.push(filters.dueDateFrom);
      paramIndex++;
    }
    if (filters.dueDateTo) {
      conditions.push(`due_date <= $${paramIndex}`);
      params.push(filters.dueDateTo);
      paramIndex++;
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY scheduled_date DESC, created_at DESC`;

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
   * Create task instance
   */
  async createTaskInstance(data: {
    taskMasterId: string;
    title: string;
    description: string;
    assignedTo: string;
    assignedBy?: string;
    priority: string;
    dueDate: Date;
    scheduledDate: Date;
    createdBy?: string;
  }): Promise<TaskInstance> {
    const fields = [
      'task_master_id', 'title', 'description', 'assigned_to', 'assigned_by',
      'status', 'priority', 'due_date', 'scheduled_date', 'created_by'
    ];
    const values = [
      data.taskMasterId,
      data.title,
      data.description,
      data.assignedTo,
      data.assignedBy || null,
      'pending',
      data.priority,
      data.dueDate,
      data.scheduledDate,
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
   * Update task instance
   */
  async updateTaskInstance(id: string, data: Partial<TaskInstance>): Promise<TaskInstance | null> {
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.status !== undefined) {
      updateFields.push(`status = $${paramIndex}`);
      values.push(data.status);
      paramIndex++;
      if (data.status === 'completed') {
        updateFields.push(`completed_at = $${paramIndex}`);
        values.push(new Date());
        paramIndex++;
      }
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
