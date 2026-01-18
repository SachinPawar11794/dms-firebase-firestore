import { BaseRepository } from './base.repository';
import { Employee } from '../modules/human-resource/models/employee.model';
import { Timestamp } from 'firebase-admin/firestore';

export class EmployeeRepository extends BaseRepository<Employee> {
  constructor() {
    super('employees');
  }

  protected mapRowToEntity(row: any): Employee {
    const personalInfo = typeof row.personal_info === 'string' 
      ? JSON.parse(row.personal_info) 
      : row.personal_info;
    const employmentInfo = typeof row.employment_info === 'string'
      ? JSON.parse(row.employment_info)
      : row.employment_info;

    return {
      id: row.id,
      employeeId: row.employee_id,
      personalInfo: {
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName,
        email: personalInfo.email,
        phone: personalInfo.phone,
        address: personalInfo.address,
        dateOfBirth: Timestamp.fromDate(new Date(personalInfo.dateOfBirth)),
      },
      employmentInfo: {
        department: employmentInfo.department,
        position: employmentInfo.position,
        hireDate: Timestamp.fromDate(new Date(employmentInfo.hireDate)),
        salary: employmentInfo.salary,
        employmentType: employmentInfo.employmentType,
      },
      documents: row.documents || [],
      createdAt: Timestamp.fromDate(new Date(row.created_at)),
      updatedAt: Timestamp.fromDate(new Date(row.updated_at)),
    };
  }

  /**
   * Find employee by employee ID
   */
  async findByEmployeeId(employeeId: string): Promise<Employee | null> {
    const result = await this.query(
      `SELECT * FROM ${this.tableName} WHERE employee_id = $1 LIMIT 1`,
      [employeeId]
    );
    return result.rows.length > 0 ? this.mapRowToEntity(result.rows[0]) : null;
  }

  /**
   * Create employee
   */
  async createEmployee(data: {
    employeeId: string;
    personalInfo: any;
    employmentInfo: any;
    documents?: string[];
    plantId?: string;
    createdBy?: string;
  }): Promise<Employee> {
    const fields = ['employee_id', 'personal_info', 'employment_info', 'documents', 'plant_id', 'created_by'];
    const values = [
      data.employeeId,
      JSON.stringify(data.personalInfo),
      JSON.stringify(data.employmentInfo),
      data.documents || [],
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
   * Update employee
   */
  async updateEmployee(id: string, data: Partial<Employee>): Promise<Employee | null> {
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.personalInfo) {
      // Get existing employee to merge
      const existing = await this.findById(id);
      const currentPersonalInfo = existing ? this.mapRowToEntity(existing as any).personalInfo : {};
      const mergedPersonalInfo = { ...currentPersonalInfo, ...data.personalInfo };
      updateFields.push(`personal_info = $${paramIndex}`);
      values.push(JSON.stringify(mergedPersonalInfo));
      paramIndex++;
    }
    if (data.employmentInfo) {
      const existing = await this.findById(id);
      const currentEmploymentInfo = existing ? this.mapRowToEntity(existing as any).employmentInfo : {};
      const mergedEmploymentInfo = { ...currentEmploymentInfo, ...data.employmentInfo };
      updateFields.push(`employment_info = $${paramIndex}`);
      values.push(JSON.stringify(mergedEmploymentInfo));
      paramIndex++;
    }
    if (data.documents !== undefined) {
      updateFields.push(`documents = $${paramIndex}`);
      values.push(data.documents);
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
