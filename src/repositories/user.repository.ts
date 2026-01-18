import { BaseRepository } from './base.repository';
import { User } from '../models/user.model';
import { Timestamp } from 'firebase-admin/firestore';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('users');
  }

  protected mapRowToEntity(row: any): User {
    return {
      id: row.id,
      email: row.email,
      displayName: row.display_name,
      role: row.role,
      modulePermissions: row.module_permissions || {},
      createdAt: Timestamp.fromDate(new Date(row.created_at)),
      updatedAt: Timestamp.fromDate(new Date(row.updated_at)),
      isActive: row.is_active,
      employeeId: row.employee_id,
      plant: row.plant,
      department: row.department,
      designation: row.designation,
      contactNo: row.contact_no,
    };
  }

  /**
   * Find user by Firebase UID
   */
  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    const result = await this.query(
      `SELECT * FROM ${this.tableName} WHERE firebase_uid = $1`,
      [firebaseUid]
    );
    return result.rows.length > 0 ? this.mapRowToEntity(result.rows[0]) : null;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const result = await this.query(
      `SELECT * FROM ${this.tableName} WHERE email = $1`,
      [email]
    );
    return result.rows.length > 0 ? this.mapRowToEntity(result.rows[0]) : null;
  }

  /**
   * Create user with Firebase UID
   */
  async createWithFirebaseUid(data: {
    firebaseUid: string;
    email: string;
    displayName: string;
    role: string;
    modulePermissions?: any;
    isActive?: boolean;
    employeeId?: string;
    plant?: string;
    department?: string;
    designation?: string;
    contactNo?: string;
    createdBy?: string;
  }): Promise<User> {
    const fields = [
      'firebase_uid', 'email', 'display_name', 'role', 
      'module_permissions', 'is_active', 'employee_id', 
      'plant', 'department', 'designation', 'contact_no', 'created_by'
    ];
    const values = [
      data.firebaseUid,
      data.email,
      data.displayName,
      data.role,
      JSON.stringify(data.modulePermissions || {}),
      data.isActive !== undefined ? data.isActive : true,
      data.employeeId || null,
      data.plant || null,
      data.department || null,
      data.designation || null,
      data.contactNo || null,
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
   * Update user by Firebase UID
   */
  async updateByFirebaseUid(firebaseUid: string, data: Partial<User>): Promise<User | null> {
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.displayName !== undefined) {
      updateFields.push(`display_name = $${paramIndex}`);
      values.push(data.displayName);
      paramIndex++;
    }
    if (data.role !== undefined) {
      updateFields.push(`role = $${paramIndex}`);
      values.push(data.role);
      paramIndex++;
    }
    if (data.modulePermissions !== undefined) {
      updateFields.push(`module_permissions = $${paramIndex}`);
      values.push(JSON.stringify(data.modulePermissions));
      paramIndex++;
    }
    if (data.isActive !== undefined) {
      updateFields.push(`is_active = $${paramIndex}`);
      values.push(data.isActive);
      paramIndex++;
    }
    if (data.employeeId !== undefined) {
      updateFields.push(`employee_id = $${paramIndex}`);
      values.push(data.employeeId);
      paramIndex++;
    }
    if (data.plant !== undefined) {
      updateFields.push(`plant = $${paramIndex}`);
      values.push(data.plant);
      paramIndex++;
    }
    if (data.department !== undefined) {
      updateFields.push(`department = $${paramIndex}`);
      values.push(data.department);
      paramIndex++;
    }
    if (data.designation !== undefined) {
      updateFields.push(`designation = $${paramIndex}`);
      values.push(data.designation);
      paramIndex++;
    }
    if (data.contactNo !== undefined) {
      updateFields.push(`contact_no = $${paramIndex}`);
      values.push(data.contactNo);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      return this.findByFirebaseUid(firebaseUid);
    }

    values.push(firebaseUid);
    const query = `
      UPDATE ${this.tableName}
      SET ${updateFields.join(', ')}
      WHERE firebase_uid = $${paramIndex}
      RETURNING *
    `;

    const result = await this.query(query, values);
    return result.rows.length > 0 ? this.mapRowToEntity(result.rows[0]) : null;
  }
}
