import { BaseRepository } from './base.repository';
import { Task } from '../modules/employee-task-manager/models/task.model';
import { Timestamp } from 'firebase-admin/firestore';

export class TaskRepository extends BaseRepository<Task> {
  constructor() {
    super('tasks');
  }

  protected mapRowToEntity(row: any): Task {
    return {
      id: row.id,
      title: row.title,
      description: row.description || '',
      assignedTo: row.assigned_to,
      assignedBy: row.assigned_by,
      status: row.status,
      priority: row.priority,
      dueDate: Timestamp.fromDate(new Date(row.due_date)),
      createdAt: Timestamp.fromDate(new Date(row.created_at)),
      updatedAt: Timestamp.fromDate(new Date(row.updated_at)),
      createdBy: row.created_by,
      tags: row.tags || [],
      attachments: row.attachments || [],
    };
  }

  /**
   * Find tasks with filters
   */
  async findWithFilters(filters: {
    status?: string;
    priority?: string;
    assignedTo?: string;
    assignedBy?: string;
  }, limit?: number, offset?: number): Promise<Task[]> {
    let query = `SELECT * FROM ${this.tableName}`;
    const params: any[] = [];
    const conditions: string[] = [];
    let paramIndex = 1;

    if (filters.status) {
      conditions.push(`status = $${paramIndex}`);
      params.push(filters.status);
      paramIndex++;
    }
    if (filters.priority) {
      conditions.push(`priority = $${paramIndex}`);
      params.push(filters.priority);
      paramIndex++;
    }
    if (filters.assignedTo) {
      conditions.push(`assigned_to = $${paramIndex}`);
      params.push(filters.assignedTo);
      paramIndex++;
    }
    if (filters.assignedBy) {
      conditions.push(`assigned_by = $${paramIndex}`);
      params.push(filters.assignedBy);
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
   * Create task
   */
  async createTask(data: {
    title: string;
    description: string;
    assignedTo: string;
    assignedBy: string;
    priority: string;
    dueDate: Date;
    tags?: string[];
    createdBy?: string;
  }): Promise<Task> {
    const fields = [
      'title', 'description', 'assigned_to', 'assigned_by',
      'status', 'priority', 'due_date', 'tags', 'created_by'
    ];
    const values = [
      data.title,
      data.description,
      data.assignedTo,
      data.assignedBy,
      'pending', // Default status
      data.priority,
      data.dueDate,
      JSON.stringify(data.tags || []),
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
   * Update task
   */
  async updateTask(id: string, data: Partial<Task>): Promise<Task | null> {
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
    if (data.assignedTo !== undefined) {
      updateFields.push(`assigned_to = $${paramIndex}`);
      values.push(data.assignedTo);
      paramIndex++;
    }
    if (data.status !== undefined) {
      updateFields.push(`status = $${paramIndex}`);
      values.push(data.status);
      paramIndex++;
      // Set completed_at if status is completed
      if (data.status === 'completed') {
        updateFields.push(`completed_at = $${paramIndex}`);
        values.push(new Date());
        paramIndex++;
      }
    }
    if (data.priority !== undefined) {
      updateFields.push(`priority = $${paramIndex}`);
      values.push(data.priority);
      paramIndex++;
    }
    if (data.dueDate !== undefined) {
      updateFields.push(`due_date = $${paramIndex}`);
      values.push(data.dueDate instanceof Timestamp ? data.dueDate.toDate() : new Date(data.dueDate));
      paramIndex++;
    }
    if (data.tags !== undefined) {
      updateFields.push(`tags = $${paramIndex}`);
      values.push(JSON.stringify(data.tags));
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
