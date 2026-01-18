import { BaseRepository } from './base.repository';
import { Attendance } from '../modules/human-resource/models/employee.model';
import { Timestamp } from 'firebase-admin/firestore';

export class AttendanceRepository extends BaseRepository<Attendance> {
  constructor() {
    super('attendance');
  }

  protected mapRowToEntity(row: any): Attendance {
    return {
      id: row.id,
      employeeId: row.employee_id.toString(), // Convert UUID to string
      date: Timestamp.fromDate(new Date(row.date)),
      checkIn: row.check_in_time ? Timestamp.fromDate(new Date(row.check_in_time)) : null,
      checkOut: row.check_out_time ? Timestamp.fromDate(new Date(row.check_out_time)) : null,
      status: row.status,
      notes: row.notes || '',
      createdAt: Timestamp.fromDate(new Date(row.created_at)),
      updatedAt: Timestamp.fromDate(new Date(row.updated_at)),
    };
  }

  /**
   * Find attendance by employee ID and date
   */
  async findByEmployeeAndDate(employeeId: string, date: Date): Promise<Attendance | null> {
    const result = await this.query(
      `SELECT a.* FROM ${this.tableName} a
       JOIN employees e ON a.employee_id = e.id
       WHERE e.employee_id = $1 AND a.date = $2
       LIMIT 1`,
      [employeeId, date.toISOString().split('T')[0]]
    );
    return result.rows.length > 0 ? this.mapRowToEntity(result.rows[0]) : null;
  }

  /**
   * Find attendance by employee ID (UUID)
   */
  async findByEmployeeId(employeeId: string, limit?: number, offset?: number): Promise<Attendance[]> {
    let query = `
      SELECT a.* FROM ${this.tableName} a
      JOIN employees e ON a.employee_id = e.id
      WHERE e.employee_id = $1
      ORDER BY a.date DESC
    `;
    const params: any[] = [employeeId];
    let paramIndex = 2;

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
   * Create attendance
   */
  async createAttendance(data: {
    employeeId: string; // UUID from employees table
    date: Date;
    checkInTime?: Date;
    checkOutTime?: Date;
    status: string;
    notes?: string;
    createdBy?: string;
  }): Promise<Attendance> {
    const fields = ['employee_id', 'date', 'check_in_time', 'check_out_time', 'status', 'notes', 'created_by'];
    const values = [
      data.employeeId,
      data.date.toISOString().split('T')[0], // Date only
      data.checkInTime || null,
      data.checkOutTime || null,
      data.status,
      data.notes || null,
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
   * Update attendance
   */
  async updateAttendance(id: string, data: Partial<Attendance>): Promise<Attendance | null> {
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.checkIn !== undefined) {
      updateFields.push(`check_in_time = $${paramIndex}`);
      const checkInDate = data.checkIn instanceof Timestamp 
        ? data.checkIn.toDate() 
        : (typeof data.checkIn === 'string' ? new Date(data.checkIn) : data.checkIn);
      values.push(checkInDate);
      paramIndex++;
    }
    if (data.checkOut !== undefined) {
      updateFields.push(`check_out_time = $${paramIndex}`);
      const checkOutDate = data.checkOut instanceof Timestamp 
        ? data.checkOut.toDate() 
        : (typeof data.checkOut === 'string' ? new Date(data.checkOut) : data.checkOut);
      values.push(checkOutDate);
      paramIndex++;
    }
    if (data.status !== undefined) {
      updateFields.push(`status = $${paramIndex}`);
      values.push(data.status);
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
